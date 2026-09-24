"use client";

import { useEffect, useState } from "react";
import type { Announcement } from "../lib/content";

export default function Announcements({ items }: { items: Announcement[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || interacting || reducedMotion || items.length < 2) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % items.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused, interacting, reducedMotion, items.length]);
  if (!items.length) return null;
  return <section className="home-announcements" aria-label="Nursery news and announcements" aria-roledescription="carousel" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setInteracting(false); }}>
    <div className="announcement-viewport"><div className="announcement-track" style={{ transform: `translateX(-${active * 100}%)` }}>
    {items.map((item, index) => <article className={`announcement-card${item.image ? " announcement-card-with-image" : ""}`} key={item.id} aria-labelledby={`announcement-${item.id}`} aria-hidden={active !== index} inert={active !== index}>
      {item.image && <img className="announcement-image" src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} loading="lazy" decoding="async" />}
      <div className="announcement-content">
        <div className="announcement-meta"><span>{item.category}</span>{item.date && <time dateTime={item.date}>{item.dateLabel ?? item.date}</time>}</div>
        <h2 id={`announcement-${item.id}`}>{item.title}</h2>
        {item.summary && <p>{item.summary}</p>}
        {item.href && <a className="announcement-link" href={item.href} target={item.href.startsWith("https://") ? "_blank" : undefined} rel={item.href.startsWith("https://") ? "noopener noreferrer" : undefined}>{item.linkLabel ?? "Read more"}</a>}
      </div>
    </article>)}</div></div>
    {items.length > 1 && <div className="announcement-controls">
      <button type="button" onClick={() => setActive(index => (index - 1 + items.length) % items.length)} aria-label="Previous announcement">Previous</button>
      <div className="announcement-dots" role="group" aria-label="Choose an announcement">{items.map((item, index) => <button key={item.id} type="button" className={active === index ? "is-active" : ""} aria-label={item.title} aria-pressed={active === index} onClick={() => setActive(index)} />)}</div>
      <button type="button" onClick={() => setActive(index => (index + 1) % items.length)} aria-label="Next announcement">Next</button>
      {!reducedMotion && <button type="button" aria-label={paused ? "Play announcements" : "Pause announcements"} onClick={() => setPaused(!paused)}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{paused ? <path d="M7 4v16l14-8Z" /> : <path d="M6 4h4v16H6zM14 4h4v16h-4z" />}</svg></button>}
    </div>}
  </section>;
}
