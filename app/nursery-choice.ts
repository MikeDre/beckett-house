"use client";

import { useCallback, useEffect, useState } from "react";

export type NurserySlug = "angel" | "abbey-road";

const STORAGE_KEY = "beckett-house-nursery";
const COOKIE_KEY = "bh_preferred_nursery";

const isNursery = (value: string | null | undefined): value is NurserySlug =>
  value === "angel" || value === "abbey-road";

// Remembers which nursery a visitor is viewing on pages that can switch
// between both. `?location=` wins so a refresh or shared link restores the
// same view; otherwise fall back to the preference the header also uses.
export function useNurseryChoice(fallback: NurserySlug = "angel") {
  const [nursery, setNursery] = useState<NurserySlug>(fallback);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("location");
    let stored: string | null = null;
    try { stored = window.localStorage.getItem(STORAGE_KEY); } catch { /* Storage can be unavailable. */ }
    const cookie = document.cookie.split("; ").find((item) => item.startsWith(`${COOKIE_KEY}=`))?.split("=")[1];
    const initial = [fromQuery, stored, cookie].find(isNursery);
    // Restoring the choice from the URL or storage is only possible after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initial) setNursery(initial);
  }, []);

  const choose = useCallback((next: NurserySlug) => {
    setNursery(next);
    const url = new URL(window.location.href);
    url.searchParams.set("location", next);
    window.history.replaceState(window.history.state, "", url);
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* Navigation does not depend on storage. */ }
    document.cookie = `${COOKIE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  return [nursery, choose] as const;
}
