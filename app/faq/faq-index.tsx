"use client";

import { useEffect, useState } from "react";

export default function FaqIndex({ groups }: { groups: { id: string; heading: string }[] }) {
  const [activeId, setActiveId] = useState(groups[0]?.id);

  useEffect(() => {
    const headings = groups.map(({ id }) => document.getElementById(`${id}-heading`));
    const update = () => {
      // Keep the last heading to pass the reading line active until the next one arrives.
      let current = groups[0]?.id;
      headings.forEach((heading, index) => {
        if (heading && heading.getBoundingClientRect().top <= 128) current = groups[index].id;
      });
      setActiveId(current);
    };
    const observer = new IntersectionObserver(update, {
      rootMargin: "-112px 0px 0px 0px",
      threshold: [0, 1],
    });
    headings.forEach((heading) => { if (heading) observer.observe(heading); });
    update();
    return () => observer.disconnect();
  }, [groups]);

  return (
    <nav className="faq-page-index" aria-label="Frequently asked question topics">
      <p>On this page</p>
      <ol>
        {groups.map(({ id, heading }) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={activeId === id ? "location" : undefined}>{heading}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
