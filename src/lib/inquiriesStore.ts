import { promises as fs } from "fs";
import path from "path";
import { fetchInquiriesFile, syncEnabled } from "./githubSync";

const DATA_FILE = path.join(process.cwd(), "src", "data", "inquiries.json");

export interface StoredInquiry {
  /** Stable unique id: <timestamp>-<6 random hex chars>. */
  id: string;
  name: string;
  contact: string;
  typology: string;
  location: string;
  message: string;
  /** Which form sent it. */
  source: "contact-page" | "hero-drawer";
  /** ISO 8601 UTC timestamp of the submission. */
  submittedAt: string;
  /** Submitter IP, stored for abuse tracing only — never shown publicly. */
  ip: string;
  /** "new" until an admin marks it handled. */
  status: "new" | "handled";
}

/** Reads the local inquiries.json (bundled with the deployment). */
export async function readInquiries(): Promise<StoredInquiry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredInquiry[];
  } catch {
    return [];
  }
}

/**
 * Best available inquiry list. When GitHub sync is enabled the committed
 * inquiries.json on the inquiry branch is the source of truth (hosting
 * filesystems like Vercel's are read-only and per-instance).
 */
export async function loadInquiries(): Promise<StoredInquiry[]> {
  if (syncEnabled()) {
    try {
      const raw = await fetchInquiriesFile();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as StoredInquiry[];
      }
    } catch {
      // fall through to the local copy bundled with the deployment
    }
  }
  return readInquiries();
}

/**
 * Writes inquiries.json locally (dev convenience). On read-only hosting
 * filesystems this is a no-op returning false — GitHub remains the store.
 */
export async function writeInquiries(
  inquiries: StoredInquiry[]
): Promise<boolean> {
  try {
    const tmp = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(inquiries, null, 2) + "\n", "utf8");
    await fs.rename(tmp, DATA_FILE);
    return true;
  } catch {
    return false;
  }
}
