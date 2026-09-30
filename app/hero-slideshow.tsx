"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type HeroSlide = { src: string; alt: string; width: number; height: number };

// Homepage hero photos that crossfade with a slow zoom. Only the first photo
// loads with the page; the rest load once it has rendered, so the hero's first
// paint isn't slowed. Reduced-motion visitors see the first photo only.
export default function HeroSlideshow({ slides, interval = 6000 }: { slides: HeroSlide[]; interval?: number }) {
  const [active, setActive] = useState(0);
  const [loadRest, setLoadRest] = useState(false);

  useEffect(() => {
    // Deferring the remaining photos until after hydration is the point here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadRest(true);
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((index) => (index + 1) % slides.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [slides.length, interval]);

  return (
    <div className="hero-slides">
      {slides.map((slide, index) => (index === 0 || loadRest) && (
        <Image
          key={slide.src}
          className={`hero-slide${index === active ? " is-active" : ""}`}
          src={slide.src}
          alt={slide.alt}
          aria-hidden={index !== active}
          width={slide.width}
          height={slide.height}
          sizes="100vw"
          priority={index === 0}
          unoptimized
        />
      ))}
    </div>
  );
}
