import { NextResponse } from "next/server";
import { guard } from "@/lib/cmsAuth";
import { commitInquiries, syncEnabled } from "@/lib/githubSync";
import { loadInquiries, writeInquiries, type StoredInquiry } from "@/lib/inquiriesStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = guard(request);
  if (denied) return denied;
  const inquiries = await loadInquiries();
  return NextResponse.json({
    inquiries,
    syncEnabled: syncEnabled(),
  });
}

/** PATCH ?id= — mark an inquiry handled (or back to new). */
export async function PATCH(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing ?id=." }, { status: 400 });
  }
  const body = (await request.json().catch(() => null)) as {
    status?: string;
  } | null;
  const status = body?.status === "handled" ? "handled" : "new";

  const inquiries = await loadInquiries();
  const target = inquiries.find((i) => i.id === id);
  if (!target) {
    return NextResponse.json({ error: `Unknown inquiry: ${id}` }, { status: 404 });
  }
  target.status = status as StoredInquiry["status"];

  const localSaved = await writeInquiries(inquiries);
  let githubError: string | null = null;
  if (syncEnabled()) {
    try {
      await commitInquiries(inquiries, `Inquiry ${id} marked ${status}`);
    } catch (err) {
      githubError = err instanceof Error ? err.message : String(err);
    }
  }
  if (!localSaved && (!syncEnabled() || githubError)) {
    return NextResponse.json(
      { error: githubError ?? "Could not save the change." },
      { status: githubError ? 502 : 500 }
    );
  }
  return NextResponse.json({
    ok: true,
    syncedToGithub: syncEnabled() && !githubError,
  });
}

/** DELETE ?id= — remove an inquiry permanently. */
export async function DELETE(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing ?id=." }, { status: 400 });
  }

  const inquiries = await loadInquiries();
  const index = inquiries.findIndex((i) => i.id === id);
  if (index === -1) {
    return NextResponse.json({ error: `Unknown inquiry: ${id}` }, { status: 404 });
  }
  const [removed] = inquiries.splice(index, 1);

  const localSaved = await writeInquiries(inquiries);
  let githubError: string | null = null;
  if (syncEnabled()) {
    try {
      await commitInquiries(
        inquiries,
        `Inquiry deleted (${removed.name}, ${removed.submittedAt.slice(0, 10)})`
      );
    } catch (err) {
      githubError = err instanceof Error ? err.message : String(err);
    }
  }
  if (!localSaved && (!syncEnabled() || githubError)) {
    return NextResponse.json(
      { error: githubError ?? "Could not save the change." },
      { status: githubError ? 502 : 500 }
    );
  }
  return NextResponse.json({
    ok: true,
    syncedToGithub: syncEnabled() && !githubError,
  });
}
