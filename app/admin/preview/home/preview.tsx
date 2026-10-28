"use client";
import { useEffect, useState } from "react";
import { NurseryChooser } from "../../../components";
import { locations } from "../../../../lib/content";
import { defaultHomepageContent, validateHomepageContent } from "../../../../lib/homepage-content";

export default function HomepagePreview() {
  const [content, setContent] = useState(defaultHomepageContent), [error, setError] = useState("");
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "beckett-homepage-preview") return;
      try { setContent(validateHomepageContent(event.data.content)); setError(""); } catch (error) { setError((error as Error).message); }
    };
    window.addEventListener("message", receive);
    if (window.parent !== window) window.parent.postMessage({ type: "beckett-homepage-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, []);
  return <><style>{`.cms-draft-notice{position:fixed;z-index:9999;bottom:16px;left:16px;right:16px;background:#fff7e6;color:#654d1b;padding:14px 18px;border:1px solid #e6d6a6;border-radius:10px;font:14px/1.5 sans-serif}`}</style><div className="cms-draft-surface" onClickCapture={event => { if ((event.target as Element).closest("a")) { event.preventDefault(); event.stopPropagation(); } }}><main className="nursery-chooser-page homepage-map"><NurseryChooser locations={locations} homepage previewOnly content={content}/></main></div>{error && <p className="cms-draft-notice" role="alert">Preview is showing the last valid content. {error}</p>}</>;
}
