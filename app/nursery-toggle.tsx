"use client";

import { useEffect, type ReactNode } from "react";
import { nurseryNames, useNurseryChoice, type NurserySlug } from "./nursery-choice";

// Page-level Angel / Abbey Road switch. Every toggle, NurseryView and
// switchable component on the page follows the same choice, kept in ?location=.
export function NurseryToggle({ label = "Choose a nursery" }: { label?: string }) {
  const [nursery, setNursery] = useNurseryChoice();
  return (
    <div className="virtual-tour-location-switch nursery-toggle" role="group" aria-label={label}>
      {(Object.keys(nurseryNames) as NurserySlug[]).map((slug) => (
        <button key={slug} type="button" aria-pressed={nursery === slug} className={nursery === slug ? "is-selected" : ""} onClick={() => setNursery(slug)}>
          {nurseryNames[slug]}
        </button>
      ))}
    </div>
  );
}

// Shows its content only for the chosen nursery. Both versions are server
// rendered (so both stay crawlable); the other one is hidden once chosen.
export function NurseryView({ nursery, children }: { nursery: NurserySlug; children: ReactNode }) {
  const [current] = useNurseryChoice();
  const shown = current === nursery;

  // Anchors into a nursery that was hidden on load (e.g. #abbey-road-term-dates)
  // can only scroll once that nursery is showing.
  useEffect(() => {
    if (!shown || !window.location.hash) return;
    const target = document.getElementById(window.location.hash.slice(1));
    if (!target || target.closest("[data-nursery-view]")?.getAttribute("data-nursery-view") !== nursery) return;
    // Wait for the router's own scroll handling on load, then jump to the anchor.
    const timer = window.setTimeout(() => target.scrollIntoView({ behavior: "instant" }), 120);
    return () => window.clearTimeout(timer);
  }, [shown, nursery]);

  return <div data-nursery-view={nursery} hidden={!shown}>{children}</div>;
}
