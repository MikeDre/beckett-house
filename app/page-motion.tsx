"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Inner-page counterpart of HomeMotion: the hero staggers in on load and the
// rest of the page reveals as it scrolls into view. Progressive enhancement —
// server-rendered content stays visible without JS or with reduced motion.
const REVEAL_TARGETS = [
  "h2",
  "article",
  "figure",
  "details",
  "blockquote",
  "table",
  "form",
  "section > p",
  ".schedule-card",
  ".term-card",
  ".gallery-card",
  ".fee-explorer",
  ".register-intro",
  ".about-useful-links a",
  ".montessori-section-copy > p",
  ".about-history-continuation > *",
  ".virtual-tour-experience",
].join(", ");

export default function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const main = document.querySelector("main");
    // Homepages run HomeMotion; the full-screen map page has its own entrance.
    if (!main || main.matches(".home-page, .nursery-chooser-page")) return;
    if (!Element.prototype.animate || !window.IntersectionObserver) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;

    const animations = new Set<Animation>();
    const reveal = (element: Element, delay = 0, image = false) => {
      const animation = element.animate(
        image
          ? [{ transform: "scale(1.025)" }, { transform: "scale(1)" }]
          : [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: image ? 1200 : 650, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" },
      );
      animations.add(animation);
      animation.onfinish = () => { animations.delete(animation); animation.cancel(); };
    };

    const hero = main.firstElementChild;
    if (hero) {
      const heroCopy = hero.querySelectorAll(":scope > :not(img, [class*='image']), :scope > [class*='copy'] > *");
      heroCopy.forEach((element, index) => reveal(element, index * 90));
      hero.querySelectorAll(":scope img").forEach((image) => reveal(image, 0, true));
    }

    // Reveal the outermost match only, so a card and its heading don't both animate.
    const candidates = [...main.querySelectorAll(REVEAL_TARGETS)].filter((element) => !hero?.contains(element));
    const targets = candidates.filter((element) => !candidates.some((other) => other !== element && other.contains(element)));

    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      visible.forEach((entry, index) => {
        reveal(entry.target, Math.min(index * 80, 160));
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    targets.forEach(element => observer.observe(element));

    const stop = () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    const onPreferenceChange = () => { if (preference.matches) stop(); };
    preference.addEventListener("change", onPreferenceChange);
    return () => { stop(); preference.removeEventListener("change", onPreferenceChange); };
  }, [pathname]);

  return null;
}
