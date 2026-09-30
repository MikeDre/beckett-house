"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { locations } from "../lib/content";
import { isNursery, nurseryNames, otherNursery, readNurseryChoice, useNurseryChangeListener, useSwitchNursery, type NurserySlug } from "./nursery-choice";

export function LocationSwitcher() {
  const pathname = usePathname();
  const routeNursery = pathname?.match(/^\/(angel|abbey-road)(?:\/|$)/)?.[1];
  const [nursery, setNursery] = useState<NurserySlug>("angel");
  useEffect(() => {
    // The route wins on homepages; elsewhere follow the visitor's choice.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNursery(isNursery(routeNursery) ? routeNursery : readNurseryChoice() ?? "angel");
  }, [routeNursery, pathname]);
  useNurseryChangeListener(setNursery);
  const switchNursery = useSwitchNursery();
  const current = nurseryNames[nursery];
  const other = nurseryNames[otherNursery(nursery)];
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLButtonElement>(null);
  const location = locations.find((entry) => entry.slug === nursery) ?? locations[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open && !chatOpen && !contactOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) { setOpen(false); setChatOpen(false); setContactOpen(false); }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, chatOpen, contactOpen]);

  if (pathname === "/") return null;

  return (
    <div className="location-switcher" ref={containerRef}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) { setOpen(false); setChatOpen(false); setContactOpen(false); } }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          const wasChat = chatOpen;
          const wasContact = contactOpen;
          setOpen(false); setChatOpen(false); setContactOpen(false);
          if (wasChat) chatRef.current?.focus(); else if (wasContact) contactRef.current?.focus(); else triggerRef.current?.focus();
        }
      }}>
      <div id="contact-options" className="location-switcher-panel contact-panel" hidden={!contactOpen}>
        <p className="contact-panel-title">Contact {location.name}</p>
        <a className="location-switcher-option" href={`tel:${location.phoneHref}`} onClick={() => setContactOpen(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" /></svg>
          <span>Call {location.phone}</span>
        </a>
        <a className="location-switcher-option" href={`mailto:${location.email}`} onClick={() => setContactOpen(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
          <span>Email {location.email}</span>
        </a>
        <a className="location-switcher-option" href={location.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => setContactOpen(false)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
          <span>{location.address}, {location.postcode}</span>
        </a>
      </div>
      <div id="location-switcher-options" className="location-switcher-panel" hidden={!open}>
        <button className="location-switcher-option" type="button" onClick={() => { setOpen(false); switchNursery(otherNursery(nursery)); }}>
          {other}
        </button>
      </div>
      <div className="location-switcher-controls">
        <button className="location-switcher-trigger floating-contact-trigger" ref={contactRef} type="button"
          aria-label={`${contactOpen ? "Close" : "Open"} contact options for ${location.name}`}
          aria-expanded={contactOpen} aria-controls="contact-options"
          onClick={() => { setOpen(false); setChatOpen(false); setContactOpen((value) => !value); }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" /></svg>
        </button>
        <div className="floating-chat" onMouseEnter={() => { setChatOpen(true); setOpen(false); }} onMouseLeave={() => setChatOpen(false)}>
          <span id="floating-chat-tooltip" className="floating-chat-tooltip" role="tooltip" hidden={!chatOpen}>Chat with us coming soon</span>
          <button className="location-switcher-trigger floating-chat-trigger" ref={chatRef} type="button" aria-label="Chat with us coming soon" aria-describedby={chatOpen ? "floating-chat-tooltip" : undefined}
            onFocus={() => { setChatOpen(true); setOpen(false); setContactOpen(false); }} onBlur={() => setChatOpen(false)} onClick={() => setChatOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9.8 9.8 0 0 1-4-.8L3 21l1.8-5.5a9.8 9.8 0 0 1-.8-4A8.5 8.5 0 0 1 12.5 3H13a8.5 8.5 0 0 1 8 8v.5Z" /></svg>
          </button>
        </div>
      <button className="location-switcher-trigger" ref={triggerRef} type="button"
        aria-label={`${current}: ${open ? "close" : "open"} nursery options`}
        aria-expanded={open} aria-controls="location-switcher-options"
        onClick={() => { setChatOpen(false); setContactOpen(false); setOpen((value) => !value); }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <span>{current}</span>
      </button>
      </div>
    </div>
  );
}
