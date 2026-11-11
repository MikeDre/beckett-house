"use client";
import { useEffect, useState } from "react";
import TimetableView from "../../../timetable/timetable-view";
import { defaultTimetableContent, validateTimetableContent } from "../../../../lib/timetable-content";

export default function TimetablePreview() {
  const [content, setContent] = useState(defaultTimetableContent), [error, setError] = useState("");
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "beckett-page-preview" || event.data.slug !== "timetable") return;
      try { setContent(validateTimetableContent(event.data.content)); setError(""); } catch (error) { setError((error as Error).message); }
    };
    window.addEventListener("message", receive);
    if (window.parent !== window) window.parent.postMessage({ type: "beckett-page-preview-ready", slug: "timetable" }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  return <><div onClickCapture={event => {
    const link = (event.target as Element).closest("a");
    if (link && !link.getAttribute("href")?.startsWith("#")) { event.preventDefault(); event.stopPropagation(); }
  }}><TimetableView content={content} /></div>{error && <p role="alert" style={{ position: "fixed", bottom: 12, left: 12, right: 12, background: "var(--sun)", color: "var(--ink)", padding: 16, zIndex: 9999 }}>Preview is showing the last valid content. {error}</p>}</>;
}
