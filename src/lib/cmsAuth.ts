import { timingSafeEqual, randomBytes } from "crypto";

// In-memory session store. Survives dev-server HMR via globalThis.
const g = globalThis as unknown as { __cmsSessions?: Set<string> };
const sessions: Set<string> = (g.__cmsSessions ??= new Set());

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

export function createSession(): string {
  const token = randomBytes(32).toString("hex");
  sessions.add(token);
  return token;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export function isAuthorized(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return token.length > 0 && sessions.has(token);
}

/** Returns a 401 Response when unauthorized, or null when the caller may proceed. */
export function guard(request: Request): Response | null {
  if (isAuthorized(request)) return null;
  return Response.json(
    { error: "Unauthorized. Log in at /admin first." },
    { status: 401 }
  );
}
