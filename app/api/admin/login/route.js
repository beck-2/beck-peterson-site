// ABOUTME: Admin login for logbook moderation — checks the password, sets a signed session cookie.
import { cookies } from "next/headers";
import { checkAdminPassword, createAdminSessionToken } from "@/lib/adminAuth";

const ADMIN_COOKIE = "logbook_admin";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "That didn't come through right — try again." }, { status: 400 });
  }

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
