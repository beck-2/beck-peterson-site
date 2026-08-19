# Beck Peterson — Personal Site PRD

## Overview

An indie personal website for Beck Peterson to share with friends and professionals. It should feel distinctly human and creative — a place to learn about Beck, not a portfolio template. It will start barebones and grow section by section.

**Hard constraint: every word of on-site copy is written by Beck, not AI.** Sections without finished copy yet ship with clearly-labeled placeholders, never invented prose.

## Tech Stack

- **Framework:** Next.js (React) — chosen over a standalone Express server because Vercel runs functions as serverless, not as a long-lived process. Next.js API routes give us the "Node.js" and effectively the "Express" role in MERN without fighting the platform.
- **Database:** MongoDB Atlas (free tier to start), accessed from Next.js API routes.
- **Hosting:** Vercel.
- **Styling:** HTML/CSS via React components (JSX). Approach (CSS Modules vs. a utility framework) TBD alongside the visual design decision below.
- **Media:** binary assets (images, inspo) are never stored in Mongo — a dedicated `/media` folder in the repo holds images Beck drops in directly. Exception: Logbook drawings, which are small (capped, canvas-sourced PNGs) and stored inline as data URLs in MongoDB rather than in a separate object store — simpler for a personal site at this scale, revisit if drawings get larger or more numerous than Mongo's document size comfortably allows.

### Security baseline (nothing exotic, just fundamentals)

- Parameterized/ODM queries (Mongoose) — no raw string-built Mongo queries, avoids injection.
- Input validation + sanitization on every API route, especially the Logbook (free-text + drawing submissions are the main untrusted-input surface).
- Rate limiting / basic spam protection (e.g. honeypot field or lightweight CAPTCHA) on the Logbook and contact form.
- Env vars (DB connection string, admin credentials, email service keys) via Vercel's env var dashboard, never committed.
- Admin-only Logbook deletion gated behind real auth, not a hidden URL.
- CORS locked to the site's own origin (relevant mainly if the API is ever called from elsewhere).
- Helmet-equivalent security headers via Next.js config.

## Repo Conventions

- `/media` — a dumping ground for inspo images and assets Beck wants incorporated. Not build output; not committed as a build artifact source of truth for final optimized assets (those live wherever Next.js expects static assets), just a working folder.

## Sections

### About
Beck Peterson. "a little observer in a big universe!" Expandable/dropdown paragraph: "Studying the human brain to improve our knowledge of artificial intelligence and vice versa. Exploring consciousness with no answers yet (let me know if you have some!)"

### Travel
Dropdown/expandable section. A swirly connecting line with an airplane that animates along it as the user scrolls. Stops are in chronological order; each stop is a polaroid-style photo "tacked on" with a digital pushpin, with a short description underneath. Real feature, implemented (four real trips with Beck's own blurbs) — see below.

### fun links
A loose, jumbled collection of fun facts and links Beck compiles over time (originally called "Fun Facts," renamed). Deliberately not a rigid grid — more of a scattered collection feel. Real feature: five real hyperlinked picks (randomness, "parachutes don't work," life, isochrone map, qualia).

### Projects
Things Beck has created — some link to GitHub, some are physical (e.g. art).

### Favorites
Side-by-side collections, each linked out to the tracker Beck actually uses for that thing. No "Books"/"Movies"/etc. headings — just the visualization and the link:
- **Books:** a bookshelf visual holding Beck's top ten, spines lettered with the title, linked to Goodreads. One book leans diagonally against its neighbor, marked "currently reading" with an arrow.
- **Movies:** posters scattered about (not a grid) for Beck's top five, linked to Letterboxd.
- **Songs:** little scattered discs for Beck's favorites, linked to Spotify. (Spotify's API can pull real top-tracks data, but as of the Feb/March 2026 developer-mode migration that requires the linked Spotify account to have Premium — worth deciding on before wiring up live data.)
- **Recipes:** a little flip-through recipe notebook Beck keeps adding to over time, linked to Beli. Styled as a stack — a couple of pages visibly peek out behind the front one — and clicking the page advances to the next recipe.

### Stats
A visitor-contributed histogram: "roughly how many frogs have you held?" (Beck's own answer: ~150, shown as a fixed reference marker on the chart, not a submission). Real feature, implemented — see below. (The Hevy-links placeholder was removed; revisit if/when there's a tracker to link here.) Also holds the Logbook (see below), which lives inside this section rather than as a separate page-level sidebar.

### Thoughts
A blog section. Paused/removed from the live nav and page for now — no posts ready yet. Bring it back once Beck has something to put there.

### Contact
A direct-send email box (still a placeholder — the real send-on-submit form is a future feature), plus real links: clicking "Email" opens a draft to beckjpeterson@gmail.com via `mailto:`, and GitHub/LinkedIn are hyperlinked to Beck's real profiles.

### Logbook (formerly "Guestbook")
Visitors leave a short message and/or a small drawing, with an optional name field; each entry shows its post date. Rendered as a scrollable feed inside the Stats section, newest first. Admin (Beck) can take down any entry at any time. Real feature, implemented — see below.

## Process

1. Mock up multiple distinct visual directions before committing to one (in progress).
2. Once a direction is chosen, scaffold the Next.js app with the basic structure/nav across all sections (placeholder content where copy doesn't exist yet).
3. Fill in section by section as Beck supplies real copy, photos, and content.

## Visual Direction — Chosen

"Field Notes": a travel-journal register. Light manila-paper background, warm near-black ink, a medium/light pink accent (nav states, headings, links), brass for pushpins and stamped dates. Slab-serif display type, warm serif body copy, typewriter mono for labels/dates. Working prototype lives at `/prototype/field-notes.html` (static HTML/CSS, no build step — a design reference for the rest of the site). Its design tokens/base styles have been ported into `app/globals.css` for the real app.

## Real App — Started

The Next.js app now lives at the repo root (`app/`, `components/`, `lib/`, `models/`). Projects is still a placeholder shell ported from the prototype — About, Travel, fun links, Favorites, and the Stats/frog-chart/Logbook feature are real (Favorites' songs/recipes still hold placeholder content; books/movies are real).

Page order: About, Projects, Travel, Favorites, Stats, fun links, Contact. Thoughts is paused/removed for now (no posts ready). Nav labels are all lowercase (matches the lowercase section headings), except the "Beck Peterson" name/logo itself.

**Travel** (`components/TravelSnake.js`): the snake-path/plane/tabs system ported 1:1 from the prototype. Stop markup (pin/thread/polaroid/caption) is rendered declaratively per trip from a `TRIPS` object; the snake path generation, sticky-plane scroll tracking, edge fade, and proximity highlight stay imperative (a `useEffect` keyed on the active trip, operating on refs) since that logic is fundamentally a scroll-linked animation, not view state — rewriting it as declarative React state would risk subtly changing behavior that took many iterations to get right.

**Favorites** (`components/Favorites.js`): sub-collections, each linking out to the tracker it mirrors, no group headings — just the visualization and the link. The bookshelf (10 spines → Goodreads, titles set in vertical spine text via `writing-mode`), scattered movie posters (5, rotated like the Fun Facts jumble → Letterboxd), and scattered song discs (8, varied size/offset → Spotify) are static placeholder grids for now. One book spine is rotated to lean against its neighbor with a "currently reading" arrow marker, reusing the same arrow+label pattern as the frog chart's Beck marker. The recipe notebook (→ Beli) is the one interactive piece: a couple of page-shaped divs peek out behind the front page for a stacked look, and clicking the page (a `<button>`, not separate prev/next controls) advances through the `RECIPES` array, wrapping back to the first after the last. Beck adds books/movies/songs/recipes by extending their respective arrays. All placeholder content is bracketed, no invented titles/recipes.

**Frog chart** (`components/FrogChart.js`, `app/api/frogs/route.js`, `models/FrogSubmission.js`): visitors submit a number for "roughly how many frogs have you held?"; the histogram (log-scaled bins, since answers cluster near zero) is rendered from all submissions, with Beck's own value (150) shown as a fixed marker rather than a submission.

- **One submission per visitor, editable:** identified by an httpOnly cookie (90-day, not a strict browser-session cookie — chosen so a returning visitor can still fix their number, at the cost of not matching "session" in the narrowest sense; revisit if that's not what was wanted). The submission doc is upserted by that cookie's ID, so resubmitting edits rather than duplicating.
- **Hidden range cap:** server validates 0–1000 and returns the same generic error message regardless of why a value was rejected (too high, negative, not a number) — the client never sees the bound.
- **Rate limiting (best-effort, no external service):** a 3-second cooldown between edits from the same session, plus a per-IP cap of 20 new (not-yet-existing) sessions per hour to blunt cookie-clearing abuse. Both live in MongoDB rather than in-memory, since Vercel serverless functions don't share memory reliably across invocations.
- **Local dev:** if `MONGODB_URI` isn't set, `lib/mongodb.js` falls back to an in-memory MongoDB (`mongodb-memory-server`) automatically — nothing to configure to start hacking, but data doesn't persist across dev server restarts. Production requires a real `MONGODB_URI` (see `.env.local.example`).

**Logbook** (`components/Logbook.js`, `app/api/logbook/route.js`, `app/api/logbook/[id]/route.js`, `models/LogbookEntry.js`): a scrollable, newest-first feed of visitor entries (optional name, optional short message, optional small canvas drawing — at least one of message/drawing is required). Sits inside the Stats section, styled to match the frog chart.

- **Drawing input:** a plain `<canvas>` mouse/touch pad; on submit it's exported to a PNG data URL. The server only accepts values with the exact `data:image/png;base64,` prefix and a bounded length, as defense-in-depth against a mismatched/malicious payload.
- **No visitor identity:** unlike the frog chart, entries aren't tied to a per-visitor cookie — anyone can post any number of entries subject to the IP rate limit below (a "message board," not a "one answer per person" input).
- **Rate limiting:** per-IP cap (8 new entries/hour), enforced via a MongoDB count query rather than in-memory state, matching the frog chart's approach.
- **Admin auth:** stateless — no sessions collection. `lib/adminAuth.js` checks a submitted password against the `ADMIN_PASSWORD` env var (`crypto.timingSafeEqual`, so it's not vulnerable to a timing attack) and, on success, issues a signed `expiry.hmac-signature` token (`crypto.createHmac`) stored in an httpOnly cookie. A request is treated as admin iff the signature and expiry both check out — no database lookup needed. `ADMIN_PASSWORD` doubles as the HMAC signing secret, an acceptable simplification for a single-admin personal site.

## Open Decisions

- CSS approach: CSS Modules / plain CSS vs. a utility framework — to be settled once more of the site is ported over.
