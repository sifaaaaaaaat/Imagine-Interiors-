import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import {
  commitInquiries,
  syncEnabled,
} from "@/lib/githubSync";
import {
  loadInquiries,
  readInquiries,
  writeInquiries,
  type StoredInquiry,
} from "@/lib/inquiriesStore";

export const dynamic = "force-dynamic";

/* ---- naive per-instance rate limit: 5 submissions per IP per 10 minutes --- */
const RATE = { windowMs: 10 * 60 * 1000, max: 5 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  list.push(now);
  hits.set(ip, list);
  return list.length > RATE.max;
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-vercel-forwarded-for") ?? "";
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

const MAX_LEN = { name: 120, contact: 200, typology: 80, location: 120, message: 4000 };

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  /* Honeypot: the "company" field is hidden from humans; bots that fill it
   * get a fake success so they do not retry, and nothing is stored. */
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.trim().slice(0, max) : "";

  const name = str(body.name, MAX_LEN.name);
  const contact = str(body.contact, MAX_LEN.contact);
  const message = str(body.message, MAX_LEN.message);
  if (!name || !contact || !message) {
    return NextResponse.json(
      { error: "Name, contact and message are required." },
      { status: 400 }
    );
  }

  const source =
    body.source === "hero-drawer" ? "hero-drawer" : "contact-page";

  const inquiry: StoredInquiry = {
    id: `${Date.now()}-${randomBytes(3).toString("hex")}`,
    name,
    contact,
    typology: str(body.typology, MAX_LEN.typology) || "—",
    location: str(body.location, MAX_LEN.location) || "—",
    message,
    source,
    submittedAt: new Date().toISOString(),
    ip,
    status: "new",
  };

  /* GitHub is the source of truth; the local write is best-effort (dev only). */
  let current: StoredInquiry[];
  if (syncEnabled()) {
    try {
      current = await loadInquiries();
    } catch {
      current = await readInquiries();
    }
  } else {
    current = await readInquiries();
  }
  current.push(inquiry);

  let savedLocally = false;
  let githubError: string | null = null;
  savedLocally = await writeInquiries(current);
  if (syncEnabled()) {
    try {
      await commitInquiries(
        current,
        `Inquiry: ${name} (${source}, ${new Date().toISOString().slice(0, 10)})`
      );
    } catch (err) {
      githubError = err instanceof Error ? err.message : String(err);
    }
  }

  /* Data is only safe if it exists somewhere: locally, or committed to GitHub. */
  if (!savedLocally && (!syncEnabled() || githubError)) {
    return NextResponse.json(
      {
        error: githubError
          ? "Could not store the inquiry right now. Please email us instead."
          : "Could not store the inquiry: no storage is configured.",
      },
      { status: githubError ? 502 : 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    syncedToGithub: syncEnabled() && !githubError,
  });
}
