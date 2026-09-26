// Commits CMS changes to GitHub via the Contents API.
// Enabled when GITHUB_TOKEN is set; otherwise the CMS saves files locally only.

const OWNER = process.env.GITHUB_OWNER || "sifaaaaaaaat";
const REPO = process.env.GITHUB_REPO || "Imagine-Interiors-";
const BRANCH = process.env.GITHUB_BRANCH || "main";
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

async function getFileSha(path: string): Promise<string | null> {
  const res = await fetch(`${API}/${encodeURI(path)}?ref=${BRANCH}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { sha?: string };
  return json.sha ?? null;
}

async function putFile(
  path: string,
  content: Buffer | string,
  message: string
): Promise<void> {
  const sha = await getFileSha(path);
  const res = await fetch(`${API}/${encodeURI(path)}`, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub PUT ${path}: ${res.status} ${await res.text()}`);
  }
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
