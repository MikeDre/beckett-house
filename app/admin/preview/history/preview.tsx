"use client";
import { useEffect, useState } from "react";
import HistoryView from "../../../history/history-view";
import { defaultHistoryContent, validateHistoryContent } from "../../../../lib/history-content";

export default function HistoryPreview() {
  const [content, setContent] = useState(defaultHistoryContent), [error, setError] = useState("");
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "beckett-page-preview" || event.data.slug !== "history") return;
      try { setContent(validateHistoryContent(event.data.content)); setError(""); } catch (error) { setError((error as Error).message); }
    };
    window.addEventListener("message", receive);
    if (window.parent !== window) window.parent.postMessage({ type: "beckett-page-preview-ready", slug: "history" }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  return <><div onClickCapture={event => {
    const link = (event.target as Element).closest("a");
    if (link && !link.getAttribute("href")?.startsWith("#")) { event.preventDefault(); event.stopPropagation(); }
  }}><HistoryView content={content} /></div>{error && <p role="alert" style={{ position: "fixed", bottom: 12, left: 12, right: 12, background: "var(--sun)", color: "var(--ink)", padding: 16, zIndex: 9999 }}>Preview is showing the last valid content. {error}</p>}</>;
}
