// ABOUTME: The Travel section — a snaking scroll-linked path of polaroid stops per trip.
// ABOUTME: Ported from prototype/field-notes.html; stop markup is React-owned, positioning/scroll-tracking stays imperative.
"use client";

import { useEffect, useRef, useState } from "react";

const ORDINALS = ["one", "two", "three", "four", "five"];

function makeStops(tripLabel, count) {
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      cap: `[photo — ${tripLabel.toLowerCase()} stop ${i + 1}]`,
      place: `Stop ${ORDINALS[i] || i + 1} · [place, year]`,
      desc: "[Beck's description of this trip goes here.]",
    });
  }
  return list;
}

const TRIPS = {
  solo: {
    label: "Solo",
    year: 2026,
    blurb: "[Beck's few-line intro to the solo trip goes here.]",
    stops: makeStops("Solo", 5),
  },
  volcano: {
    label: "Volcano",
    year: 2026,
    blurb: "[Beck's few-line intro to the volcano trip goes here.]",
    stops: makeStops("Volcano", 2),
  },
  study: {
    label: "Study",
    year: 2025,
    blurb: "[Beck's few-line intro to the study trip goes here.]",
    stops: makeStops("Study", 4),
  },
  film: {
    label: "Film",
    year: 2011,
    blurb: "[Beck's few-line intro to the film trip goes here.]",
    stops: makeStops("Film", 3),
  },
};

const STICKY_FRAC = 0.38; // must match .plane-track's `top: 38vh` in globals.css
const EDGE_FADE = 110; // px of route the plane fades in/out over at each end

// Smooth curve through a point set (Catmull-Rom -> cubic Bezier).
function smoothPath(points) {
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export default function TravelSnake() {
  const [activeKey, setActiveKey] = useState("solo");
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const pathRef = useRef(null);
  const planeRef = useRef(null);

  // Re-runs on every trip switch: reads the freshly-rendered .stop elements
  // for this trip, builds the snake path, and wires up scroll/resize tracking.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    const path = pathRef.current;
    const plane = planeRef.current;
    if (!wrap || !svg || !path || !plane) return;

    const stops = Array.prototype.slice.call(wrap.querySelectorAll(".stop"));
    if (!stops.length) return;

    let anchors = [];
    let len = 0;
    let stopLens = [];
    let samples = [];

    function layout() {
      const W = wrap.getBoundingClientRect().width;
      const segH = 300;
      const leftX = W * 0.18;
      const rightX = W * 0.82;
      const topPad = 30;

      // Path anchors: one per stop, alternating left/right so the line
      // snakes back and forth. No lead-in point before the first stop —
      // that segment read as too flat/horizontal to track smoothly.
      anchors = stops.map((stop, i) => ({
        x: i % 2 === 0 ? leftX : rightX,
        y: topPad + i * segH,
      }));
      const lastY = anchors[anchors.length - 1].y;
      const totalH = lastY + 360; // room for the last hanging pin + polaroid + caption

      wrap.style.height = `${totalH}px`;
      svg.setAttribute("width", W);
      svg.setAttribute("height", totalH);
      svg.setAttribute("viewBox", `0 0 ${W} ${totalH}`);
      path.setAttribute("d", smoothPath(anchors));
      len = path.getTotalLength();

      // Sample the path finely to find each stop's arc-length position.
      const SAMPLES = 600;
      samples = [];
      for (let s = 0; s <= SAMPLES; s++) {
        const l = (s / SAMPLES) * len;
        samples.push({ l, pt: path.getPointAtLength(l) });
      }
      stopLens = stops.map((stop, i) => {
        const target = anchors[i];
        let best = samples[0];
        samples.forEach((sm) => {
          const d2 = (sm.pt.x - target.x) ** 2 + (sm.pt.y - target.y) ** 2;
          const bestD2 = (best.pt.x - target.x) ** 2 + (best.pt.y - target.y) ** 2;
          if (d2 < bestD2) best = sm;
        });
        return best.l;
      });

      stops.forEach((stop, i) => {
        const a = anchors[i];
        stop.style.left = `${a.x}px`;
        stop.style.top = `${a.y}px`;
      });

      if (reduce) {
        const startPt = path.getPointAtLength(0);
        plane.style.transform = `translate(${startPt.x}px, 0)`;
      } else {
        update();
      }
    }

    // Finds the sample whose y is closest to targetY (the path's local y
    // that currently lines up with the plane's fixed on-screen altitude).
    function sampleNearestY(targetY) {
      let best = samples[0];
      for (let i = 1; i < samples.length; i++) {
        if (Math.abs(samples[i].pt.y - targetY) < Math.abs(best.pt.y - targetY)) best = samples[i];
      }
      return best;
    }

    function update() {
      const svgTop = svg.getBoundingClientRect().top + window.scrollY;
      const lastY = anchors[anchors.length - 1].y;
      const rawY = window.scrollY + window.innerHeight * STICKY_FRAC - svgTop;
      const targetY = Math.min(lastY, Math.max(0, rawY));

      const sample = sampleNearestY(targetY);
      const atLen = sample.l;
      const pt = sample.pt;
      const pt2 = path.getPointAtLength(Math.min(len, atLen + 1));
      const angle = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI + 90;
      plane.style.transform = `translate(${pt.x}px, 0) rotate(${angle}deg)`;

      // Fade in a bit after the route starts and fade out a bit before it
      // ends, so the plane doesn't pop in/out right at the section edges.
      const fadeIn = Math.min(1, Math.max(0, rawY / EDGE_FADE));
      const fadeOut = Math.min(1, Math.max(0, (lastY - rawY) / EDGE_FADE));
      plane.style.opacity = Math.min(fadeIn, fadeOut);

      let closest = 0;
      let closestDist = Infinity;
      stopLens.forEach((l, i) => {
        const dist = Math.abs(l - atLen);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      stops.forEach((stop, i) => stop.classList.toggle("active", i === closest));
    }

    layout();

    if (!reduce) {
      document.addEventListener("scroll", update, { passive: true });
    }
    window.addEventListener("resize", layout);

    return () => {
      document.removeEventListener("scroll", update);
      window.removeEventListener("resize", layout);
    };
  }, [activeKey]);

  const trip = TRIPS[activeKey];

  return (
    <section className="block" id="travel">
      <div className="section-head">
        <h2 className="stamp">Travel</h2>
        <span className="mono-label">{trip.year}</span>
        <div className="trip-tabs" role="tablist" aria-label="Trips">
          {Object.entries(TRIPS).map(([key, t]) => (
            <button
              key={key}
              type="button"
              className={"trip-tab" + (key === activeKey ? " active" : "")}
              role="tab"
              aria-selected={key === activeKey}
              onClick={() => setActiveKey(key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="trip-blurb">{trip.blurb}</p>
      <div className="travel-snake" ref={wrapRef}>
        <div className="plane-track">
          <svg ref={planeRef} className="plane-icon" width="28" height="28" viewBox="-14 -14 28 28">
            <path
              d="M0,-11 C1.4,-11 2,-8.6 2,-6.4 L2,-3.6 L9.6,1.8 L9.6,4 L2,1.6 L2,6.6 L4.8,9 L4.8,10.6 L0,9 L-4.8,10.6 L-4.8,9 L-2,6.6 L-2,1.6 L-9.6,4 L-9.6,1.8 L-2,-3.6 L-2,-6.4 C-2,-8.6 -1.4,-11 0,-11 Z"
              fill="var(--brass)"
              stroke="var(--ink)"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <svg ref={svgRef} className="route">
          <path
            ref={pathRef}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeDasharray="1 9"
            strokeLinecap="round"
          />
        </svg>
        {trip.stops.map((data, i) => (
          <div className="stop" key={`${activeKey}-${i}`}>
            <div className="pin" />
            <div className="thread" />
            <div className="polaroid">
              <div className="frame" />
              <div className="cap">{data.cap}</div>
            </div>
            <div className="text">
              <div className="place">{data.place}</div>
              <div className="desc">{data.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
