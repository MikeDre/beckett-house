"use client";

import { useEffect, useRef } from "react";

export type CardAnimationName =
  | "bouncing"
  | "joy"
  | "morph"
  | "shapes"
  | "rings"
  | "tower"
  | "puzzle"
  | "beads"
  | "orbital"
  | "ball"
  | "blob";

// Decorative Lottie animation for the homepage cards. The player and the
// animation are only fetched once the card is near the viewport, playback
// pauses off-screen, and reduced-motion visitors see a still frame.
export default function CardAnimation({ name }: { name: CardAnimationName }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.IntersectionObserver) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation: import("lottie-web").AnimationItem | undefined;
    let cancelled = false;
    let visible = false;

    const sync = () => {
      if (!animation) return;
      if (reducedMotion.matches) {
        animation.goToAndStop(Math.round(animation.totalFrames / 2), true);
      } else if (visible) {
        animation.play();
      } else {
        animation.pause();
      }
    };

    const load = async () => {
      const { default: lottie } = await import("lottie-web/build/player/lottie_light");
      if (cancelled) return;
      animation = lottie.loadAnimation({
        container,
        renderer: "svg",
        loop: true,
        autoplay: false,
        path: `/lottie/${name}.json`,
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      animation.addEventListener("DOMLoaded", sync);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !animation) void load();
      sync();
    }, { rootMargin: "200px" });
    observer.observe(container);
    reducedMotion.addEventListener("change", sync);

    return () => {
      cancelled = true;
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
      animation?.destroy();
    };
  }, [name]);

  return <div ref={containerRef} className="card-animation" aria-hidden="true" />;
}
