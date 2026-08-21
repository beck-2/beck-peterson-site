// ABOUTME: Admin login for logbook moderation — checks the password, sets a signed session cookie.
import { cookies } from "next/headers";
import { checkAdminPassword, createAdminSessionToken } from "@/lib/adminAuth";
import { dbConnect } from "@/lib/mongodb";
import { getClientIp } from "@/lib/getClientIp";
import AdminLoginAttempt from "@/models/AdminLoginAttempt";

const ADMIN_COOKIE = "logbook_admin";
const IP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const IP_MAX_ATTEMPTS = 10;

export async function POST(request) {
  await dbConnect();

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "That didn't come through right — try again." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const now = Date.now();
  const recentAttempts = await AdminLoginAttempt.countDocuments({
    ip,
    createdAt: { $gt: new Date(now - IP_WINDOW_MS) },
  });
  if (recentAttempts >= IP_MAX_ATTEMPTS) {
    return Response.json(
      { error: "Too many attempts from this network right now — try again later." },
      { status: 429 }
    );
  }
  await AdminLoginAttempt.create({ ip });

  if (!checkAdminPassword(body?.password)) {
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return Response.json({ ok: true });
}
