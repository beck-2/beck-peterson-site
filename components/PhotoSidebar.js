// ABOUTME: The wide-layout left sidebar — a callout pointing at a vertical stack of abalone photos.
// ABOUTME: The photos repeat (cycling through the real set) until the stack reaches the bottom of the page's main content.
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const ABALONE_PHOTOS = Array.from(
  { length: 13 },
  (_, i) => `/images/abalone/abalone-${String(i + 1).padStart(2, "0")}.jpg`
);

const CIRCLE_SIZE = 64;
const CIRCLE_GAP = 24; // matches .photo-sidebar's 1.5rem gap

export default function PhotoSidebar() {
  const calloutRef = useRef(null);
  const [circleCount, setCircleCount] = useState(ABALONE_PHOTOS.length);

  // Repeats the photo set down to roughly the same height as the main
  // content column (About through Contact), so the pattern reaches the
  // bottom of the page instead of stopping partway. Measured against real
  // DOM heights rather than a guessed count, since Travel's snake path makes
  // the main column's height vary a lot.
  useEffect(() => {
    function measure() {
      const about = document.getElementById("about");
      const contact = document.getElementById("contact");
      const callout = calloutRef.current;
      if (!about || !contact || !callout) return;

      const mainColumnHeight = contact.getBoundingClientRect().bottom - about.getBoundingClientRect().top;
      const calloutHeight = callout.getBoundingClientRect().height;
      const remaining = mainColumnHeight - calloutHeight - CIRCLE_GAP;
      const count = Math.max(
        ABALONE_PHOTOS.length,
        Math.floor((remaining + CIRCLE_GAP) / (CIRCLE_SIZE + CIRCLE_GAP))
      );
      setCircleCount(count);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <aside className="photo-sidebar">
      <div className="photo-sidebar-callout" ref={calloutRef}>
        <span className="photo-sidebar-callout-text">
          abalone&rsquo;s unique microstructure gives it cool colors!
        </span>
        <span className="photo-sidebar-callout-arrow" aria-hidden="true">
          ↓
        </span>
      </div>
      {Array.from({ length: circleCount }).map((_, i) => {
        const src = ABALONE_PHOTOS[i % ABALONE_PHOTOS.length];
        return (
          <div className="photo-placeholder" key={i}>
            <Image
              src={src}
              alt={`Macro photo of abalone shell, ${(i % ABALONE_PHOTOS.length) + 1}`}
              fill
              sizes="64px"
              style={{ objectFit: "cover" }}
            />
          </div>
        );
      })}
    </aside>
  );
}
