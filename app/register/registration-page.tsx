"use client";

import { type FormEvent, useState } from "react";
import { useNurseryChoice } from "../nursery-choice";
import { registrationContent } from "./register-content";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const attendanceFields: ReadonlyArray<{
  name: "fullDays" | "mornings" | "afternoons";
  label: string;
  times?: string;
}> = [
  { name: "fullDays", label: "Full days", times: "8am to 6pm" },
  { name: "mornings", label: "Mornings" },
  { name: "afternoons", label: "Afternoons" },
];

function value(data: FormData, name: string) {
  return String(data.get(name) || "Not provided");
}

function selectedDays(data: FormData, name: string) {
  const selected = data.getAll(name).map(String);
  return selected.length > 0 ? selected.join(", ") : "None selected";
}

export function RegistrationPage() {
  const [nursery, chooseNursery] = useNurseryChoice();
  const [status, setStatus] = useState("");
  const content = registrationContent[nursery];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const childName = value(data, "childName");
    const subject = encodeURIComponent(
      `Registration: ${content.name}, ${childName}`,
    );
    const body = encodeURIComponent(
      [
        "Hello Beckett House,",
        "",
        "I would like to register my child.",
        "",
        `Nursery: ${content.name}`,
        `Child's full name: ${childName}`,
        `Date of birth: ${value(data, "dateOfBirth")}`,
        `Mother's full name: ${value(data, "motherName")}`,
        `Mother's mobile number: ${value(data, "motherMobile")}`,
        `Father's full name: ${value(data, "fatherName")}`,
        `Father's mobile number: ${value(data, "fatherMobile")}`,
        `Email: ${value(data, "email")}`,
        `Home address: ${value(data, "homeAddress")}`,
        `Home phone: ${value(data, "homePhone")}`,
        `Planned starting date: ${value(data, "startDate")}`,
        "",
        "Attendance required:",
        `Full days (8am to 6pm): ${selectedDays(data, "fullDays")}`,
        `Mornings (${content.morning}): ${selectedDays(data, "mornings")}`,
        `Afternoons (${content.afternoon}): ${selectedDays(data, "afternoons")}`,
      ].join("\n"),
    );

    setStatus(
      "Your email app is opening with the registration details ready to send.",
    );
    window.location.href = `mailto:${content.email}?subject=${subject}&body=${body}`;
  }

  return (
    <>
      <section className="register-main" aria-labelledby="register-form-heading">
        <div className="register-form-column">
          <div
            className="virtual-tour-location-switch register-location-switch"
            aria-label="Choose a nursery"
          >
            <button
              type="button"
              className={nursery === "angel" ? "is-selected" : ""}
              aria-pressed={nursery === "angel"}
              onClick={() => chooseNursery("angel")}
            >
              Angel
            </button>
            <button
              type="button"
              className={nursery === "abbey-road" ? "is-selected" : ""}
              aria-pressed={nursery === "abbey-road"}
              onClick={() => chooseNursery("abbey-road")}
            >
              Abbey Road
            </button>
          </div>

          <form className="visit-form register-form" onSubmit={submit}>
            <div className="register-form-heading">
              <p className="eyebrow">{content.name}</p>
              <h2 id="register-form-heading">Registration form</h2>
            </div>

            <div className="field-row">
              <label>
                Child&apos;s full name <span className="register-required" aria-hidden="true">*</span>
                <input name="childName" autoComplete="name" required />
              </label>
              <label>
                Date of birth <span className="register-required" aria-hidden="true">*</span>
                <input name="dateOfBirth" type="date" required />
              </label>
            </div>

            <div className="field-row">
              <label>
                Mother&apos;s full name <span className="register-required" aria-hidden="true">*</span>
                <input name="motherName" autoComplete="name" required />
              </label>
              <label>
                Mother&apos;s mobile number <span className="register-required" aria-hidden="true">*</span>
                <input name="motherMobile" type="tel" autoComplete="tel" required />
              </label>
            </div>

            <div className="field-row">
              <label>
                Father&apos;s full name <span className="register-required" aria-hidden="true">*</span>
                <input name="fatherName" autoComplete="name" required />
              </label>
              <label>
                Father&apos;s mobile number <span className="register-required" aria-hidden="true">*</span>
                <input name="fatherMobile" type="tel" autoComplete="tel" required />
              </label>
            </div>

            <label>
              Email <span className="register-required" aria-hidden="true">*</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>

            <label>
              Home address
              <textarea name="homeAddress" autoComplete="street-address" rows={3} />
            </label>

            <div className="field-row">
              <label>
                Home phone
                <input name="homePhone" type="tel" autoComplete="tel" />
              </label>
              <label>
                Planned starting date <span className="register-required" aria-hidden="true">*</span>
                <input name="startDate" type="date" required />
              </label>
            </div>

            <div className="register-attendance">
              <h3>Attendance required</h3>
              {attendanceFields.map((field) => {
                const times =
                  field.times ??
                  (field.name === "mornings"
                    ? content.morning
                    : content.afternoon);

                return (
                  <fieldset className="register-attendance-row" key={field.name}>
                    <legend>
                      {field.label} <span>({times})</span>
                    </legend>
                    <div className="register-days">
                      {days.map((day) => (
                        <label className="register-day" key={day}>
                          <span aria-hidden="true">{day.slice(0, 3)}</span>
                          <span className="register-visually-hidden">{day}</span>
                          <input name={field.name} type="checkbox" value={day} />
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>

            <button className="button button-dark form-submit" type="submit">
              Prepare registration email
            </button>
            <p className="form-status" aria-live="polite">
              {status}
            </p>
          </form>
        </div>

        <aside className="register-intro">
          <p className="eyebrow">Before you register</p>
          <h2>Registration is not enrolment.</h2>
          <p>
            A £75 registration fee is required when applying for a place. It is
            non-refundable and does not guarantee a place. The registration fee
            is not applicable to funded places.
          </p>
          <p>Places are secured by a deposit of four weeks&apos; fees.</p>
        </aside>
      </section>

      <section className="register-terms" aria-labelledby="register-terms-heading">
        <div className="register-terms-heading">
          <p className="eyebrow">{content.name}</p>
          <h2 id="register-terms-heading">Registration and terms</h2>
        </div>
        <div className="register-details">
          {content.terms.map((term) => (
            <details key={term.title}>
              <summary>
                <span>{term.title}</span>
                <span className="register-plus" aria-hidden="true">
                  +
                </span>
              </summary>
              <div className="register-detail-copy">
                {term.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
