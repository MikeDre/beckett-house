"use client";
import {trackCareerEvent,useCareerView} from "./tracking";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  careerQuestions,
  isOpenJob,
  locationName,
  type Job,
} from "../../lib/careers";
import { Turnstile, postForm } from "../turnstile";
import CardAnimation from "../card-animation";
import { getLocation } from "../../lib/content";
const CV_MAX_BYTES = 5 * 1024 * 1024;
const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("We couldn’t read your CV. Please choose it again."));
    reader.readAsDataURL(file);
  });
const fileSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
export default function ApplicationForm({ job }: { job: Job }) {
  useCareerView("application_start",job._id);
  const qualificationTracked=useRef(false);
  const [stage, setStage] = useState(1),
    [answers, setAnswers] = useState(["", ""]),
    [token, setToken] = useState(""),
    [reset, setReset] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [cv, setCv] = useState<File | null>(null),
    [cvError, setCvError] = useState("");
  const cvInput = useRef<HTMLInputElement>(null);
  function chooseCv(file: File | undefined) {
    setCvError("");
    if (!file) return setCv(null);
    const problem = !/\.(pdf|docx?)$/i.test(file.name)
      ? "Please choose a PDF or Word document."
      : file.size > CV_MAX_BYTES
        ? "Please choose a file up to 5 MB."
        : file.size === 0
          ? "This file looks empty. Please choose another."
          : "";
    if (problem) {
      setCvError(problem);
      setCv(null);
      if (cvInput.current) cvInput.current.value = "";
      return;
    }
    setCv(file);
    trackCareerEvent("cv_attached");
  }
  const heading = useRef<HTMLHeadingElement>(null);
  const eligible = answers.every((answer) => answer === "Yes");
  function next(e: FormEvent) {
    e.preventDefault();
    if (!eligible) return;
    if(!qualificationTracked.current){trackCareerEvent("qualification_complete");qualificationTracked.current=true;}
    setStage(2);
    setTimeout(() => heading.current?.focus(), 0);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (job.isSample) {
      setError(
        "This is a sample role. Submission will be available when a real vacancy is published.",
      );
      return;
    }
    setBusy(true);
    try {
      if (!cv) {
        setCvError("Please attach your CV.");
        cvInput.current?.focus();
        return;
      }
      const data = new FormData(e.currentTarget);
      data.delete("cv");
      data.set("jobId", job._id);
      data.set("qualification", answers[0]);
      data.set("shifts", answers[1]);
      await postForm("careers", data, token, undefined, {
        cv: { name: cv.name, data: await toBase64(cv) },
      });
      setSent(true);
      trackCareerEvent("application_submit");
      setTimeout(() => heading.current?.focus(), 0);
    } catch (e) {
      trackCareerEvent("application_error");
      setError(e instanceof Error ? e.message : "Please try again.");
      setToken("");
      setReset((n) => n + 1);
    } finally {
      setBusy(false);
    }
  }
  const steps = ["Before you apply", "Your application"];
  const contact = getLocation(job.location);
  const field = (
    name: string,
    label: string,
    options: {
      type?: string;
      autoComplete?: string;
      hint?: string;
      rows?: number;
      maxLength: number;
      optional?: boolean;
      placeholder?: string;
    },
  ) => {
    const hintId = options.hint ? `${name}-hint` : undefined;
    const props = {
      name,
      required: !options.optional,
      maxLength: options.maxLength,
      placeholder: options.placeholder,
      "aria-describedby": hintId,
    };
    return (
      <label key={name} className="career-field">
        <span className="career-label">
          {label}
          {options.optional && <span> (optional)</span>}
        </span>
        {options.hint && (
          <span className="career-hint" id={hintId}>
            {options.hint}
          </span>
        )}
        {options.rows ? (
          <textarea {...props} rows={options.rows} />
        ) : (
          <input
            {...props}
            type={options.type ?? "text"}
            autoComplete={options.autoComplete}
          />
        )}
      </label>
    );
  };
  return (
    <div className="career-application">
      <header className="career-job-heading">
        <div className="career-job-heading-inner">
          <a className="career-back" href={`/careers/${job.slug.current}`}>
            <span aria-hidden="true">←</span> Back to role
          </a>
          <p className="career-job-location">
            <span aria-hidden="true" className="career-dot" />
            {sent ? "Application sent" : "Application"} ·{" "}
            {locationName(job.location)}
          </p>
          <h1 ref={heading} tabIndex={-1}>
            {sent ? "Thank you for applying" : job.title}
          </h1>
        </div>
      </header>
      <div className="career-application-grid">
        <div className="career-application-main">
          {sent ? (
            <div className="career-success">
              <CardAnimation name="morphball" />
              <h2>We have received your application</h2>
              <p>
                A copy has been sent to your email address. Here is what
                happens next:
              </p>
              <ol>
                <li>Our team reads every application personally.</li>
                <li>
                  If your experience is a good match, we will contact you to
                  arrange an informal chat and a visit to the nursery.
                </li>
                <li>
                  Successful applicants complete references and an enhanced DBS
                  check before starting.
                </li>
              </ol>
              <Link className="career-button" href="/careers">
                Back to opportunities
              </Link>
            </div>
          ) : !isOpenJob(job) ? (
            <p className="career-notice">
              Applications for this role are closed.{" "}
              <Link href="/careers">See our current opportunities</Link>.
            </p>
          ) : (
            <>
              {job.isSample && (
                <p className="career-notice">
                  Sample role · You can review both steps. Sending is disabled.
                </p>
              )}
              <ol className="career-steps" aria-label="Application progress">
                {steps.map((label, i) => (
                  <li
                    key={label}
                    aria-current={stage === i + 1 ? "step" : undefined}
                    className={stage > i + 1 ? "is-done" : undefined}
                  >
                    <span aria-hidden="true">{stage > i + 1 ? "✓" : i + 1}</span>
                    <span className="visually-hidden">
                      Step {i + 1} of {steps.length}
                      {stage > i + 1 ? ", completed" : ""}:{" "}
                    </span>
                    {label}
                  </li>
                ))}
              </ol>
              {stage === 1 ? (
                <form onSubmit={next} className="career-form">
                  <h2>Before you apply</h2>
                  <p className="career-form-intro">
                    Two quick questions to check this role is right for you.
                  </p>
                  {careerQuestions.map((q, i) => (
                    <fieldset key={q} className="career-question">
                      <legend>{q}</legend>
                      <div className="career-radio">
                        {["Yes", "No"].map((answer) => (
                          <label key={answer}>
                            <input
                              required
                              type="radio"
                              name={`question${i}`}
                              value={answer}
                              checked={answers[i] === answer}
                              readOnly
                              onClick={() =>
                                setAnswers((current) =>
                                  current.map((v, j) =>
                                    j === i ? answer : v,
                                  ),
                                )
                              }
                            />
                            {answer}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                  <div aria-live="polite" id="eligibility-status">
                    {answers.includes("No") ? (
                      <p className="career-notice">
                        Sorry, this role requires a Level 3 (or above) Early
                        Years qualification and availability for the shifts
                        above. Please{" "}
                        <Link href="/careers">see our other opportunities</Link>
                        .
                      </p>
                    ) : (
                      !eligible && (
                        <p className="career-small">
                          Answer both questions to continue.
                        </p>
                      )
                    )}
                  </div>
                  <button
                    className="career-button"
                    disabled={!eligible}
                    aria-describedby={eligible ? undefined : "eligibility-status"}
                  >
                    Continue to your application{" "}
                    <span aria-hidden="true">→</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={submit} className="career-form">
                  <div className="career-form-heading">
                    <h2>Your application</h2>
                    <button
                      type="button"
                      className="career-link-button"
                      onClick={() => setStage(1)}
                    >
                      Change my answers
                    </button>
                  </div>
                  <fieldset disabled={busy}>
                    <fieldset className="career-group">
                      <legend>About you</legend>
                      <div className="career-form-grid">
                        {field("name", "Full name", {
                          autoComplete: "name",
                          maxLength: 200,
                        })}
                        {field("email", "Email address", {
                          type: "email",
                          autoComplete: "email",
                          maxLength: 254,
                        })}
                        {field("phone", "Phone number", {
                          type: "tel",
                          autoComplete: "tel",
                          maxLength: 200,
                        })}
                        {field("availability", "Notice period or earliest start", {
                          maxLength: 200,
                        })}
                      </div>
                    </fieldset>
                    <fieldset className="career-group">
                      <legend>Your experience</legend>
                      <div className="career-field">
                        <span className="career-label" id="cv-label">
                          CV
                        </span>
                        <span className="career-hint" id="cv-hint">
                          PDF or Word document, up to 5 MB.
                        </span>
                        <div
                          className={`career-upload${cv ? " has-file" : ""}${cvError ? " has-error" : ""}`}
                        >
                          <input
                            ref={cvInput}
                            type="file"
                            name="cv"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            aria-labelledby="cv-label"
                            aria-describedby={`cv-hint${cvError ? " cv-error" : ""}`}
                            aria-invalid={cvError ? true : undefined}
                            onChange={(e) => chooseCv(e.target.files?.[0])}
                          />
                          {cv ? (
                            <span className="career-upload-file">
                              <span aria-hidden="true">📄</span>
                              <span>
                                <strong>{cv.name}</strong>
                                <small>
                                  {fileSize(cv.size)} · Choose another file to
                                  replace it
                                </small>
                              </span>
                            </span>
                          ) : (
                            <span className="career-upload-prompt" aria-hidden="true">
                              <strong>Choose a file</strong> or drag it here
                            </span>
                          )}
                        </div>
                        {cvError && (
                          <span className="career-field-error" id="cv-error" role="alert">
                            {cvError}
                          </span>
                        )}
                      </div>
                      {field("qualifications", "Qualifications", {
                        hint: "Qualification name, level, awarding body and year achieved.",
                        rows: 3,
                        maxLength: 4000,
                      })}
                      {field(
                        "experience",
                        "Employment history and relevant experience",
                        {
                          hint: "A short summary of your roles, employers and dates, including any gaps.",
                          rows: 7,
                          maxLength: 8000,
                        },
                      )}
                      {field("motivation", "Why would you like to work with us?", {
                        rows: 4,
                        maxLength: 4000,
                      })}
                      {field("additional", "Anything else we should know?", {
                        hint: "For example, shift availability or adjustments for the recruitment process.",
                        rows: 3,
                        maxLength: 2000,
                        optional: true,
                      })}
                    </fieldset>
                    <fieldset className="career-group">
                      <legend>Confirm and send</legend>
                      <label className="career-consent">
                        <input
                          type="checkbox"
                          name="consent"
                          value="Yes"
                          required
                        />
                        <span>
                          I confirm the information I have provided is accurate
                          and understand it will be used to assess my
                          application.
                        </span>
                      </label>
                      <p className="form-privacy-note">
                        We’ll use your details to process your application. See
                        our <a href="/privacy">privacy notice</a>.
                      </p>
                      {!job.isSample && (
                        <Turnstile onToken={setToken} resetCount={reset} />
                      )}
                      <button
                        className="career-button career-submit"
                        disabled={busy || job.isSample || !token}
                      >
                        {busy
                          ? "Sending application…"
                          : job.isSample
                            ? "Sample role · sending disabled"
                            : "Send application"}
                      </button>
                      {!job.isSample && !token && !busy && (
                        <p className="career-small">
                          The button will be ready once the security check
                          above completes.
                        </p>
                      )}
                    </fieldset>
                  </fieldset>
                  {error && (
                    <p role="alert" className="career-notice career-error">
                      {error}
                    </p>
                  )}
                </form>
              )}
            </>
          )}
        </div>
        <aside className="career-summary" aria-label="Role summary">
          <h2 className="eyebrow">You are applying for</h2>
          <p className="career-summary-title">{job.title}</p>
          <dl>
            {[
              ["Location", locationName(job.location)],
              ["Salary", job.salary],
              ["Hours", job.hours],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
          {contact && (
            <p className="career-small">
              Questions about the role? Email{" "}
              <a href={`mailto:${contact.email}`}>{contact.email}</a> or call{" "}
              <a href={`tel:${contact.phoneHref}`}>{contact.phone}</a>.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
