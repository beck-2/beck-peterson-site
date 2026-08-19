// ABOUTME: Clears the admin session cookie used for logbook moderation.
import { cookies } from "next/headers";

const ADMIN_COOKIE = "logbook_admin";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
