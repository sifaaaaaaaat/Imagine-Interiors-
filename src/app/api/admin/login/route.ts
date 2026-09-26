import { NextResponse } from "next/server";
import {
  checkPassword,
  createSession,
  destroySession,
  isConfigured,
} from "@/lib/cmsAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ configured: isConfigured() });
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set. Add it to .env.local and restart." },
      { status: 503 }
    );
  }
  const body = (await request.json().catch(() => null)) as {
    password?: string;
  } | null;
  if (!body?.password || !checkPassword(body.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  return NextResponse.json({ token: createSession() });
}

export async function DELETE(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Bearer ")) destroySession(header.slice(7));
  return NextResponse.json({ ok: true });
}
