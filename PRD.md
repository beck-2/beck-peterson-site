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
Links out to Beck's Goodreads, Letterboxd, Beli, and Hevy — a life-tracking dashboard of sorts.

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

"Field Notes": a travel-journal register. Light manila-paper background, warm near-black ink, a medium/light pink accent (nav states, headings, links), brass for pushpins and stamped dates. Slab-serif display type, warm serif body copy, typewriter mono for labels/dates. Working prototype lives at `/prototype/field-notes.html` (static HTML/CSS, no build step — a design reference to translate into Next.js components, not the final implementation).

## Open Decisions

- CSS approach: CSS Modules / plain CSS vs. a utility framework — to be settled once the prototype is far enough along to judge how well the chosen look translates to code.
- Guestbook drawing input mechanism (canvas-based sketch vs. simple markup) and storage target.
