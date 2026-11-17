"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  enableVisualEditing,
  type HistoryAdapterNavigate,
} from "@sanity/visual-editing-standalone";
export default function SanityVisualEditing() {
  const pathname = usePathname();
  const notify = useRef<HistoryAdapterNavigate | null>(null);
  useEffect(
    () =>
      enableVisualEditing({
        refresh: async () => {
          window.location.reload();
        },
        onPerspectiveChange(perspective) {
          const value = perspective === "published" ? "published" : "drafts";
          const current =
            document.cookie
              .split("; ")
              .find((cookie) =>
                cookie.startsWith("beckett-preview-perspective="),
              )
              ?.split("=")[1] || "drafts";
          if (current !== value) {
            document.cookie = `beckett-preview-perspective=${value}; Path=/; Max-Age=28800; Secure; SameSite=None; Partitioned`;
            window.location.reload();
          }
        },
        history: {
          subscribe(navigate) {
            notify.current = navigate;
            const listener = () =>
              navigate({ type: "push", url: window.location.href });
            listener();
            window.addEventListener("popstate", listener);
            return () => {
              notify.current = null;
              window.removeEventListener("popstate", listener);
            };
          },
          update(update) {
            const target = new URL(update.url, window.location.origin);
            if (target.origin === window.location.origin && target.href !== window.location.href) {
              if (update.type === "replace") window.location.replace(target.href);
              else window.location.assign(target.href);
            }
          },
        },
      }),
    [],
  );
  useEffect(() => {
    notify.current?.({ type: "push", url: window.location.href });
  }, [pathname]);
  return null;
}
