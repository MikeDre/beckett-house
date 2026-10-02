"use client";

import { useEffect, useRef, useState } from "react";

function readTurnstileSiteKey() {
  try {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  } catch {
    return "";
  }
}

export const TURNSTILE_SITE_KEY = readTurnstileSiteKey();

interface TurnstileApi {
  render(container: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void; "error-callback": () => void; "response-field": boolean }): string;
  reset(id: string): void;
  remove(id: string): void;
}

interface TurnstileWindow extends Window {
  turnstile?: TurnstileApi;
  __beckettHouseTurnstileReady?: () => void;
}

let loadPromise: Promise<TurnstileApi> | undefined;

function loadTurnstile() {
  const browser = window as TurnstileWindow;
  if (browser.turnstile) return Promise.resolve(browser.turnstile);
  if (!loadPromise) {
    loadPromise = new Promise<TurnstileApi>((resolve, reject) => {
      const script = document.createElement("script");
      const timer = window.setTimeout(() => fail(), 20000);
      function fail() {
        window.clearTimeout(timer);
        script.remove();
        loadPromise = undefined;
        reject(new Error("Spam protection could not load."));
      }
      browser.__beckettHouseTurnstileReady = () => {
        window.clearTimeout(timer);
        if (browser.turnstile) resolve(browser.turnstile);
        else fail();
      };
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__beckettHouseTurnstileReady";
      script.async = true;
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }
  return loadPromise;
}

export function Turnstile({ onToken, resetCount }: { onToken: (token: string) => void; resetCount: number }) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<{ api: TurnstileApi; id: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadTurnstile().then((api) => {
      if (cancelled || !container.current) return;
      const id = api.render(container.current, {
        sitekey: TURNSTILE_SITE_KEY,
        "response-field": false,
        callback: (token) => { setError(""); onToken(token); },
        "expired-callback": () => onToken(""),
        "error-callback": () => { onToken(""); setError("Spam protection could not complete. Please try again or reload the page."); },
      });
      widget.current = { api, id };
    }).catch(() => {
      if (!cancelled) setError("Spam protection could not load. Please reload the page and try again.");
    });
    return () => {
      cancelled = true;
      if (widget.current) widget.current.api.remove(widget.current.id);
      widget.current = null;
    };
  }, [onToken]);

  useEffect(() => {
    if (widget.current) widget.current.api.reset(widget.current.id);
  }, [resetCount]);

  return (
    <>
      <div className="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="form-turnstile" ref={container} />
      {error ? <p className="form-status" role="status">{error}</p> : null}
    </>
  );
}

export async function postForm(kind: "visit" | "register", data: FormData, token: string, nursery?: string) {
  if (!token) throw new Error("Please complete the spam protection check before sending your form.");
  const body: Record<string, unknown> = { ...Object.fromEntries(data), turnstileToken: token };
  if (nursery) body.nursery = nursery;
  if (kind === "register") {
    for (const name of ["fullDays", "mornings", "afternoons"]) body[name] = data.getAll(name).map(String);
  }
  const response = await fetch(`/api/forms/${kind}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(40000),
  });
  const result = await response.json() as { ok?: boolean; error?: string };
  if (!response.ok || result.ok !== true) throw new Error(result.error || "Sorry, we couldn't send your request. Please try again shortly.");
}
