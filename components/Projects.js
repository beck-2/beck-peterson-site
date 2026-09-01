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

function photoItem(category, file, width, height, type, extra = {}) {
  const filename = `${file}.jpeg`;
  return {
    title: titleFromFilename(filename),
    image: `/project_media/${category}/${filename}`,
    width,
    height,
    video: null,
    desc: "[Beck's description of this project goes here.]",
    location: null,
    materials: null,
    href: null,
    type: type || "solo",
    ...extra,
  };
}

function techItem({ title, image, video, width, height, desc, tech, href, type }) {
  return { title, image, video, width, height, desc, tech, href, type };
}

const CATEGORIES = [
  {
    key: "tech",
    label: "tech",
    items: [
      techItem({
        title: "Brain Computer Interface Games",
        image: "/project_media/tech/eeg-still.jpg",
        video: "/project_media/tech/eeg.mp4",
        width: 1920,
        height: 1080,
        desc: "made brain-controlled flappy bird and various visualizations of live eeg data",
        tech: ["Muse 2 EEG Headset", "Brainflow", "Godot"],
        href: "https://github.com/beck-2/fah_eeg",
        type: "solo",
      }),
      techItem({
        title: "Desmos Text",
        image: "/project_media/tech/desmos-still.jpg",
        video: "/project_media/tech/desmos.mp4",
        width: 640,
        height: 416,
        desc: "uses the desmos interface to create editable text made from equations in the graphing calculator",
        tech: ["Tampermonkey", "JS"],
        href: "https://github.com/beck-2/Desmos_Text",
        type: "solo",
      }),
      techItem({
        title: "RL Maze Agent",
        image: "/project_media/tech/RL.png",
        video: null,
        width: 1153,
        height: 1184,
        desc: "trained a Successor State Representation Agent with neural memory to navigate a figure-8 maze",
        tech: ["Python", "Gymnasium", "MiniGrid"],
        href: "https://github.com/beck-2/Reinforcement_Learning",
        type: "collab",
      }),
      techItem({
        title: "UCLA Web Dev",
        image: "/project_media/tech/Webdev.png",
        video: null,
        width: 1276,
        height: 1176,
        desc: "redesigned the UCLA Epicenter website for improved engagement and accessibility",
        tech: ["Figma", "WordPress", "Lighthouse"],
        href: "https://uclaepicenter.org/",
        type: "collab",
      }),
      techItem({
        title: "Trebuchet",
        image: "/project_media/tech/trebuchet-still.jpg",
        video: "/project_media/tech/trebuchet.mp4",
        width: 1920,
        height: 1080,
        desc: "recreated a medieval weapon in the English countryside",
        tech: ["Wood", "Handsaws", "Drills", "Patience"],
        href: null,
        type: "collab",
      }),
    ],
  },
  {
    key: "sketches",
    label: "sketches",
    items: [
      photoItem("sketches", "anglerfish", 802, 980, "solo", {
        location: "Dorm room",
        desc: "deep sea bioluminescence on black paper",
      }),
      photoItem("sketches", "beach", 768, 1024, "solo", {
        title: "Neon",
        location: "Will Rogers Beach",
        desc: "played around with the paint pen in my bag to make some funky fish",
      }),
      photoItem("sketches", "berlin", 768, 1024, "collab", {
        location: "Berlin",
        desc: "drawing class sheltered from the rain in local architecture after copying it onto paper",
      }),
      photoItem("sketches", "birds", 768, 1024, "solo", {
        location: "Berlin Natural History Museum",
        desc: "explored depth, time pressure, and not caring how messy my lines were",
      }),
      photoItem("sketches", "creature", 3120, 4234, "solo", {
        location: "Dorm room",
        desc: "created him because he needed to be born",
      }),
      photoItem("sketches", "duo", 1536, 2048, "collab", {
        location: "Park",
        desc: "teaching my love to draw",
      }),
      photoItem("sketches", "left_hand", 768, 1024, "solo", {
        location: "Indoors",
        desc: "more fluid than my right hand",
      }),
      photoItem("sketches", "right_hand", 768, 1024, "solo", {
        location: "Indoors",
        desc: "more accurate than my left hand",
      }),
      photoItem("sketches", "meeting", 768, 1024, "collab", {
        location: "Music cafe",
        desc: "had my first and last meeting with an artist-engineer-woman where we each drew one half of the notebook",
      }),
      photoItem("sketches", "musee", 1536, 2048, "solo", {
        location: "Paris Petit Palais",
        desc: "needed to sit down and sketch. Charcoal is unforgiving",
      }),
      photoItem("sketches", "rollercoaster", 768, 1024, "solo", {
        location: "Dorm room",
        desc: "too bored to complete but lovely lines everywhere",
      }),
      photoItem("sketches", "table", 768, 1024, "collab", {
        location: "Thanksgiving",
        desc: "one of many table decorations sketched during the feast",
      }),
      photoItem("sketches", "world", 768, 1024, "solo", {
        location: "Dorm room",
        desc: "I'd like to live here and meet this mythical deer",
      }),
      photoItem("sketches", "younger", 768, 1024, "solo", {
        location: "Dorm room",
        desc: "recreating what my twin and I looked like more than a decade ago",
      }),
    ],
  },
  {
    key: "creatures",
    label: "creatures i have picked up",
    items: [
      photoItem("creatures", "bug", 1536, 2048, "collab", { desc: null, location: "Tikal" }),
      photoItem("creatures", "gecko", 828, 934, "collab", { desc: null, location: "France" }),
      photoItem("creatures", "lizard", 768, 1024, "collab", { desc: null, location: "Spain" }),
      photoItem("creatures", "sheep", 768, 1024, "solo", { desc: null, location: "K-town" }),
      photoItem("creatures", "shelly", 768, 1024, "collab", { desc: null, location: "UCLA dorm" }),
      photoItem("creatures", "snails", 768, 1024, "solo", { desc: null, location: "Berlin" }),
      photoItem("creatures", "toad", 862, 912, "solo", { desc: null, location: "Guatemala" }),
      photoItem("creatures", "turtle", 1182, 665, "solo", { desc: null, location: "Ventana Wilderness" }),
    ],
  },
  {
    key: "creations",
    label: "creations",
    items: [
      photoItem("creations", "3d_print", 1536, 2048, "solo", {
        title: "Pokemon Print",
        materials: ["PLA Filament", "CAD", "Paint"],
        desc: "gift for my little in BruinAI since he loves Pokemon",
      }),
      photoItem("creations", "animals", 1536, 2048, "collab", {
        materials: ["Felt", "Hot Glue", "Marker"],
        desc: "thanksgiving placemarkers with everyone's favorite animals",
      }),
      photoItem("creations", "cross_stitch", 768, 1024, "solo", {
        materials: ["Fabric", "Thread"],
        desc: "my first time trying cross stitch, felt like I was a Jacquard loom",
      }),
      photoItem("creations", "jewelry", 1024, 768, "solo", {
        materials: ["Wire", "Beads", "Pliers"],
        desc: "made a swirly strong tree to hold my less strong jewelry",
      }),
      photoItem("creations", "kindergarten", 1024, 768, "collab", {
        materials: ["Wood", "Concrete", "Jigsaw", "Pickaxe"],
        desc: "designed and built a honey-themed kindergarten in the forest of Berlin",
      }),
      photoItem("creations", "watch", 768, 1024, "solo", {
        materials: ["Broken Watches", "Batteries", "Gears"],
        desc: "repaired my brother's watch collection even though he cares only for the fashion not the time",
      }),
    ],
  },
];

// A project video with a single play/pause control and nothing else. The
// video surface is left as a plain click target, so a click on it bubbles up
// to the card and closes it — clicking the frame never toggles playback, only
// this button does.
function ProjectVideo({ src, poster, title }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        playsInline
        autoPlay
        preload="auto"
        className="project-media"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        className="project-video-toggle"
        aria-label={`${playing ? "Pause" : "Play"} ${title}`}
        onClick={(e) => {
          // Keep the click off the card so it doesn't also close the video.
          e.stopPropagation();
          const video = videoRef.current;
          if (!video) return;
          if (video.paused) video.play();
          else video.pause();
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          {playing ? (
            <>
              <rect x="1.5" y="1" width="3" height="10" />
              <rect x="7.5" y="1" width="3" height="10" />
            </>
          ) : (
            <path d="M2 1 L11 6 L2 11 Z" />
          )}
        </svg>
      </button>
    </>
  );
}

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

function Carousel({ label, items, activeIndex, onActivate }) {
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
    // Source-of-truth scroll offset, kept as a float. Safari rounds
    // element.scrollLeft to an integer on every write, so the sub-pixel
    // per-frame drift increment (~0.3px) gets truncated away every time and
    // the track never actually moves. Accumulating the position here and
    // only writing the (rounded) result keeps the drift alive on WebKit.
    let position = viewport.scrollLeft;
    let frame = requestAnimationFrame(step);

    function step(time) {
      // Something other than this loop can move the scroll: an arrow nudge,
      // bringing a freshly-activated card into view, or a user swipe. Detect
      // that by comparing against our own last write and adopt the new spot
      // rather than fighting it. The threshold sits above the 1px rounding
      // Safari applies to our writes so it doesn't trip on that alone.
      if (Math.abs(viewport.scrollLeft - position) > 2) {
        position = viewport.scrollLeft;
      }
      // A backgrounded tab (phone locked, laptop on another tab for a while)
      // stops getting rAF callbacks, so the next one can arrive with a huge
      // elapsed delta — which would otherwise fling the position way out of
      // range in one jump and read as the drift having silently died.
      if (!reduce && !paused && lastTime !== null && time - lastTime < 250) {
        position += DRIFT_SPEED * (time - lastTime);
      }
      // Wraps regardless of paused/reduced-motion, so a manual arrow nudge
      // past either end always loops instead of hitting a dead stop. A loop
      // rather than one-shot correction, so it also recovers cleanly from
      // any out-of-range jump larger than a single half-width. Guarded on
      // halfWidth > 0: if this node gets detached mid-flight (e.g. a route
      // change unmounts it right as a frame was already scheduled, just
      // before cancelAnimationFrame takes effect), scrollWidth reads 0 and
      // `position -= 0` would never change anything — an infinite loop
      // that freezes the tab, not just a cosmetic glitch.
      const halfWidth = viewport.scrollWidth / 2;
      if (halfWidth > 0) {
        while (position >= halfWidth) {
          position -= halfWidth;
        }
        while (position < 0) {
          position += halfWidth;
        }
      }
      viewport.scrollLeft = position;
      lastTime = time;
      frame = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(frame);
  }, [paused]);

  // Positions the details panel directly under whichever card is active,
  // measured after React commits the .active class (and its enlarged size)
  // — a plain CSS position wouldn't work here since the card sits inside a
  // horizontally-clipped, drift-scrolled track.
  useEffect(() => {
    if (activeIndex === null) {
      setDetailsPos(null);
      return;
    }
    const cardEl = cardRefs.current[activeIndex];
    const carouselEl = carouselRef.current;
    const viewport = viewportRef.current;
    if (!cardEl || !carouselEl || !viewport) return;

    // If the clicked card was only partly visible, nudge the track just far
    // enough to bring it fully into view — a small correction rather than
    // re-centering, so the scroll position doesn't jump more than it needs to.
    const viewportRect = viewport.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();
    if (cardRect.left < viewportRect.left) {
      viewport.scrollLeft -= viewportRect.left - cardRect.left;
    } else if (cardRect.right > viewportRect.right) {
      viewport.scrollLeft += cardRect.right - viewportRect.right;
    }

    const settledCardRect = cardEl.getBoundingClientRect();
    const carouselRect = carouselEl.getBoundingClientRect();
    setDetailsPos({
      left: settledCardRect.left - carouselRect.left,
      top: settledCardRect.bottom - carouselRect.top + 8,
    });
  }, [activeIndex]);

  function toggle(i) {
    onActivate(i);
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
                      <ProjectVideo
                        src={item.video}
                        poster={item.image}
                        title={item.title}
                      />
                    ) : item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={item.width}
                        height={item.height}
                        sizes={isActive ? "700px" : "220px"}
                        style={{ height: isActive ? "360px" : "160px", width: "auto" }}
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
          {activeItem.location && <p className="project-location">{activeItem.location}</p>}
          {activeItem.desc && <p className="project-desc">{activeItem.desc}</p>}
          {(activeItem.tech || activeItem.materials) && (
            <p className="project-tech">{(activeItem.tech || activeItem.materials).join(" · ")}</p>
          )}
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
  // Lifted above the individual carousels so activating a card in one
  // carousel can clear whatever was active in another — each Carousel only
  // knows its own slice of this state, not its siblings.
  const [active, setActive] = useState(null); // { key, index } | null

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
        <Carousel
          key={cat.key}
          label={cat.label}
          items={cat.items}
          activeIndex={active?.key === cat.key ? active.index : null}
          onActivate={(index) =>
            setActive((prev) =>
              prev && prev.key === cat.key && prev.index === index ? null : { key: cat.key, index }
            )
          }
        />
      ))}
    </section>
  );
}
