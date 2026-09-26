import { promises as fs } from "fs";
import path from "path";

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

export async function writeProjects(projects: StoredProject[]): Promise<void> {
  const tmp = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(projects, null, 2) + "\n", "utf8");
  await fs.rename(tmp, DATA_FILE);
}
