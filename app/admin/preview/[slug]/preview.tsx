"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import type { Announcement } from "../../../../lib/content";
import { defaultNurseryPages, validateNurseryPageContent, type NurseryPageSlug } from "../../../../lib/nursery-pages";
import NurseryHomeView from "../../../nursery-home-view";

export default function NurseryPreview({ slug, announcements }: { slug: NurseryPageSlug; announcements: Announcement[] }) {
  const [content, setContent] = useState(() => structuredClone(defaultNurseryPages[slug])), [error, setError] = useState("");
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "beckett-page-preview" || event.data.slug !== slug) return;
      try { setContent(validateNurseryPageContent(event.data.content)); setError(""); }
      catch (error) { setError(error instanceof Error ? error.message : "Please complete the page fields."); }
    };
    window.addEventListener("message", receive);
    if (window.parent !== window) window.parent.postMessage({ type: "beckett-page-preview-ready", slug }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, [slug]);
  function blockLink(event: SyntheticEvent) {
    const target = event.target;
    if (target instanceof Element && target.closest("a, .nav-nursery-label")) { event.preventDefault(); event.stopPropagation(); }
  }
  return <><style>{`.cms-draft-notice{position:fixed;z-index:9999;bottom:16px;left:16px;right:16px;background:var(--sun);color:var(--ink);padding:14px 18px;border:1px solid var(--line);border-radius:10px;font:14px/1.5 var(--font-body)}`}</style><div className="cms-draft-surface" onClickCapture={blockLink} onAuxClickCapture={blockLink}><NurseryHomeView key={`${slug}:${content.hero.slides.length}:${content.testimonials.length}`} slug={slug} content={content} announcements={announcements} previewOnly/></div>{error && <p className="cms-draft-notice" role="alert">Preview is showing the last valid content. {error}</p>}</>;
}
