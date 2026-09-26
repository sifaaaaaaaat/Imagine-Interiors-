import { NextResponse } from "next/server";
import { REAL_PROJECTS } from "@/data/realProjects";
import { guard } from "@/lib/cmsAuth";
import { commitImage, commitProjects, syncEnabled } from "@/lib/githubSync";
import { getImageSize, slugify } from "@/lib/imageMeta";
import {
  loadProjects,
  tryWriteFile,
  writeProjects,
  type StoredProject,
} from "@/lib/projectsStore";
import path from "path";

export const dynamic = "force-dynamic";

const CATEGORIES = ["RESIDENTIAL", "COMMERCIAL", "HOSPITALITY"] as const;

export async function GET(request: Request) {
  const denied = guard(request);
  if (denied) return denied;
  const projects = await loadProjects().catch(() => REAL_PROJECTS);
  return NextResponse.json({
    projects,
    syncEnabled: syncEnabled(),
  });
}

export async function POST(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data." },
      { status: 400 }
    );
  }

  const str = (key: string) => (form.get(key) as string | null)?.trim() ?? "";
  const title = str("title");
  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  const category = str("category").toUpperCase();
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return NextResponse.json(
      { error: "Category must be RESIDENTIAL, COMMERCIAL or HOSPITALITY." },
      { status: 400 }
    );
  }

  const projects = await loadProjects();
  const baseSlug = slugify(str("id") || title);
  let id = baseSlug;
  let n = 2;
  while (projects.some((p) => p.id === id)) id = `${baseSlug}-${n++}`;

  const numbers = projects
    .map((p) => parseInt(p.number, 10))
    .filter((v) => Number.isFinite(v));
  const nextNumber = String(
    (numbers.length ? Math.max(...numbers) : 0) + 1
  ).padStart(2, "0");

  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.json(
      { error: "Please upload at least one image — the first one becomes the project cover." },
      { status: 400 }
    );
  }

  const images: StoredProject["allImages"] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: `${file.name} is larger than 20 MB. Please compress it first.` },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const dims = getImageSize(buffer);
    if (!dims) {
      return NextResponse.json(
        { error: `${file.name}: unsupported format — upload JPG, PNG or WebP.` },
        { status: 400 }
      );
    }
    const safeName = `photo-${String(i + 1).padStart(2, "0")}${extFor(file.type)}`;
    const localOk = await tryWriteFile(
      path.join(process.cwd(), "public", "projects", id, safeName),
      buffer
    );

    if (syncEnabled()) {
      try {
        await commitImage(id, safeName, buffer);
      } catch (err) {
        // Without a local write the image would be lost entirely — fail hard.
        if (!localOk) {
          return NextResponse.json(
            {
              error: `Image ${safeName} could not be saved: GitHub sync failed and the hosting filesystem is read-only. ${
                err instanceof Error ? err.message : String(err)
              }`,
            },
            { status: 502 }
          );
        }
        return NextResponse.json(
          {
            error: `Image ${safeName} saved locally but GitHub sync failed: ${
              err instanceof Error ? err.message : String(err)
            }`,
          },
          { status: 502 }
        );
      }
    } else if (!localOk) {
      return NextResponse.json(
        {
          error:
            "Cannot save images: the hosting filesystem is read-only and GitHub sync is not configured. Set GITHUB_TOKEN (see README).",
        },
        { status: 500 }
      );
    }

    images.push({
      id: `${id}-${i + 1}`,
      src: `/projects/${id}/${safeName}`,
      originalUrl: "",
      title: file.name.replace(/\.[a-z0-9]+$/i, ""),
      room: "",
      width: dims.width,
      height: dims.height,
      aspectRatio: `${dims.width}/${dims.height}`,
    });
  }

  const tags = str("tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const project: StoredProject = {
    id,
    number: nextNumber,
    title,
    client: str("client") || "—",
    location: str("location") || "—",
    category: category as StoredProject["category"],
    year: str("year") || String(new Date().getFullYear()),
    area: str("area") || "—",
    synopsis: str("synopsis") || title,
    quote: str("quote"),
    tags,
    heroImage: images[0]?.src ?? "",
    allImages: images,
    structuredSpaces: [],
  };

  projects.push(project);
  const localSaved = await writeProjects(projects);

  let githubError: string | null = null;
  if (syncEnabled()) {
    try {
      await commitProjects(projects, `CMS: add project "${title}" (${id})`);
    } catch (err) {
      githubError = err instanceof Error ? err.message : String(err);
    }
  }

  // Data is only safe if it exists somewhere: locally, or committed to GitHub.
  if (!localSaved && (!syncEnabled() || githubError)) {
    return NextResponse.json(
      {
        error: githubError
          ? `Project could not be saved — GitHub sync failed: ${githubError}`
          : "Project could not be saved: the hosting filesystem is read-only and GitHub sync is not configured.",
      },
      { status: githubError ? 502 : 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    project,
    totalProjects: projects.length,
    syncedToGithub: syncEnabled() && !githubError,
    savedLocally: localSaved,
    githubError,
  });
}

export async function DELETE(request: Request) {
  const denied = guard(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing ?id=." }, { status: 400 });
  }
  const projects = await loadProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: `Unknown project: ${id}` }, { status: 404 });
  }
  const [removed] = projects.splice(index, 1);
  const localSaved = await writeProjects(projects);

  let githubError: string | null = null;
  if (syncEnabled()) {
    try {
      await commitProjects(projects, `CMS: remove project "${removed.title}" (${id})`);
    } catch (err) {
      githubError = err instanceof Error ? err.message : String(err);
    }
  }

  if (!localSaved && (!syncEnabled() || githubError)) {
    return NextResponse.json(
      {
        error: githubError
          ? `Change could not be saved — GitHub sync failed: ${githubError}`
          : "Change could not be saved: the hosting filesystem is read-only and GitHub sync is not configured.",
      },
      { status: githubError ? 502 : 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    savedLocally: localSaved,
    syncedToGithub: syncEnabled() && !githubError,
    githubError,
    note: `Image folder public/projects/${id}/ is kept (GitHub image deletion is not automated); remove it manually in the repo if unwanted.`,
  });
}

function extFor(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}
