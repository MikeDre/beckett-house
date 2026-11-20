import {
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_API_VERSION,
} from "../lib/sanity/config";
import { isOpenJob, type Job } from "../lib/careers";
import { locations } from "../lib/content";
import { getNotificationSettings } from "../lib/site-data";
import { emailBody, sendEmail } from "./forms";
import { appendSheetRow } from "./google-sheets";
import type { Env, ExecutionContext } from "./index";
const reply = (status: number, error?: string) =>
  Response.json(error ? { ok: false, error } : { ok: true }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
export const CV_MAX_BYTES = 5 * 1024 * 1024;
// Raw bytes per stored row, comfortably under D1's 2 MB row limit.
export const CV_PART_BYTES = 1_000_000;
const cvTypes = {
  pdf: { type: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  docx: {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    magic: [0x50, 0x4b, 0x03, 0x04],
  },
  doc: { type: "application/msword", magic: [0xd0, 0xcf, 0x11, 0xe0] },
} as const;
export function validateCv(value: unknown) {
  const invalid = "Please attach your CV as a PDF or Word document up to 5 MB.";
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Please attach your CV.");
  const { name, data } = value as Record<string, unknown>;
  if (typeof name !== "string" || typeof data !== "string" || !data)
    throw new Error("Please attach your CV.");
  const extension = name.split(".").pop()?.toLowerCase() as keyof typeof cvTypes;
  const format = cvTypes[extension];
  if (!format || name.length > 200 || !/^[A-Za-z0-9+/]+={0,2}$/.test(data))
    throw new Error(invalid);
  const bytes = new Uint8Array(Buffer.from(data, "base64"));
  // The content must match the extension, so renamed files are rejected.
  if (
    !bytes.length ||
    bytes.length > CV_MAX_BYTES ||
    format.magic.some((byte, i) => bytes[i] !== byte)
  )
    throw new Error(invalid);
  const safeName =
    name.replace(/[^\w .()-]+/g, "_").replace(/^[.\s]+/, "").slice(-120) ||
    `cv.${extension}`;
  return { name: safeName, type: format.type, bytes, base64: data };
}
const fileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
export function validateCareerApplication(data: Record<string, unknown>) {
  const read = (name: string, limit: number) => {
    const value = data[name];
    if (typeof value !== "string" || !value.trim() || value.length > limit)
      throw new Error(`Please check ${name} and complete all required fields.`);
    return value.trim();
  };
  const email = read("email", 254);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))
    throw new Error("Please enter a valid email address.");
  const answers = ["qualification", "shifts"].map((key) => {
    const value = read(key, 3);
    if (!["Yes", "No"].includes(value))
      throw new Error("Please answer both qualifying questions.");
    if (value !== "Yes")
      throw new Error(
        "This role requires a Level 3 qualification and availability for the listed shifts.",
      );
    return value;
  });
  const cv = validateCv(data.cv);
  if (data.consent !== "Yes")
    throw new Error("Please confirm your application details.");
  const additional = data.additional ?? "";
  if (typeof additional !== "string" || additional.length > 2000)
    throw new Error("Please shorten your additional information.");
  return {
    jobId: read("jobId", 200),
    token: read("turnstileToken", 2048),
    name: read("name", 200),
    email,
    cv,
    fields: [
      ["Full name", read("name", 200)],
      ["Email", email],
      ["Phone number", read("phone", 200)],
      ["Level 3 or above qualification", answers[0]],
      ["Available for listed shifts", answers[1]],
      ["Notice period / earliest start", read("availability", 200)],
      ["Qualifications", read("qualifications", 4000)],
      ["Employment history and experience", read("experience", 8000)],
      ["Why Beckett House", read("motivation", 4000)],
      ["Additional information", additional.trim() || "Not provided"],
      ["CV", `${cv.name} (${fileSize(cv.bytes.length)})`],
      ["Declaration", "Confirmed"],
    ] as Array<[string, string]>,
  };
}
export async function handleCareerApplication(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
) {
  if (request.headers.get("Origin") !== new URL(request.url).origin)
    return reply(403, "Please submit from this website.");
  if (!request.headers.get("Content-Type")?.includes("application/json"))
    return reply(415, "Please send JSON.");
  let application: ReturnType<typeof validateCareerApplication>;
  try {
    const body = await request.text();
    // Text answers plus a base64-encoded CV.
    if (body.length > 35000 + Math.ceil(CV_MAX_BYTES / 3) * 4)
      return reply(413, "Please shorten your application.");
    const data = JSON.parse(body);
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error("Invalid application.");
    if (data.website) return reply(200);
    application = validateCareerApplication(data);
  } catch (error) {
    return reply(
      400,
      error instanceof Error ? error.message : "Please check your application.",
    );
  }
  if (!env.RESEND_API_KEY || !env.FORM_FROM_EMAIL || !env.TURNSTILE_SECRET_KEY)
    return reply(
      503,
      "Applications are temporarily unavailable. Please try again later.",
    );
  try {
    const verification = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: application.token,
          ...(request.headers.get("CF-Connecting-IP")
            ? { remoteip: request.headers.get("CF-Connecting-IP")! }
            : {}),
        }),
        signal: AbortSignal.timeout(15000),
      },
    );
    if (
      !verification.ok ||
      !((await verification.json()) as { success: boolean }).success
    )
      return reply(400, "Please complete the spam protection check again.");
    const jobUrl = new URL(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`,
    );
    jobUrl.searchParams.set("query", '*[_type=="job" && _id==$id][0]');
    jobUrl.searchParams.set("$id", JSON.stringify(application.jobId));
    jobUrl.searchParams.set("perspective", "published");
    const jobResponse = await fetch(jobUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (!jobResponse.ok) throw new Error("Could not verify vacancy");
    const { result: job } = (await jobResponse.json()) as {
      result: Job | null;
    };
    if (!job || !isOpenJob(job) || job.isSample)
      return reply(400, "This role is not accepting applications.");
    const nursery = locations.find(
      (location) => location.slug === job.location,
    );
    if (!nursery) return reply(400, "This role is unavailable.");
    const fields: Array<[string, string]> = [
      ["Role", job.title],
      ["Job reference", job._id],
      ["Nursery", nursery.name],
      ...application.fields,
    ];
    const notifications = await getNotificationSettings(env.DB);
    const createdAt = new Date().toISOString();
    // Persist before delivery so a failed notification never loses the application.
    // One batch is one transaction, so the CV is saved with its submission or not at all.
    const { cv } = application;
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO submissions (created_at,kind,nursery,name,email,fields) VALUES (?,?,?,?,?,?)",
      ).bind(
        createdAt,
        "careers",
        nursery.slug,
        application.name,
        application.email,
        JSON.stringify(fields),
      ),
      ...Array.from(
        { length: Math.ceil(cv.bytes.length / CV_PART_BYTES) },
        (_, part) =>
          env.DB.prepare(
            "INSERT INTO submission_files (submission_id,part,name,type,data) VALUES ((SELECT max(id) FROM submissions),?,?,?,?)",
          ).bind(
            part,
            cv.name,
            cv.type,
            cv.bytes.subarray(part * CV_PART_BYTES, (part + 1) * CV_PART_BYTES),
          ),
      ),
    ]);
    const bcc = notifications
      ? [
          ...new Set([
            ...notifications.copies.all,
            ...notifications.copies[nursery.slug],
          ]),
        ].join(",")
      : env.FORM_BCC;
    ctx.waitUntil(
      sendEmail(
        env,
        nursery.email,
        application.email,
        `Job application: ${job.title.replace(/[\r\n]/g, " ")} — ${application.name.replace(/[\r\n]/g, " ")}`,
        emailBody(
          "New job application",
          `An application for ${job.title} at ${nursery.name}. Also available in the private submissions inbox.`,
          fields,
        ),
        bcc,
        [{ filename: cv.name, content: cv.base64 }],
      ).catch((error) =>
        console.error(
          "Career notification failed; application saved in inbox",
          error,
        ),
      ),
    );
    ctx.waitUntil(
      sendEmail(
        env,
        application.email,
        nursery.email,
        "Your application — Beckett House Montessori",
        emailBody(
          "Application received",
          `Thank you for applying for ${job.title}. Our team will review your application and contact you about next steps.`,
          fields,
        ),
      ).catch((error) => console.error("Career confirmation failed", error)),
    );
    ctx.waitUntil(
      appendSheetRow(
        env,
        "Careers applications",
        [createdAt, ...fields.map(([, value]) => value)],
        fields.map((_, i) => i + 1),
        ["Received", ...fields.map(([label]) => label)],
      ).catch((error) =>
        console.error(
          "Career spreadsheet append failed; application saved in inbox",
          error,
        ),
      ),
    );
    return reply(200);
  } catch (error) {
    console.error("Career application failed", error);
    return reply(
      502,
      "We couldn’t save your application. Please try again shortly.",
    );
  }
}
