// ABOUTME: Best-effort client IP extraction from the forwarded header, used for per-IP rate limiting.
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.ip || "unknown";
}
