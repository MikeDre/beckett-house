"use client";
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
export default function ApplicationForm({ job }: { job: Job }) {
  const [stage, setStage] = useState(1),
    [answers, setAnswers] = useState(["", ""]),
    [token, setToken] = useState(""),
    [reset, setReset] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  function next(e: FormEvent) {
    e.preventDefault();
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
      const data = new FormData(e.currentTarget);
      data.set("jobId", job._id);
      data.set("qualification", answers[0]);
      data.set("shifts", answers[1]);
      await postForm("careers", data, token);
      setSent(true);
      setTimeout(() => heading.current?.focus(), 0);
    } catch (e) {
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
                    Two quick questions about your qualification and
                    availability. There are no wrong answers.
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
                              onChange={() =>
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
                  <div aria-live="polite">
                    {answers.includes("No") && (
                      <p className="career-notice">
                        This role asks for a Level 3 qualification and the
                        shifts above, but you are still welcome to apply. Tell
                        us about your circumstances and our team will consider
                        them.
                      </p>
                    )}
                  </div>
                  <button className="career-button">
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
                      {field("qualifications", "Qualifications", {
                        hint: "Qualification name, level, awarding body and year achieved.",
                        rows: 3,
                        maxLength: 4000,
                      })}
                      {field(
                        "experience",
                        "Employment history and relevant experience",
                        {
                          hint: "Include your roles, employers and dates, and explain any gaps. No CV is needed.",
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
