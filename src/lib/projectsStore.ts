import { promises as fs } from "fs";
import path from "path";
import { fetchProjectsFile, syncEnabled } from "./githubSync";

const DATA_FILE = path.join(process.cwd(), "src", "data", "projects.json");

export interface StoredProject {
  id: string;
  number: string;
  title: string;
  client: string;
  location: string;
  category: "RESIDENTIAL" | "COMMERCIAL" | "HOSPITALITY";
  year: string;
  area: string;
  synopsis: string;
  quote: string;
  tags: string[];
  heroImage: string;
  allImages: {
    id: string;
    src: string;
    originalUrl: string;
    title: string;
    room: string;
    width: number;
    height: number;
    aspectRatio: string;
  }[];
  structuredSpaces: unknown[];
}

export async function readProjects(): Promise<StoredProject[]> {
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("projects.json is not an array");
  return parsed as StoredProject[];
}

/**
 * Best available project list. When GitHub sync is enabled the committed
 * projects.json is the source of truth (hosting filesystems like Vercel's are
 * read-only); otherwise we read the local file.
 */
export async function loadProjects(): Promise<StoredProject[]> {
  if (syncEnabled()) {
    try {
      const raw = await fetchProjectsFile();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as StoredProject[];
      }
    } catch {
      // fall through to the local copy bundled with the deployment
    }
  }
  return readProjects();
}

/**
 * Writes projects.json locally. On read-only hosting filesystems this is a
 * no-op that returns false — GitHub (see commitProjects) remains the source of
 * truth there and the host rebuilds from it.
 */
export async function writeProjects(projects: StoredProject[]): Promise<boolean> {
  try {
    const tmp = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(projects, null, 2) + "\n", "utf8");
    await fs.rename(tmp, DATA_FILE);
    return true;
  } catch {
    return false;
  }
}

/** Best-effort local file write; returns false when the filesystem is read-only. */
export async function tryWriteFile(
  filePath: string,
  data: Buffer
): Promise<boolean> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return true;
  } catch {
    return false;
  }
}
