// Commits CMS changes to GitHub via the Contents API.
// Enabled when GITHUB_TOKEN is set; otherwise the CMS saves files locally only.

const OWNER = process.env.GITHUB_OWNER || "sifaaaaaaaat";
const REPO = process.env.GITHUB_REPO || "Imagine-Interiors-";
const BRANCH = process.env.GITHUB_BRANCH || "main";

/* Inquiries are committed to a separate branch so each submission does NOT
 * trigger a Vercel production redeploy of the public site (only pushes to the
 * configured production branch build). Inquiries are read by the admin API
 * straight from GitHub, so no rebuild is ever needed to see them. */
const INQUIRY_BRANCH = process.env.INQUIRY_BRANCH || "site-data";
const API = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

export function syncEnabled(): boolean {
  return typeof process.env.GITHUB_TOKEN === "string" &&
    process.env.GITHUB_TOKEN.length > 0;
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function putFile(
  path: string,
  content: Buffer | string,
  message: string
): Promise<void> {
  await putFileOnBranch(path, content, message, BRANCH);
}

/** Writes src/data/projects.json to the repo. Call AFTER committing new images. */
export async function commitProjects(
  projects: unknown[],
  message: string
): Promise<void> {
  await putFile(
    "src/data/projects.json",
    JSON.stringify(projects, null, 2) + "\n",
    message
  );
}

/** Reads src/data/projects.json from the repo (raw). Returns null if it does not exist. */
export async function fetchProjectsFile(): Promise<string | null> {
  const res = await fetch(
    `${API}/${encodeURI("src/data/projects.json")}?ref=${BRANCH}`,
    { headers: { ...headers(), Accept: "application/vnd.github.raw" }, cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(
      `GitHub GET projects.json: ${res.status} ${await res.text()}`
    );
  }
  return res.text();
}

/* ------------------------------------------------------------------ */
/* INQUIRIES — src/data/inquiries.json on the INQUIRY_BRANCH            */
/* ------------------------------------------------------------------ */

const INQUIRIES_PATH = "src/data/inquiries.json";

/** Reads inquiries.json (raw) from the inquiry branch. Null if it does not exist. */
export async function fetchInquiriesFile(): Promise<string | null> {
  const res = await fetch(
    `${API}/${encodeURI(INQUIRIES_PATH)}?ref=${INQUIRY_BRANCH}`,
    { headers: { ...headers(), Accept: "application/vnd.github.raw" }, cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(
      `GitHub GET ${INQUIRIES_PATH}: ${res.status} ${await res.text()}`
    );
  }
  return res.text();
}

/** Commits inquiries.json to the inquiry branch (created from the current
 * production branch head if it does not exist yet). */
export async function commitInquiries(
  inquiries: unknown[],
  message: string
): Promise<void> {
  await putFileOnBranch(
    INQUIRIES_PATH,
    JSON.stringify(inquiries, null, 2) + "\n",
    message,
    INQUIRY_BRANCH
  );
}

/** putFile against an arbitrary branch, creating it from the production
 * branch head when missing. The Contents API PUT creates the branch from the
 * default branch when `branch` names a ref that does not exist yet. */
async function putFileOnBranch(
  path: string,
  content: Buffer | string,
  message: string,
  branch: string
): Promise<void> {
  const ok = await tryPutFileOnBranch(path, content, message, branch);
  if (!ok) throw new Error(`GitHub PUT ${path} on ${branch} failed`);
}

async function tryPutFileOnBranch(
  path: string,
  content: Buffer | string,
  message: string,
  branch: string
): Promise<boolean> {
  const sha = await getFileShaOn(path, branch);
  const res = await fetch(`${API}/${encodeURI(path)}`, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (res.ok) return true;
  // Unknown ref: create the branch from the production branch head, retry once.
  const created = await createBranchFromDefault(branch);
  if (!created) return false;
  const sha2 = await getFileShaOn(path, branch);
  const retry = await fetch(`${API}/${encodeURI(path)}`, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      branch,
      ...(sha2 ? { sha: sha2 } : {}),
    }),
  });
  return retry.ok;
}

async function getFileShaOn(
  path: string,
  branch: string
): Promise<string | null> {
  const res = await fetch(`${API}/${encodeURI(path)}?ref=${branch}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path}@${branch}: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { sha?: string };
  return json.sha ?? null;
}

async function createBranchFromDefault(branch: string): Promise<boolean> {
  // Resolve the production branch head...
  const head = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!head.ok) return false;
  const headJson = (await head.json()) as {
    object?: { sha?: string };
  };
  const sha = headJson.object?.sha;
  if (!sha) return false;
  // ...then create the new ref from it.
  const create = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/refs`,
    {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
    }
  );
  return create.ok;
}

/** Commits one image under public/projects/<slug>/. */
export async function commitImage(
  slug: string,
  filename: string,
  data: Buffer
): Promise<void> {
  await putFile(
    `public/projects/${slug}/${filename}`,
    data,
    `CMS: add image ${slug}/${filename}`
  );
}
