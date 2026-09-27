import { timingSafeEqual, randomBytes, createHmac } from "crypto";

/* Stateless signed sessions.
 *
 * The previous implementation kept session tokens in a per-instance in-memory
 * Set. That breaks on serverless hosting (Vercel): the login request and the
 * next authenticated request can execute on DIFFERENT instances, so the token
 * was "unknown" there and the dashboard bounced the user straight back to the
 * login page. Tokens are now HMAC-signed and self-verifying — every instance
 * can validate every token with no shared state.
 *
 * Properties:
 *  - expire after SESSION_TTL_MS
 *  - all sessions are revoked if ADMIN_PASSWORD changes (the signing key is it)
 *  - logout clears the client-side copy; the server token simply ages out
 */

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function isConfigured(): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return typeof pw === "string" && pw.length > 0;
}

export function checkPassword(password: string): boolean {
  const pw = process.env.ADMIN_PASSWORD ?? "";
  if (!pw) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(pw);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Returns a signed, self-verifying session token valid for SESSION_TTL_MS. */
export function createSession(): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${exp}.${nonce}`;
  return `v1.${payload}.${sign(payload)}`;
}

/** Stateless sessions cannot be revoked individually; they expire on their own
 * (or globally when ADMIN_PASSWORD changes). Kept for API compatibility. */
export function destroySession(token: string): void {
  void token;
}

export function isAuthorized(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !secret()) return false;
  // Format: v1.<expiry-ms>.<nonce>.<hmac("<expiry>.<nonce>")>
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const exp = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;
  const expected = Buffer.from(sign(`${parts[1]}.${parts[2]}`));
  const provided = Buffer.from(parts[3]);
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

/** Returns a 401 Response when unauthorized, or null when the caller may proceed. */
export function guard(request: Request): Response | null {
  if (isAuthorized(request)) return null;
  return Response.json(
    { error: "Unauthorized. Log in at /admin first." },
    { status: 401 }
  );
}
