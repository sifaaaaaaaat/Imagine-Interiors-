import { NextResponse } from "next/server";
import { REAL_PROJECTS } from "@/data/realProjects";
import { guard } from "@/lib/cmsAuth";
import { commitImage, commitProjects, syncEnabled } from "@/lib/githubSync";
import { getImageSize, slugify } from "@/lib/imageMeta";
import {
  readProjects,
  writeProjects,
  type StoredProject,
} from "@/lib/projectsStore";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CATEGORIES = ["RESIDENTIAL", "COMMERCIAL", "HOSPITALITY"] as const;

export async function GET(request: Request) {
  const denied = guard(request);
  if (denied) return denied;
  // Read from disk so freshly saved projects show up immediately.
  const projects = await readProjects().catch(() => REAL_PROJECTS);
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

  const projects = await readProjects();
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

  const dir = path.join(process.cwd(), "public", "projects", id);
  await fs.mkdir(dir, { recursive: true });

  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
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
    await fs.writeFile(path.join(dir, safeName), buffer);
    if (syncEnabled()) {
      try {
        await commitImage(id, safeName, buffer);
      } catch (err) {
        return NextResponse.json(
          {
            error: `Image ${safeName} saved locally but GitHub sync failed: ${
              err instanceof Error ? err.message : String(err)
            }`,
          },
          { status: 502 }
        );
      }
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
  await writeProjects(projects);

  let githubError: string | null = null;
  if (syncEnabled()) {
    try {
      await commitProjects(
        projects,
        `CMS: add project "${title}" (${id})`
      );
    } catch (err) {
      githubError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    ok: true,
    project,
    totalProjects: projects.length,
    syncedToGithub: syncEnabled() && !githubError,
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
  const projects = await readProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return NextResponse.json({ error: `Unknown project: ${id}` }, { status: 404 });
  }
  const [removed] = projects.splice(index, 1);
  await writeProjects(projects);

  let githubError: string | null = null;
  if (syncEnabled()) {
    try {
      await commitProjects(projects, `CMS: remove project "${removed.title}" (${id})`);
    } catch (err) {
      githubError = err instanceof Error ? err.message : String(err);
    }
  }

  return NextResponse.json({
    ok: true,
    removedLocalImages: removed.heroImage.startsWith("/projects/"),
    note: removed.heroImage.startsWith("/projects/")
      ? `Image folder public/projects/${id}/ kept on disk; delete manually if unwanted (GitHub image deletion is not automated).`
      : undefined,
    syncedToGithub: syncEnabled() && !githubError,
    githubError,
  });
}

function extFor(mime: string): string {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  return ".jpg";
}
