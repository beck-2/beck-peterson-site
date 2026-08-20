// ABOUTME: The pink spiral portal link — the same icon leads into the portal
// ABOUTME: page and, from inside it, back out again.
import Link from "next/link";

// A simple Archimedean spiral (radius grows linearly with angle), computed
// once as a fixed path rather than hand-plotted point by point.
function buildSpiralPath(turns, maxRadius, steps) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * turns * Math.PI * 2;
    const radius = t * maxRadius;
    points.push(`${(radius * Math.cos(angle)).toFixed(2)},${(radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${points.join(" L")}`;
}

const SPIRAL_PATH = buildSpiralPath(3.5, 44, 200);

export default function Spiral({ href, size = 56, className, ariaLabel }) {
  return (
    <Link
      href={href}
      className={"spiral-link" + (className ? ` ${className}` : "")}
      aria-label={ariaLabel}
    >
      <svg
        viewBox="-50 -50 100 100"
        width={size}
        height={size}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
      >
        {/* fill:none on the spiral itself means only its thin stroke is
            clickable — this invisible disc gives the whole icon a real
            hit area instead of just the curve. */}
        <circle r="50" fill="transparent" stroke="none" />
        <path d={SPIRAL_PATH} />
      </svg>
    </Link>
  );
}
