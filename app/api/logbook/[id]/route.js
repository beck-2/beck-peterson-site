// ABOUTME: Deletes a single logbook entry — admin only, checked via the signed session cookie.
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/mongodb";
import { verifyAdminSessionToken } from "@/lib/adminAuth";
import LogbookEntry from "@/models/LogbookEntry";

const ADMIN_COOKIE = "logbook_admin";

export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  if (!verifyAdminSessionToken(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();
  await LogbookEntry.deleteOne({ _id: id });
  return Response.json({ ok: true });
}
