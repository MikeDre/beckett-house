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
  return (
    <div className="career-application">
      <a className="career-back" href={`/careers/${job.slug.current}`}>
        ← Back to role
      </a>
      <p className="eyebrow">{locationName(job.location)}</p>
      <h1 ref={heading} tabIndex={-1}>
        {sent ? "Application received" : `Apply: ${job.title}`}
      </h1>
      {sent ? (
        <div className="career-success">
          <h2>Thank you for your application</h2>
          <p>
            Our team will review your details and contact you about the next
            steps. A copy has been sent to your email address.
          </p>
          <Link href="/careers">Back to opportunities</Link>
        </div>
      ) : !isOpenJob(job) ? (
        <p className="career-notice">Applications for this role are closed.</p>
      ) : (
        <>
          {job.isSample && (
            <p className="career-notice">
              Sample role · You can review both steps. Sending is disabled.
            </p>
          )}
          <ol className="career-steps" aria-label="Application progress">
            <li aria-current={stage === 1 ? "step" : undefined}>
              1. Before you apply
            </li>
            <li aria-current={stage === 2 ? "step" : undefined}>
              2. Your application
            </li>
          </ol>
          {stage === 1 ? (
            <form onSubmit={next} className="career-form">
              <h2>Before you apply</h2>
              <p>
                Please answer both questions so we can understand your
                qualifications and availability.
              </p>
              {careerQuestions.map((q, i) => (
                <fieldset key={q}>
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
                              current.map((v, j) => (j === i ? answer : v)),
                            )
                          }
                        />
                        {answer}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              {answers.includes("No") && (
                <p className="career-notice">
                  This role requires a relevant Level 3 qualification and the
                  shifts listed above. You can continue and explain your
                  circumstances for the recruitment team to consider.
                </p>
              )}
              <button className="career-button">
                Continue to application →
              </button>
            </form>
          ) : (
            <form onSubmit={submit} className="career-form">
              <div className="career-results">
                <h2>Your application</h2>
                <button type="button" onClick={() => setStage(1)}>
                  Edit qualifying answers
                </button>
              </div>
              <fieldset disabled={busy}>
                <legend className="visually-hidden">Your details</legend>
                <div className="career-form-grid">
                  {[
                    ["name", "Full name", "text", "name"],
                    ["email", "Email address", "email", "email"],
                    ["phone", "Phone number", "tel", "tel"],
                  ].map(([name, label, type, autoComplete]) => (
                    <label key={name}>
                      {label}
                      <input
                        name={name}
                        type={type}
                        autoComplete={autoComplete}
                        required
                        maxLength={name === "email" ? 254 : 200}
                      />
                    </label>
                  ))}
                  <label>
                    Notice period / earliest start
                    <input name="availability" required maxLength={200} />
                  </label>
                </div>
                <label>
                  Qualifications
                  <textarea
                    name="qualifications"
                    required
                    rows={3}
                    maxLength={4000}
                    placeholder="Qualification name, level, awarding body and year achieved"
                  />
                </label>
                <label>
                  Employment history and relevant experience
                  <textarea
                    name="experience"
                    required
                    rows={6}
                    maxLength={8000}
                    placeholder="Include your roles, employers and dates, and explain any gaps."
                  />
                </label>
                <label>
                  Why would you like to work with us?
                  <textarea
                    name="motivation"
                    required
                    rows={4}
                    maxLength={4000}
                  />
                </label>
                <label>
                  Anything else we should know? <span>(optional)</span>
                  <textarea
                    name="additional"
                    rows={3}
                    maxLength={2000}
                    placeholder="For example, shift availability or adjustments for the recruitment process."
                  />
                </label>
                <p className="career-small">
                  Please provide your experience above. A CV upload is not
                  required for this first application.
                </p>
                <label className="career-consent">
                  <input type="checkbox" name="consent" value="Yes" required />I
                  confirm the information I have provided is accurate and
                  understand it will be used to assess my application.
                </label>
                <p className="form-privacy-note">
                  We’ll use your details to process your application. See our{" "}
                  <a href="/privacy">privacy notice</a>.
                </p>
                {!job.isSample && (
                  <Turnstile onToken={setToken} resetCount={reset} />
                )}
                <button
                  className="career-button"
                  disabled={busy || job.isSample || !token}
                >
                  {busy
                    ? "Sending application…"
                    : job.isSample
                      ? "Sample role · sending disabled"
                      : "Send application"}
                </button>
              </fieldset>
              {error && (
                <p role="alert" className="career-notice">
                  {error}
                </p>
              )}
            </form>
          )}
        </>
      )}
    </div>
  );
}
