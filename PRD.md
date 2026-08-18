# Beck Peterson — Personal Site PRD

## Overview

An indie personal website for Beck Peterson to share with friends and professionals. It should feel distinctly human and creative — a place to learn about Beck, not a portfolio template. It will start barebones and grow section by section.

**Hard constraint: every word of on-site copy is written by Beck, not AI.** Sections without finished copy yet ship with clearly-labeled placeholders, never invented prose.

## Tech Stack

- **Framework:** Next.js (React) — chosen over a standalone Express server because Vercel runs functions as serverless, not as a long-lived process. Next.js API routes give us the "Node.js" and effectively the "Express" role in MERN without fighting the platform.
- **Database:** MongoDB Atlas (free tier to start), accessed from Next.js API routes.
- **Hosting:** Vercel.
- **Styling:** HTML/CSS via React components (JSX). Approach (CSS Modules vs. a utility framework) TBD alongside the visual design decision below.
- **Media:** binary assets (images, inspo) are never stored in Mongo — a dedicated `/media` folder in the repo holds images Beck drops in directly; user-generated content (e.g. guestbook drawings) goes to an object store (e.g. Cloudinary/S3), not the database.

### Security baseline (nothing exotic, just fundamentals)

- Parameterized/ODM queries (Mongoose) — no raw string-built Mongo queries, avoids injection.
- Input validation + sanitization on every API route, especially the guestbook (free-text + drawing submissions are the main untrusted-input surface).
- Rate limiting / basic spam protection (e.g. honeypot field or lightweight CAPTCHA) on the guestbook and contact form.
- Env vars (DB connection string, admin credentials, email service keys) via Vercel's env var dashboard, never committed.
- Admin-only guestbook deletion gated behind real auth, not a hidden URL.
- CORS locked to the site's own origin (relevant mainly if the API is ever called from elsewhere).
- Helmet-equivalent security headers via Next.js config.

## Repo Conventions

- `/media` — a dumping ground for inspo images and assets Beck wants incorporated. Not build output; not committed as a build artifact source of truth for final optimized assets (those live wherever Next.js expects static assets), just a working folder.

## Sections

### About
Beck Peterson. "A little observer of a big universe." Expandable/dropdown paragraph: "Studying the human brain to improve our knowledge of artificial intelligence and vice versa. Exploring consciousness with no answers yet (let me know if you have some!)"

### Travel
Dropdown/expandable section. A swirly connecting line with an airplane that animates along it as the user scrolls. Stops are in chronological order; each stop is a polaroid-style photo "tacked on" with a digital pushpin, with a short description underneath. Ships with grey image placeholders and placeholder description slots — Beck supplies real photos and writes the text.

### Fun Facts
A loose, jumbled collection of fun facts and links Beck compiles over time. Deliberately not a rigid grid — more of a scattered collection feel.

### Projects
Things Beck has created — some link to GitHub, some are physical (e.g. art). Includes a flip-through digital recipe book that Beck populates with favorite recipes.

### Stats
Links out to Beck's Goodreads, Letterboxd, Beli, and Hevy — a life-tracking dashboard of sorts. Also hosts a visitor-contributed histogram: "roughly how many frogs have you held?" (Beck's own answer: ~150, shown as a fixed reference marker on the chart, not a submission). Real feature, implemented — see below.

### Thoughts
A blog section.

### Contact
A direct-send email box, plus links to wherever else people might want to reach Beck.

### Guestbook
Visitors leave a short message and/or drawing. Visible as a scrollable feed, styled as a sidebar. Admin (Beck) can delete any entry at any time.

## Process

1. Mock up multiple distinct visual directions before committing to one (in progress).
2. Once a direction is chosen, scaffold the Next.js app with the basic structure/nav across all sections (placeholder content where copy doesn't exist yet).
3. Fill in section by section as Beck supplies real copy, photos, and content.

## Visual Direction — Chosen

"Field Notes": a travel-journal register. Light manila-paper background, warm near-black ink, a medium/light pink accent (nav states, headings, links), brass for pushpins and stamped dates. Slab-serif display type, warm serif body copy, typewriter mono for labels/dates. Working prototype lives at `/prototype/field-notes.html` (static HTML/CSS, no build step — a design reference for the rest of the site). Its design tokens/base styles have been ported into `app/globals.css` for the real app.

## Real App — Started

The Next.js app now lives at the repo root (`app/`, `components/`, `lib/`, `models/`). Projects, Fun Facts, and Thoughts are still placeholder shells ported from the prototype — About, Travel, and the Stats/frog-chart feature are fully real.

**Travel** (`components/TravelSnake.js`): the snake-path/plane/tabs system ported 1:1 from the prototype. Stop markup (pin/thread/polaroid/caption) is rendered declaratively per trip from a `TRIPS` object; the snake path generation, sticky-plane scroll tracking, edge fade, and proximity highlight stay imperative (a `useEffect` keyed on the active trip, operating on refs) since that logic is fundamentally a scroll-linked animation, not view state — rewriting it as declarative React state would risk subtly changing behavior that took many iterations to get right.

**Frog chart** (`components/FrogChart.js`, `app/api/frogs/route.js`, `models/FrogSubmission.js`): visitors submit a number for "roughly how many frogs have you held?"; the histogram (log-scaled bins, since answers cluster near zero) is rendered from all submissions, with Beck's own value (150) shown as a fixed marker rather than a submission.

- **One submission per visitor, editable:** identified by an httpOnly cookie (90-day, not a strict browser-session cookie — chosen so a returning visitor can still fix their number, at the cost of not matching "session" in the narrowest sense; revisit if that's not what was wanted). The submission doc is upserted by that cookie's ID, so resubmitting edits rather than duplicating.
- **Hidden range cap:** server validates 0–1000 and returns the same generic error message regardless of why a value was rejected (too high, negative, not a number) — the client never sees the bound.
- **Rate limiting (best-effort, no external service):** a 3-second cooldown between edits from the same session, plus a per-IP cap of 20 new (not-yet-existing) sessions per hour to blunt cookie-clearing abuse. Both live in MongoDB rather than in-memory, since Vercel serverless functions don't share memory reliably across invocations.
- **Local dev:** if `MONGODB_URI` isn't set, `lib/mongodb.js` falls back to an in-memory MongoDB (`mongodb-memory-server`) automatically — nothing to configure to start hacking, but data doesn't persist across dev server restarts. Production requires a real `MONGODB_URI` (see `.env.local.example`).

## Open Decisions

- CSS approach: CSS Modules / plain CSS vs. a utility framework — to be settled once more of the site is ported over.
- Guestbook drawing input mechanism (canvas-based sketch vs. simple markup) and storage target.
- Porting the Guestbook sidebar into a real React component (still prototype-only).
