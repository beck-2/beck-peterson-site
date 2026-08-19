// ABOUTME: Projects — four horizontally auto-scrolling carousels (tech, sketches, creatures, creations).
// ABOUTME: Cards drift ambiently until clicked; the clicked card enlarges, pauses its row, and reveals its description/link/video/type.
"use client";

import { useState } from "react";
import Image from "next/image";

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
    // Real solo/collaboration status per photo hasn't been given yet —
    // defaulting to solo until Beck says otherwise for specific ones.
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
      photoItem("sketches", "berlin", 768, 1024),
      photoItem("sketches", "birds", 768, 1024),
      photoItem("sketches", "creature", 3120, 4234),
      photoItem("sketches", "duo", 1536, 2048),
      photoItem("sketches", "left_hand", 768, 1024),
      photoItem("sketches", "meeting", 768, 1024),
      photoItem("sketches", "musee", 1536, 2048),
      photoItem("sketches", "right_hand", 768, 1024),
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
      photoItem("creations", "kindergarten", 1024, 768),
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
                  {!isActive && <TypeDots type={item.type} />}
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
                <div className="project-title">{item.title}</div>
                {isActive && (
                  <div className="project-details">
                    <p className={"project-type-label" + (item.type === "collab" ? " collab" : " solo")}>
                      {item.type === "collab" ? "collaboration" : "solo"}
                    </p>
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
