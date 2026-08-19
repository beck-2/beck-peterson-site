// ABOUTME: Stateless admin session tokens (expiry + HMAC signature) for logbook moderation.
// ABOUTME: No sessions collection needed — a token is valid iff its signature and expiry check out.
import crypto from "crypto";

const SESSION_LENGTH_MS = 1000 * 60 * 60 * 12; // 12 hours

function secret() {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD is not set.");
  return s;
}

export function checkAdminPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !candidate) return false;
  const a = Buffer.from(String(candidate));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminSessionToken() {
  const expires = String(Date.now() + SESSION_LENGTH_MS);
  const sig = crypto.createHmac("sha256", secret()).update(expires).digest("hex");
  return `${expires}.${sig}`;
}

export function verifyAdminSessionToken(token) {
  if (!token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  const expectedSig = crypto.createHmac("sha256", secret()).update(expires).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(expires) > Date.now();
}
