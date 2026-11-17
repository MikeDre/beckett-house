"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  enableVisualEditing,
  type HistoryAdapterNavigate,
} from "@sanity/visual-editing-standalone";
export default function SanityVisualEditing({revision}:{revision?:string}) {
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
  useEffect(()=>{
    if(!revision)return;
    let stopped=false;
    let timer:ReturnType<typeof setTimeout>;
    let controller:AbortController|null=null;
    const check=async()=>{
      try {
        if(document.visibilityState==='visible') {
          controller=new AbortController();
          const response=await fetch('/api/draft-mode/version?path='+encodeURIComponent(window.location.pathname),{cache:'no-store',signal:controller.signal});
          if(response.ok) {
            const latest=await response.json() as {revision:string};
            if(!stopped && latest.revision!==revision){window.location.reload();return;}
          }
        }
      } catch { /* Keep the current preview usable during a temporary connection failure. */ }
      if(!stopped)timer=setTimeout(check,2000);
    };
    timer=setTimeout(check,1000);
    return ()=>{stopped=true;clearTimeout(timer);controller?.abort();};
  },[revision]);
  return null;
}
