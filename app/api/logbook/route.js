// ABOUTME: Logbook API — GET the public feed (newest first), POST a new entry.
// ABOUTME: Validates message/drawing size and content, rate-limits by IP; no per-visitor identity beyond that.
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/mongodb";
import { verifyAdminSessionToken } from "@/lib/adminAuth";
import LogbookEntry from "@/models/LogbookEntry";

const ADMIN_COOKIE = "logbook_admin";
const MAX_ENTRIES_RETURNED = 200;
const IP_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const IP_MAX_NEW_ENTRIES = 8;

// A tiny transparent PNG data URL is still a "drawing" a blank canvas would
// submit; anything under this many base64 characters isn't worth storing.
const MIN_DRAWING_LENGTH = 400;
const MAX_DRAWING_LENGTH = 400_000; // ~300KB decoded, comfortably under Mongo's 16MB doc cap

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.ip || "unknown";
}

function isValidPngDataUrl(value) {
  return (
    typeof value === "string" &&
    value.startsWith("data:image/png;base64,") &&
    value.length >= MIN_DRAWING_LENGTH &&
    value.length <= MAX_DRAWING_LENGTH
  );
}

async function isAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  await dbConnect();
  const [entries, admin] = await Promise.all([
    LogbookEntry.find({}, "name message drawingDataUrl createdAt")
      .sort({ createdAt: -1 })
      .limit(MAX_ENTRIES_RETURNED)
      .lean(),
    isAdmin(),
  ]);
  return Response.json({
    isAdmin: admin,
    entries: entries.map((e) => ({
      id: String(e._id),
      name: e.name,
      message: e.message,
      drawingDataUrl: e.drawingDataUrl,
      createdAt: e.createdAt,
    })),
  });
}

export async function POST(request) {
  await dbConnect();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "That didn't come through right — try again." }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 40) : "";
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 280) : "";
  const rawDrawing = typeof body?.drawingDataUrl === "string" ? body.drawingDataUrl : "";
  const hasDrawing = rawDrawing.length > 0;

  if (hasDrawing && !isValidPngDataUrl(rawDrawing)) {
    return Response.json({ error: "That drawing didn't come through right — try again." }, { status: 400 });
  }
  if (!message && !hasDrawing) {
    return Response.json({ error: "Leave a message or a drawing first." }, { status: 400 });
  }

  const normalizedName = name.replace(/[^a-z]/gi, "").toLowerCase();
  if (normalizedName === "beck" && !(await isAdmin())) {
    return Response.json({ error: "Only Beck can post as Beck — log in first." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const now = Date.now();
  const recentFromIp = await LogbookEntry.countDocuments({
    ip,
    createdAt: { $gt: new Date(now - IP_WINDOW_MS) },
  });
  if (recentFromIp >= IP_MAX_NEW_ENTRIES) {
    return Response.json(
      { error: "Too many entries from this network right now — try again later." },
      { status: 429 }
    );
  }

  await LogbookEntry.create({
    name,
    message,
    drawingDataUrl: hasDrawing ? rawDrawing : "",
    ip,
  });

  const [entries, admin] = await Promise.all([
    LogbookEntry.find({}, "name message drawingDataUrl createdAt")
      .sort({ createdAt: -1 })
      .limit(MAX_ENTRIES_RETURNED)
      .lean(),
    isAdmin(),
  ]);
  return Response.json({
    isAdmin: admin,
    entries: entries.map((e) => ({
      id: String(e._id),
      name: e.name,
      message: e.message,
      drawingDataUrl: e.drawingDataUrl,
      createdAt: e.createdAt,
    })),
  });
}
