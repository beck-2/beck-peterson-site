// ABOUTME: Projects — four horizontally auto-scrolling carousels (tech, sketches, creatures, creations).
// ABOUTME: Cards drift ambiently until clicked; the clicked card enlarges, pauses its row, and reveals its description/link/video/type.
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// px/ms the track drifts during ambient (unpaused) scrolling.
const DRIFT_SPEED = 0.02;
// How far one click of an arrow advances the row.
const ARROW_STEP = 220;

// "3d_print" -> "3D Print"; a leading digit-run gets uppercased since plain
// title-casing would otherwise leave it as "3d".
function titleFromFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, "");
  return base
    .split(/[_-]+/)
    .map((word) => (/^\d/.test(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

function photoItem(category, file, width, height, type) {
  const filename = `${file}.jpeg`;
  return {
    title: titleFromFilename(filename),
    image: `/project_media/${category}/${filename}`,
    width,
    height,
    video: null,
    desc: "[Beck's description of this project goes here.]",
    href: null,
    type: type || "solo",
  };
}

function placeholderItems(count, withLinks) {
  return Array.from({ length: count }, (_, i) => ({
    title: `[project ${i + 1}]`,
    image: null,
    width: null,
    height: null,
    video: null,
    desc: "[Beck's description of this project goes here.]",
    href: withLinks ? "#" : null,
    type: i % 2 === 0 ? "solo" : "collab",
  }));
}

const CATEGORIES = [
  { key: "tech", label: "tech", items: placeholderItems(4, true) },
  {
    key: "sketches",
    label: "sketches",
    items: [
      photoItem("sketches", "anglerfish", 802, 980),
      photoItem("sketches", "beach", 768, 1024),
      photoItem("sketches", "berlin", 768, 1024, "collab"),
      photoItem("sketches", "birds", 768, 1024),
      photoItem("sketches", "creature", 3120, 4234),
      photoItem("sketches", "duo", 1536, 2048, "collab"),
      photoItem("sketches", "left_hand", 768, 1024),
      photoItem("sketches", "right_hand", 768, 1024),
      photoItem("sketches", "meeting", 768, 1024, "collab"),
      photoItem("sketches", "musee", 1536, 2048),
      photoItem("sketches", "rollercoaster", 768, 1024),
      photoItem("sketches", "table", 768, 1024),
      photoItem("sketches", "world", 768, 1024),
      photoItem("sketches", "younger", 768, 1024),
    ],
  },
  {
    key: "creatures",
    label: "creatures i have picked up",
    items: [
      photoItem("creatures", "bug", 1536, 2048),
      photoItem("creatures", "gecko", 828, 934),
      photoItem("creatures", "lizard", 768, 1024),
      photoItem("creatures", "sheep", 768, 1024),
      photoItem("creatures", "shelly", 768, 1024),
      photoItem("creatures", "snails", 768, 1024),
      photoItem("creatures", "toad", 862, 912),
      photoItem("creatures", "turtle", 1182, 665),
    ],
  },
  {
    key: "creations",
    label: "creations",
    items: [
      photoItem("creations", "3d_print", 1536, 2048),
      photoItem("creations", "animals", 1536, 2048),
      photoItem("creations", "cross_stitch", 768, 1024),
      photoItem("creations", "jewelry", 1024, 768),
      photoItem("creations", "kindergarten", 1024, 768, "collab"),
      photoItem("creations", "watch", 768, 1024),
    ],
  },
];

function TypeDots({ type }) {
  return (
    <div className={"project-type-dots" + (type === "collab" ? " collab" : " solo")}>
      {type === "collab" ? (
        <>
          <span className="project-dot" />
          <span className="project-dot" />
        </>
      ) : (
        <span className="project-dot" />
      )}
    </div>
  );
}

function Carousel({ label, items }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [detailsPos, setDetailsPos] = useState(null);
  const paused = activeIndex !== null;
  const carouselRef = useRef(null);
  const viewportRef = useRef(null);
  const cardRefs = useRef([]);
  // Rendered twice back-to-back so the drift can loop seamlessly — once the
  // scroll position passes one copy's width, it jumps back by that same
  // width onto identical content, which reads as an unbroken loop.
  const doubled = [...items, ...items];

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lastTime = null;
    let frame = requestAnimationFrame(step);

    function step(time) {
      if (!reduce && !paused && lastTime !== null) {
        viewport.scrollLeft += DRIFT_SPEED * (time - lastTime);
      }
      // Wraps regardless of paused/reduced-motion, so a manual arrow nudge
      // past either end always loops instead of hitting a dead stop.
      const halfWidth = viewport.scrollWidth / 2;
      if (viewport.scrollLeft >= halfWidth) {
        viewport.scrollLeft -= halfWidth;
      } else if (viewport.scrollLeft < 0) {
        viewport.scrollLeft += halfWidth;
      }
      lastTime = time;
      frame = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(frame);
  }, [paused]);

  // Positions the details panel directly under whichever card is active,
  // measured after React commits the .active class (and its enlarging
  // transform) — a plain CSS position wouldn't work here since the card
  // sits inside a horizontally-clipped, drift-scrolled track.
  useEffect(() => {
    if (activeIndex === null) {
      setDetailsPos(null);
      return;
    }
    const cardEl = cardRefs.current[activeIndex];
    const carouselEl = carouselRef.current;
    if (!cardEl || !carouselEl) return;
    const cardRect = cardEl.getBoundingClientRect();
    const carouselRect = carouselEl.getBoundingClientRect();
    setDetailsPos({
      left: cardRect.left - carouselRect.left,
      top: cardRect.bottom - carouselRect.top + 8,
    });
  }, [activeIndex]);

  function toggle(i) {
    setActiveIndex((prev) => (prev === i ? null : i));
  }

  function advance(direction) {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // A plain scrollLeft nudge, not scrollBy(behavior: "smooth") — the
    // ambient drift's rAF loop mutates scrollLeft every frame too, and
    // fighting the browser's own smooth-scroll animation for the same
    // property made the "smooth" advance never actually get anywhere.
    viewport.scrollLeft += direction * ARROW_STEP;
  }

  const activeItem = activeIndex !== null ? items[activeIndex % items.length] : null;

  return (
    <div className="project-carousel" ref={carouselRef}>
      <div className="favorites-group-head">
        <span className="mono-label">{label}</span>
      </div>
      <div className="project-track-row">
        <button
          type="button"
          className="project-arrow"
          onClick={() => advance(-1)}
          aria-label={`Scroll ${label} left`}
        >
          ‹
        </button>
        <div className="project-track-viewport" ref={viewportRef}>
          <div className="project-track">
            {doubled.map((item, i) => {
              // Compared against the raw doubled-array index, not i % items.length —
              // otherwise clicking one card would also mark its off-screen duplicate
              // (rendered elsewhere in the loop) active at the same time.
              const isActive = paused && i === activeIndex;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className={"project-card" + (isActive ? " active" : "")}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(i);
                    }
                  }}
                >
                  <div className="project-frame">
                    {isActive && item.video ? (
                      <video
                        src={item.video}
                        controls
                        playsInline
                        className="project-media"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={item.width}
                        height={item.height}
                        sizes="220px"
                        style={{ height: "160px", width: "auto" }}
                      />
                    ) : (
                      <div className="project-frame-placeholder" />
                    )}
                  </div>
                  <div className="project-meta">
                    {!isActive && <TypeDots type={item.type} />}
                    <div className="project-title">{item.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          className="project-arrow"
          onClick={() => advance(1)}
          aria-label={`Scroll ${label} right`}
        >
          ›
        </button>
      </div>
      {activeItem && detailsPos && (
        <div className="project-details" style={{ left: detailsPos.left, top: detailsPos.top }}>
          <p className={"project-type-label" + (activeItem.type === "collab" ? " collab" : " solo")}>
            {activeItem.type === "collab" ? "collaboration" : "solo"}
          </p>
          <p className="project-desc">{activeItem.desc}</p>
          {activeItem.href && (
            <a href={activeItem.href} target="_blank" rel="noopener noreferrer" className="project-link">
              view →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  return (
    <section className="block" id="projects">
      <div className="section-head">
        <h2 className="stamp">projects</h2>
      </div>
      <div className="project-callout">
        <span className="project-callout-text">click to learn more</span>
        <span className="project-callout-arrow" aria-hidden="true">
          ↓
        </span>
      </div>
      {CATEGORIES.map((cat) => (
        <Carousel key={cat.key} label={cat.label} items={cat.items} />
      ))}
    </section>
  );
}
