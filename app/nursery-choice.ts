"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type NurserySlug = "angel" | "abbey-road";

const STORAGE_KEY = "beckett-house-nursery";
const COOKIE_KEY = "bh_preferred_nursery";
const CHANGE_EVENT = "beckett-house:nursery-change";
const HOMEPAGES: Record<NurserySlug, string> = { angel: "/angel", "abbey-road": "/abbey-road" };

export const nurseryNames: Record<NurserySlug, string> = { angel: "Angel", "abbey-road": "Abbey Road" };
export const otherNursery = (nursery: NurserySlug): NurserySlug => (nursery === "angel" ? "abbey-road" : "angel");

export const isNursery = (value: string | null | undefined): value is NurserySlug =>
  value === "angel" || value === "abbey-road";

const homepageNursery = (pathname: string | null) =>
  (Object.keys(HOMEPAGES) as NurserySlug[]).find((slug) => pathname === HOMEPAGES[slug]) ?? null;

// The visitor's nursery: `?location=` first so refreshes and shared links keep
// their view, then a `#abbey-road…` anchor, then the remembered preference.
export function readNurseryChoice(): NurserySlug | null {
  const fromQuery = new URLSearchParams(window.location.search).get("location");
  const fromHash = window.location.hash.startsWith("#abbey-road") ? "abbey-road" : null;
  let stored: string | null = null;
  try { stored = window.localStorage.getItem(STORAGE_KEY); } catch { /* Storage can be unavailable. */ }
  const cookie = document.cookie.split("; ").find((item) => item.startsWith(`${COOKIE_KEY}=`))?.split("=")[1];
  return [fromQuery, fromHash, stored, cookie].find(isNursery) ?? null;
}

export function rememberNursery(nursery: NurserySlug) {
  try { window.localStorage.setItem(STORAGE_KEY, nursery); } catch { /* Navigation does not depend on storage. */ }
  document.cookie = `${COOKIE_KEY}=${nursery}; path=/; max-age=31536000; SameSite=Lax`;
}

// Records the choice in the URL and storage, then tells every switchable
// component on the page (timetable, tour, fees, header…) to follow it.
function applyNurseryChoice(nursery: NurserySlug) {
  const url = new URL(window.location.href);
  url.searchParams.set("location", nursery);
  window.history.replaceState(window.history.state, "", url);
  rememberNursery(nursery);
  window.dispatchEvent(new CustomEvent<NurserySlug>(CHANGE_EVENT, { detail: nursery }));
}

// Follow nursery changes made anywhere on the page.
export function useNurseryChangeListener(onChange: (nursery: NurserySlug) => void) {
  useEffect(() => {
    const listener = (event: Event) => onChange((event as CustomEvent<NurserySlug>).detail);
    window.addEventListener(CHANGE_EVENT, listener);
    return () => window.removeEventListener(CHANGE_EVENT, listener);
  }, [onChange]);
}

// Switch nursery without losing the page: homepages swap to the other
// homepage, every other page stays put and updates its content in place.
export function useSwitchNursery() {
  const pathname = usePathname();
  const router = useRouter();
  return useCallback((nursery: NurserySlug) => {
    if (homepageNursery(pathname)) {
      rememberNursery(nursery);
      router.push(HOMEPAGES[nursery]);
      return;
    }
    applyNurseryChoice(nursery);
  }, [pathname, router]);
}

// State for pages that can show either nursery (timetable, tour, fees…).
export function useNurseryChoice(fallback: NurserySlug = "angel") {
  const [nursery, setNursery] = useState<NurserySlug>(fallback);

  useEffect(() => {
    const initial = readNurseryChoice();
    // Restoring the choice from the URL or storage is only possible after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initial) setNursery(initial);
  }, []);
  useNurseryChangeListener(setNursery);

  const choose = useCallback((next: NurserySlug) => applyNurseryChoice(next), []);
  return [nursery, choose] as const;
}

// The nursery the visitor is looking at: the homepage they're on, otherwise
// their choice. Follows switches made anywhere on the page.
export function useActiveNursery(fallback: NurserySlug = "angel") {
  const pathname = usePathname();
  const routeNursery = homepageNursery(pathname);
  const [chosen, setChosen] = useState<NurserySlug>(fallback);
  useEffect(() => {
    // Reading the choice from the URL or storage is only possible after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChosen(readNurseryChoice() ?? fallback);
  }, [pathname, fallback]);
  useNurseryChangeListener(setChosen);
  return routeNursery ?? chosen;
}
