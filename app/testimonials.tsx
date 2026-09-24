"use client";

import { useEffect, useState } from "react";

const testimonials = [
  { quote: "The staff are fantastic, and being family-run gives you a warm, caring feeling. The children all seem really happy when you drop off and pick up.", author: "Georgina H · Beckett House parent" },
  { quote: "A welcoming place to learn, explore and grow in confidence, with thoughtful care at every step.", author: "Placeholder testimonial · for design preview" },
  { quote: "Little discoveries, new friendships and the freedom to try things for themselves. Every day brings something to smile about.", author: "Placeholder testimonial · for design preview" },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) setPaused(true);
    const update = (event: MediaQueryListEvent) => setPaused(event.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || hovered || focused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(index => (index + 1) % testimonials.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, active]);

  return <section className="testimonial section-pad" aria-label="Parent testimonials" aria-roledescription="carousel"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false); }}>
    <span className="quote-mark" aria-hidden="true">“</span>
    <div className="testimonial-slides" aria-live="off">
      {testimonials.map((testimonial, index) => <div key={testimonial.author + index} className={`testimonial-slide${active === index ? " is-active" : ""}`} aria-hidden={active !== index} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${testimonials.length}`}>
        <blockquote>{testimonial.quote}</blockquote><p className="testimonial-author">{testimonial.author}</p>
      </div>)}
    </div>
    <div className="testimonial-controls">
      <div className="testimonial-dots" role="group" aria-label="Choose testimonial">
        {testimonials.map((_, index) => <button key={index} type="button" aria-label={`Show testimonial ${index + 1}`} aria-pressed={active === index} onClick={() => setActive(index)} />)}
      </div>
      <button className="testimonial-pause" type="button" aria-label={paused ? "Play testimonials" : "Pause testimonials"} title={paused ? "Play testimonials" : "Pause testimonials"} onClick={() => setPaused(value => !value)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{paused ? <path d="M8 5v14l11-7Z" /> : <><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></>}</svg>
      </button>
    </div>
  </section>;
}
