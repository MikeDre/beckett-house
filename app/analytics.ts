"use client";

import { locations } from "../lib/content";

const GA_ID = "G-4JGQVYM4ZG";
const CONSENT_KEY = "bh_analytics_consent";
const PENDING_LEAD_KEY = "bh_pending_lead";

type Choice = "granted" | "denied";
type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
type EventParams = Record<string, string | number | undefined>;

export function readConsent(): Choice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: Choice) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Private browsing can block storage; the banner will simply ask again next visit.
  }
}

// Google Analytics only loads after the visitor accepts, as UK PECR requires consent for analytics cookies.
export function loadAnalytics() {
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

export function removeAnalyticsCookies() {
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

// Sends a GA4 event, but only for visitors who accepted analytics. Events from everyone else are dropped.
export function trackEvent(name: string, params: EventParams = {}) {
  if (readConsent() !== "granted") return;
  loadAnalytics();
  (window as GtagWindow).gtag?.("event", name, params);
}

// The form redirects straight to the thank-you page, so the lead is recorded there,
// once, rather than racing the navigation.
export function rememberLead(formType: "visit" | "register", nursery: string) {
  try {
    window.sessionStorage.setItem(PENDING_LEAD_KEY, JSON.stringify({ formType, nursery }));
  } catch {
    // Without storage the lead simply isn't counted.
  }
}

export function trackPendingLead() {
  try {
    const pending = window.sessionStorage.getItem(PENDING_LEAD_KEY);
    if (!pending) return;
    window.sessionStorage.removeItem(PENDING_LEAD_KEY);
    const { formType, nursery } = JSON.parse(pending) as { formType: string; nursery: string };
    trackEvent("generate_lead", { form_type: formType, nursery });
  } catch {
    // Ignore unreadable storage.
  }
}

function nurseryFor(href: string) {
  const match = locations.find((location) =>
    href.includes(location.phoneHref) || href.includes(location.email) || href.includes(location.mapsUrl) || href.includes(location.reviewUrl));
  return match?.slug;
}

// One delegated listener covers every phone, email, map, review and social link on the site.
export function trackLinkClick(event: MouseEvent) {
  const link = (event.target as Element | null)?.closest?.("a");
  const href = link?.getAttribute("href");
  if (!href) return;
  const nursery = nurseryFor(href);
  if (href.startsWith("tel:")) trackEvent("contact_click", { method: "phone", nursery });
  else if (href.startsWith("mailto:")) trackEvent("contact_click", { method: "email", nursery });
  else if (/g\.page\/r\/.+\/review/.test(href)) trackEvent("review_click", { nursery });
  else if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/.test(href)) trackEvent("directions_click", { nursery });
  else if (/instagram\.com|facebook\.com/.test(href)) trackEvent("social_click", { network: href.includes("instagram") ? "instagram" : "facebook" });
  else if (href.startsWith("/visit")) trackEvent("book_visit_click", { link_text: link?.textContent?.trim().slice(0, 100) });
}

const startedForms = new Set<string>();

// Fires once per page view, the first time someone types into a visit or registration form.
export function trackFormStart(event: FocusEvent) {
  const form = (event.target as Element | null)?.closest?.("form.visit-form");
  if (!form) return;
  const formType = form.classList.contains("register-form") ? "register" : "visit";
  if (startedForms.has(formType)) return;
  startedForms.add(formType);
  trackEvent("form_start", { form_type: formType });
}
