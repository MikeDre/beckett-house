"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { locations } from "../../lib/content";
import { useNurseryChoice } from "../nursery-choice";

const copy = {
  visit: {
    eyebrow: "Visit request received",
    title: "Thank you, we’ll be in touch soon.",
    intro: "We’ve emailed you a copy of your request.",
    steps: [
      "The nursery team reads your request",
      "We get in touch, usually within two working days, to arrange a time",
      "You visit, meet the team and see the rooms",
    ],
  },
  register: {
    eyebrow: "Registration received",
    title: "Thank you for registering.",
    intro: "We’ve emailed you a copy of your registration.",
    steps: [
      "The nursery team reviews your registration",
      "We get in touch, usually within two working days, about availability",
      "We confirm your child’s place and starting date",
    ],
  },
};

export default function ThankYouContent({ animation }: { animation: ReactNode }) {
  const [slug] = useNurseryChoice();
  const nursery = locations.find((location) => location.slug === slug) ?? locations[0];
  const [form, setForm] = useState<keyof typeof copy>("visit");
  useEffect(() => {
    // The page is static, so which form was sent is only known after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (new URLSearchParams(window.location.search).get("form") === "register") setForm("register");
  }, []);
  const text = copy[form];

  return <>
    <section className="visit-hero">
      {animation}
      <div>
        <p className="eyebrow">{text.eyebrow}</p>
        <h1>{text.title}</h1>
      </div>
      <p>{text.intro} The {nursery.name} team will contact you, usually within two working days.</p>
    </section>
    <section className="visit-layout section-pad">
      <div className="visit-form thank-you-card">
        <h2>What happens next</h2>
        <ol>{text.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <p>Can’t see our email? Check your spam or junk folder.</p>
        <div className="thank-you-actions">
          <Link className="button button-dark" href={`/gallery?location=${nursery.slug}`}>See the nursery<span aria-hidden="true">→</span></Link>
          <Link className="button button-light" href="/">Back to home<span aria-hidden="true">→</span></Link>
        </div>
      </div>
      <aside className="visit-aside">
        <p className="eyebrow">Any questions?</p>
        <div className={`visit-location visit-${nursery.colour}`}>
          <span>{nursery.area}</span>
          <h2>{nursery.name}</h2>
          <p>{nursery.address}, {nursery.postcode}</p>
          <a href={`tel:${nursery.phoneHref}`}>{nursery.phone}</a>
          <a href={`mailto:${nursery.email}`}>{nursery.email}</a>
        </div>
      </aside>
    </section>
  </>;
}
