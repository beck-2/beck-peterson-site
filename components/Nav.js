// ABOUTME: Site navigation bar, sticky at the top of every page.
// ABOUTME: Tracks which section is in view and marks its link current as you scroll or click.
"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

// [section id, link label] in the order they appear down the page.
const SECTIONS = [
  ["about", "about"],
  ["projects", "projects"],
  ["travel", "travel"],
  ["favorites", "favorites"],
  ["stats", "stats"],
  ["facts", "fun links"],
  ["contact", "contact"],
];

export default function Nav() {
  const [active, setActive] = useState("about");

  useEffect(() => {
    const ids = SECTIONS.map(([id]) => id);

    function update() {
      // The current section is the last one whose top has scrolled up past an
      // activation line set ~30% of the way down the viewport (just below the
      // sticky header at the top of that range).
      const headerBottom = 72;
      const line = headerBottom + (window.innerHeight - headerBottom) * 0.3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // The last couple of sections are shorter than the content trailing
      // them (the footer disclaimer, the portal link), so their tops can't
      // reach the line before the page runs out of scroll. Once we're within
      // a nudge of the bottom, hand it to the final section.
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 40) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="name stamp">Beck Peterson</div>
      <nav>
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={id === active ? "current" : undefined}>
            {label}
          </a>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  );
}
