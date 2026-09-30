"use client";

import { useEffect } from "react";

// Progressive enhancement: server-rendered content stays visible without JS.
export default function HomeMotion() {
  useEffect(() => {
    const root = document.querySelector(".home-page");
    if (!root || !Element.prototype.animate || !window.IntersectionObserver) return;
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

    root.querySelectorAll(".homepage-photo-hero .wide-photo-caption > *").forEach((element, index) => reveal(element, index * 90));
    const heroImage = root.querySelector(".homepage-photo-hero > .hero-slides");
    if (heroImage) reveal(heroImage, 0, true);

    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      visible.forEach((entry, index) => {
        reveal(entry.target, Math.min(index * 80, 160));
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    root.querySelectorAll(
      ".announcement-card, .manifesto-heading, .manifesto-photo, .principle-card, .explorer-copy, .nursery-life-intro, .life-photo-card, .locations .section-heading, .home-highlights-intro, .home-highlight-cards > article, .answers-heading",
    ).forEach(element => observer.observe(element));

    const stop = () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      animations.clear();
    };
    const onPreferenceChange = () => { if (preference.matches) stop(); };
    preference.addEventListener("change", onPreferenceChange);
    return () => { stop(); preference.removeEventListener("change", onPreferenceChange); };
  }, []);

  return null;
}
