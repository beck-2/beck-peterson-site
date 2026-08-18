// ABOUTME: API route backing the "frogs held" stat — GET for the histogram, POST to submit/edit a value.
// ABOUTME: Enforces a hidden 0-1000 range, one document per session (upserted, so resubmitting edits), and rate limits.
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/mongodb";
import FrogSubmission from "@/models/FrogSubmission";

const SESSION_COOKIE = "frog_sid";
const SESSION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days
const EDIT_COOLDOWN_MS = 3000; // minimum time between edits from the same session
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const IP_MAX_NEW_SUBMISSIONS = 20; // new (not-yet-existing) sessions per IP per window

// Bin edges are upper-exclusive: BIN_EDGES[i] <= value < BIN_EDGES[i + 1].
// Most answers to a whimsical question like this cluster near zero, so bins
// widen as they go up rather than being evenly spaced.
const BIN_EDGES = [0, 1, 3, 6, 11, 26, 51, 101, 1001];
const BIN_LABELS = ["0", "1–2", "3–5", "6–10", "11–25", "26–50", "51–100", "100+"];

// Beck's own answer, shown on the chart as a fixed reference point rather
// than a submission — it doesn't go through the form, so it never counts
// against the rate limit or total.
const BECK_VALUE = 150;

function binIndexForValue(value) {
  for (let i = 0; i < BIN_EDGES.length - 1; i++) {
    if (value >= BIN_EDGES[i] && value < BIN_EDGES[i + 1]) return i;
  }
  return BIN_LABELS.length - 1;
}

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.ip || "unknown";
}

async function buildChartPayload(ownSessionId) {
  const docs = await FrogSubmission.find({}, "value sessionId").lean();
  const counts = new Array(BIN_LABELS.length).fill(0);
  for (const doc of docs) {
    counts[binIndexForValue(doc.value)]++;
  }
  const ownDoc = ownSessionId ? docs.find((d) => d.sessionId === ownSessionId) : null;
  return {
    bins: BIN_LABELS.map((label, i) => ({ label, count: counts[i] })),
    total: docs.length,
    ownValue: ownDoc ? ownDoc.value : null,
    ownBinIndex: ownDoc ? binIndexForValue(ownDoc.value) : null,
    beckValue: BECK_VALUE,
    beckBinIndex: binIndexForValue(BECK_VALUE),
  };
}

export async function GET() {
  await dbConnect();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value || null;
  const payload = await buildChartPayload(sessionId);
  return Response.json(payload);
}

export async function POST(request) {
  await dbConnect();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Please enter a valid number." }, { status: 400 });
  }

  const value = Math.trunc(Number(body?.value));
  // The upper bound is intentionally not communicated to the client — it's
  // a data-quality guard, not a rule visitors need to think about.
  if (!Number.isFinite(value) || value < 0 || value > 1000) {
    return Response.json({ error: "Please enter a valid number." }, { status: 400 });
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  const ip = getClientIp(request);
  const now = Date.now();

  const existing = sessionId ? await FrogSubmission.findOne({ sessionId }) : null;

  if (existing) {
    if (now - existing.updatedAt.getTime() < EDIT_COOLDOWN_MS) {
      return Response.json(
        { error: "You're updating that a little fast — give it a few seconds." },
        { status: 429 }
      );
    }
  } else {
    const recentFromIp = await FrogSubmission.countDocuments({
      ip,
      createdAt: { $gt: new Date(now - IP_WINDOW_MS) },
    });
    if (recentFromIp >= IP_MAX_NEW_SUBMISSIONS) {
      return Response.json(
        { error: "Too many submissions from this network right now — try again later." },
        { status: 429 }
      );
    }
    sessionId = crypto.randomUUID();
  }

  await FrogSubmission.findOneAndUpdate(
    { sessionId },
    { sessionId, value, ip },
    { upsert: true, setDefaultsOnInsert: true }
  );

  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  const payload = await buildChartPayload(sessionId);
  return Response.json(payload);
}
