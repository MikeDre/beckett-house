"use client";

import { useEffect, useState } from "react";
import { loadAnalytics, readConsent, removeAnalyticsCookies, saveConsent, trackFormStart, trackLinkClick } from "./analytics";

export const OPEN_COOKIE_SETTINGS = "bh-open-cookie-settings";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readConsent();
    if (choice === "granted") loadAnalytics();
    // Consent lives in localStorage, so whether to ask is only known after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (choice === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    document.addEventListener("click", trackLinkClick);
    document.addEventListener("focusin", trackFormStart);
    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
      document.removeEventListener("click", trackLinkClick);
      document.removeEventListener("focusin", trackFormStart);
    };
  }, []);

  function choose(choice: "granted" | "denied") {
    saveConsent(choice);
    if (choice === "granted") loadAnalytics();
    else removeAnalyticsCookies();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <section className="cookie-consent" role="region" aria-label="Cookie choices">
      <p>
        <strong>Can we use analytics cookies?</strong> They help us see how people use the site so we can improve it. We only set them if you agree.
      </p>
      <div className="cookie-consent-actions">
        <button className="button button-light" type="button" onClick={() => choose("denied")}>No thanks</button>
        <button className="button button-dark" type="button" onClick={() => choose("granted")}>Accept</button>
      </div>
    </section>
  );
}
