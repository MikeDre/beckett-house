import { locations } from "../lib/content";
import { registrationContent } from "../app/register/register-content";
import type { Env, ExecutionContext } from "./index";
import { appendSheetRow } from "./google-sheets";

type FormKind = "visit" | "register";
type Fields = Array<[string, string]>;
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const unavailable = "Sorry, we couldn't send your request just now. Please try again shortly or contact the nursery directly.";

function json(ok: boolean, status = 200, error?: string) {
  return Response.json(error ? { ok, error } : { ok }, { status, headers: { "Cache-Control": "no-store" } });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

function emailBody(heading: string, intro: string, fields: Fields) {
  return {
    text: `${heading}\n\n${intro}\n\n${fields.map(([label, value]) => `${label}: ${value}`).join("\n")}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#263247;line-height:1.6"><h1 style="color:#233a72;font-size:24px">${escapeHtml(heading)}</h1><p style="white-space:pre-line">${escapeHtml(intro)}</p><h2 style="color:#233a72;font-size:18px">Your submission</h2>${fields.map(([label, value]) => `<p><strong>${escapeHtml(label)}</strong><br><span style="white-space:pre-wrap">${escapeHtml(value)}</span></p>`).join("")}<p style="color:#233a72">Beckett House Montessori</p></div>`,
  };
}

async function sendEmail(env: Env, to: string, replyTo: string, subject: string, body: ReturnType<typeof emailBody>) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.FORM_FROM_EMAIL, to: [to], reply_to: replyTo, subject, ...body }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Resend email failed (${response.status}).`);
}

export async function handleForm(request: Request, env: Env, ctx: ExecutionContext, kind: FormKind): Promise<Response> {
  let data: Record<string, unknown>;
  try {
    if (!request.headers.get("Content-Type")?.includes("application/json")) return json(false, 415, "Please send the form as JSON.");
    const body = await request.text();
    if (body.length > 40000) return json(false, 413, "Your request is too long. Please shorten your answers and try again.");
    const parsed: unknown = JSON.parse(body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid JSON object");
    data = parsed as Record<string, unknown>;
  } catch {
    return json(false, 400, "We couldn't read your request. Please try again.");
  }
  if (typeof data.website === "string" && data.website.trim()) return json(true);
  if (!env.RESEND_API_KEY || !env.FORM_FROM_EMAIL || !env.TURNSTILE_SECRET_KEY) return json(false, 503, unavailable);

  let fields: Fields;
  let email: string;
  let person: string;
  const slug = kind === "visit" ? (data.location === "Angel" ? "angel" : data.location === "Abbey Road" ? "abbey-road" : undefined) : data.nursery;
  const nursery = locations.find((location) => location.slug === slug);
  if (!nursery) return json(false, 400, "Please choose Angel or Abbey Road nursery.");
  const content = registrationContent[nursery.slug];
  function text(name: string, required = false, limit = 2000) {
    const raw = data[name];
    if (raw !== undefined && typeof raw !== "string") throw new Error("Please check your form details and try again.");
    const value = ((raw as string | undefined) ?? "").trim();
    if (value.length > limit) throw new Error(`Please keep each answer to ${limit} characters or fewer.`);
    if (required && !value) throw new Error("Please complete all required fields.");
    return value;
  }
  function selected(name: string) {
    const values = data[name] ?? [];
    if (!Array.isArray(values) || values.length > 5 || values.some((day) => typeof day !== "string" || !days.includes(day)) || new Set(values).size !== values.length) throw new Error("Please choose valid attendance days.");
    return days.filter((day) => values.includes(day)).join(", ") || "None selected";
  }
  function date(name: string) {
    const value = text(name, true);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error("Please enter a valid date.");
    return value;
  }
  let token: string;
  try {
    email = text("email", true, 254);
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error("Please enter a valid email address.");
    token = text("turnstileToken", true, 2048);
    text("website");
    if (kind === "visit") {
      person = text("name", true, 200);
      fields = [["Location", nursery.name], ["Parent / carer", person], ["Email", email], ["Child's age", text("childAge", true)], ["Message", text("message") || "Not provided"]];
    } else {
      person = text("childName", true, 200);
      fields = [["Nursery", nursery.name], ["Child's full name", person], ["Date of birth", date("dateOfBirth")], ["Mother's full name", text("motherName", true)], ["Mother's mobile number", text("motherMobile", true)], ["Father's full name", text("fatherName", true)], ["Father's mobile number", text("fatherMobile", true)], ["Email", email], ["Home address", text("homeAddress") || "Not provided"], ["Home phone", text("homePhone") || "Not provided"], ["Planned starting date", date("startDate")], ["Full days (8am to 6pm)", selected("fullDays")], [`Mornings (${content.morning})`, selected("mornings")], [`Afternoons (${content.afternoon})`, selected("afternoons")]];
    }
  } catch (error) {
    return json(false, 400, error instanceof Error ? error.message : "Please check your form details.");
  }

  try {
    const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token, ...(request.headers.get("CF-Connecting-IP") ? { remoteip: request.headers.get("CF-Connecting-IP")! } : {}) }),
      signal: AbortSignal.timeout(15000),
    });
    if (!verification.ok) throw new Error(`Turnstile verification failed (${verification.status}).`);
    const result = await verification.json() as { success?: boolean };
    if (result.success !== true) return json(false, 400, "Please complete the spam protection check again and try sending your form.");
    const subject = `${kind === "visit" ? "Visit request" : "Registration"}: ${nursery.name}, ${person.replace(/[\r\n]/g, " ")}`;
    await sendEmail(env, nursery.email, email, subject, emailBody(`Beckett House ${nursery.name}`, kind === "visit" ? "A family would like to arrange a nursery visit." : "A family has submitted a registration.", fields));
  } catch (error) {
    console.error("Form notification failed:", error);
    return json(false, 502, unavailable);
  }

  const confirmation = kind === "visit" ? `Thank you for your visit request – Beckett House ${nursery.name}` : `We've received your registration – Beckett House ${nursery.name}`;
  const intro = `Thank you for ${kind === "visit" ? "your interest in visiting" : "registering your child with"} Beckett House ${nursery.name}. Our team will be in touch shortly, usually within two working days.\n\nIf you have any questions, please call ${nursery.phone} or email ${nursery.email}.\n\nHere is a copy of what you submitted.`;
  ctx.waitUntil(sendEmail(env, email, nursery.email, confirmation, emailBody(confirmation, intro, fields)).catch((error) => console.error("Form confirmation failed:", error)));
  const sheet = kind === "visit" ? (nursery.slug === "angel" ? env.SHEET_VISIT_ANGEL : env.SHEET_VISIT_ABBEY_ROAD) : (nursery.slug === "angel" ? env.SHEET_REGISTER_ANGEL : env.SHEET_REGISTER_ABBEY_ROAD);
  const timestamp = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "long" }).format(new Date());
  // Visit columns follow the form's input order; registration already does.
  const values = kind === "visit" ? [person, email, nursery.name, fields[3][1], fields[4][1]] : fields.map(([, value]) => value);
  ctx.waitUntil(appendSheetRow(env, sheet, [timestamp, ...values]).catch((error) => console.error("Form spreadsheet append failed:", error)));
  return json(true);
}
