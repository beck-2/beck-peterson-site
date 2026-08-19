// ABOUTME: Projects — four horizontally auto-scrolling carousels (tech, sketches, creatures, creations).
// ABOUTME: Cards drift ambiently until clicked; the clicked card enlarges, pauses its row, and reveals its description/link/video.
"use client";

import { useState } from "react";
import Image from "next/image";

function placeholderItems(count, withLinks) {
  return Array.from({ length: count }, (_, i) => ({
    title: `[project ${i + 1}]`,
    image: null,
    video: null,
    desc: "[Beck's description of this project goes here.]",
    href: withLinks ? "#" : null,
  }));
}

const CATEGORIES = [
  { key: "tech", label: "tech", items: placeholderItems(4, true) },
  { key: "sketches", label: "sketches", items: placeholderItems(4, false) },
  { key: "creatures", label: "creatures i have picked up", items: placeholderItems(4, false) },
  { key: "creations", label: "creations", items: placeholderItems(4, false) },
];

function Carousel({ label, items }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const paused = activeIndex !== null;
  // Rendered twice back-to-back so the drift animation can loop seamlessly
  // (translating by exactly one copy's width lands back on identical content).
  const doubled = [...items, ...items];

  function toggle(i) {
    setActiveIndex((prev) => (prev === i ? null : i));
  }

  return (
    <div className="project-carousel">
      <div className="favorites-group-head">
        <span className="mono-label">{label}</span>
      </div>
      <div className="project-track-viewport">
        <div className={"project-track" + (paused ? " paused" : "")}>
          {doubled.map((item, i) => {
            const itemIndex = i % items.length;
            const isActive = paused && itemIndex === activeIndex;
            return (
              <div
                key={i}
                className={"project-card" + (isActive ? " active" : "")}
                role="button"
                tabIndex={0}
                onClick={() => toggle(itemIndex)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(itemIndex);
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
                    <Image src={item.image} alt={item.title} fill sizes="200px" style={{ objectFit: "cover" }} />
                  ) : (
                    <div className="project-frame-placeholder" />
                  )}
                </div>
                <div className="project-title">{item.title}</div>
                {isActive && (
                  <div className="project-details">
                    <p className="project-desc">{item.desc}</p>
                    {item.href && (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        view →
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
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
