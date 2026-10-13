"use client";

import { useEffect, useState } from "react";

const GA_ID = "G-4JGQVYM4ZG";
const STORAGE_KEY = "bh_analytics_consent";
export const OPEN_COOKIE_SETTINGS = "bh-open-cookie-settings";

type Choice = "granted" | "denied";
type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

function readChoice(): Choice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: Choice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Private browsing can block storage; the banner will simply ask again next visit.
  }
}

// Google Analytics only loads after the visitor accepts, as UK PECR requires consent for analytics cookies.
function loadAnalytics() {
  const w = window as GtagWindow;
  if (w.gtag || ["localhost", "127.0.0.1"].includes(window.location.hostname)) return;
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // gtag.js reads the arguments object itself, so it must be pushed as-is.
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

function removeAnalyticsCookies() {
  const w = window as GtagWindow;
  w.gtag?.("consent", "update", { analytics_storage: "denied" });
  const domains = ["", window.location.hostname, `.${window.location.hostname.replace(/^www\./, "")}`];
  for (const cookie of document.cookie.split("; ")) {
    const name = cookie.split("=")[0];
    if (!name.startsWith("_ga")) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; path=/; max-age=0${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readChoice();
    if (choice === "granted") loadAnalytics();
    // Consent lives in localStorage, so whether to ask is only known after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (choice === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
  }, []);

  function choose(choice: Choice) {
    saveChoice(choice);
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
