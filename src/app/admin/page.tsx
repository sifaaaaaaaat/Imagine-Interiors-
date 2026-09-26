"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ProjectImage {
  id: string;
  src: string;
  title: string;
  room: string;
  width: number;
  height: number;
}

interface Project {
  id: string;
  number: string;
  title: string;
  client: string;
  location: string;
  category: string;
  year: string;
  area: string;
  synopsis: string;
  quote: string;
  tags: string[];
  heroImage: string;
  allImages: ProjectImage[];
}

const EMPTY_FORM = {
  title: "",
  client: "",
  location: "",
  category: "RESIDENTIAL",
  year: "",
  area: "",
  synopsis: "",
  quote: "",
  tags: "",
};

export default function AdminPage() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProjects = useCallback(async (t: string) => {
    const res = await fetch("/api/admin/projects", {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (res.status === 401) {
      sessionStorage.removeItem("cms-token");
      setToken(null);
      throw new Error("Session expired — sign in again.");
    }
    const data = await res.json();
    return {
      projects: (data.projects ?? []) as Project[],
      syncEnabled: Boolean(data.syncEnabled),
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const stored = sessionStorage.getItem("cms-token");
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setConfigured(Boolean(d.configured));
        setToken(stored);
        if (stored) {
          fetchProjects(stored)
            .then((data) => {
              if (cancelled) return;
              setProjects(data.projects);
              setSyncEnabled(data.syncEnabled);
            })
            .catch(() => {
              if (cancelled) return;
              setBanner({ kind: "err", text: "Could not reach the API." });
            });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setConfigured(false);
        setToken(stored);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchProjects]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error ?? "Login failed.");
      return;
    }
    sessionStorage.setItem("cms-token", data.token);
    setToken(data.token);
    setPassword("");
    fetchProjects(data.token)
      .then((refreshed) => {
        setProjects(refreshed.projects);
        setSyncEnabled(refreshed.syncEnabled);
      })
      .catch(() => {
        setBanner({ kind: "err", text: "Could not reach the API." });
      });
  }

  function logout() {
    void fetch("/api/admin/login", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    sessionStorage.removeItem("cms-token");
    setToken(null);
    setProjects(null);
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setBanner(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach((f) => fd.append("images", f));
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setBanner({ kind: "err", text: data.error ?? "Save failed." });
        return;
      }
      let text = `Project "${data.project.title}" added.`;
      if (data.githubError) {
        text += ` ⚠ Saved locally but GitHub sync failed: ${data.githubError}`;
      } else if (data.syncedToGithub) {
        text += " Committed to GitHub — your live site redeploys automatically in 1–2 minutes.";
      } else if (data.savedLocally === false) {
        text += " ⚠ Saved to GitHub but the local filesystem is read-only.";
      } else {
        text += " Saved locally (add GITHUB_TOKEN to update the live site).";
      }
      setBanner({ kind: data.githubError ? "err" : "ok", text });
      setForm(EMPTY_FORM);
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowForm(false);
      const refreshed = await fetchProjects(token);
      setProjects(refreshed.projects);
      setSyncEnabled(refreshed.syncEnabled);
    } catch (err) {
      setBanner({
        kind: "err",
        text: err instanceof Error ? err.message : "Save failed.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(p: Project) {
    if (!token) return;
    if (
      !window.confirm(
        `Delete "${p.title}" (${p.allImages.length} images)?\n\nThe project is removed from the site and the change is committed to GitHub. Image files stay in public/projects/${p.id}/ unless you delete them manually.`
      )
    )
      return;
    try {
      const res = await fetch(
        `/api/admin/projects?id=${encodeURIComponent(p.id)}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) {
        setBanner({ kind: "err", text: data.error ?? "Delete failed." });
        return;
      }
      let text = `Project "${p.title}" removed.`;
      if (data.githubError) {
        text += ` ⚠ GitHub sync failed: ${data.githubError}`;
      } else if (data.syncedToGithub) {
        text += " Committed to GitHub — your live site redeploys automatically in 1–2 minutes.";
      }
      setBanner({ kind: data.githubError ? "err" : "ok", text });
      const refreshed = await fetchProjects(token);
      setProjects(refreshed.projects);
      setSyncEnabled(refreshed.syncEnabled);
    } catch (err) {
      setBanner({
        kind: "err",
        text: err instanceof Error ? err.message : "Delete failed.",
      });
    }
  }

  if (configured === null) {
    return <main className="min-h-screen bg-neutral-950" />;
  }

  if (!configured) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center px-6">
        <div className="max-w-lg border border-neutral-800 rounded-xl p-8 bg-neutral-900">
          <h1 className="text-xl font-semibold mb-3">CMS not configured</h1>
          <p className="text-sm text-neutral-400 mb-4">
            Set an admin password in <code className="text-amber-300">.env.local</code> at the
            project root, then restart the server:
          </p>
          <pre className="text-xs bg-black/60 rounded-lg p-4 overflow-x-auto text-neutral-300">
{`ADMIN_PASSWORD=your-secret-password

# optional — commit changes to GitHub from this dashboard:
GITHUB_TOKEN=github-personal-access-token
GITHUB_OWNER=sifaaaaaaaat
GITHUB_REPO=Imagine-Interiors-
GITHUB_BRANCH=main`}
          </pre>
          <p className="text-xs text-neutral-500 mt-4">
            A GitHub token needs the classic <code>repo</code> scope. See{" "}
            <code>.env.example</code> for details.
          </p>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center px-6">
        <form
          onSubmit={login}
          className="w-full max-w-sm border border-neutral-800 rounded-xl p-8 bg-neutral-900"
        >
          <h1 className="text-xl font-semibold mb-1">Imagine Interiors</h1>
          <p className="text-sm text-neutral-500 mb-6">Admin CMS — sign in</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="w-full rounded-lg bg-black/50 border border-neutral-700 px-4 py-2.5 text-sm outline-none focus:border-amber-500/70"
          />
          {loginError && (
            <p className="text-sm text-red-400 mt-2">{loginError}</p>
          )}
          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium py-2.5 text-sm transition-colors"
          >
            Sign in
          </button>
        </form>
      </main>
    );
  }

  const list = projects ?? [];
  const counts = {
    RESIDENTIAL: list.filter((p) => p.category === "RESIDENTIAL").length,
    COMMERCIAL: list.filter((p) => p.category === "COMMERCIAL").length,
    HOSPITALITY: list.filter((p) => p.category === "HOSPITALITY").length,
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Project CMS</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {list.length} projects · {counts.RESIDENTIAL} residential ·{" "}
              {counts.COMMERCIAL} commercial · {counts.HOSPITALITY} hospitality
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-3 py-1.5 rounded-full border ${
                syncEnabled
                  ? "border-emerald-700/60 text-emerald-400 bg-emerald-950/40"
                  : "border-neutral-700 text-neutral-400"
              }`}
              title={
                syncEnabled
                  ? "Changes are committed to GitHub automatically"
                  : "Set GITHUB_TOKEN to also commit changes to GitHub"
              }
            >
              {syncEnabled ? "GitHub sync on" : "Local saves only"}
            </span>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium px-4 py-2 text-sm transition-colors"
            >
              {showForm ? "Close form" : "+ Add project"}
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-neutral-700 hover:border-neutral-500 px-4 py-2 text-sm text-neutral-300 transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        {banner && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              banner.kind === "ok"
                ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300"
                : "border-red-900/60 bg-red-950/40 text-red-300"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <span>{banner.text}</span>
              <button
                onClick={() => setBanner(null)}
                className="text-neutral-500 hover:text-neutral-300"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {showForm && (
          <form
            onSubmit={saveProject}
            className="mb-10 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium mb-1">New project</h2>
              <p className="text-xs text-neutral-500">
                Only the title is required — everything else has sensible defaults. The
                first uploaded image becomes the project cover.
              </p>
            </div>
            <Field label="Title *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <Field label="Client" value={form.client} onChange={(v) => setForm({ ...form, client: v })} placeholder="e.g. Mr. Rahman" />
            <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="e.g. Gulshan, Dhaka" />
            <label className="block">
              <span className="text-xs text-neutral-400">Category</span>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded-lg bg-black/50 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-amber-500/70"
              >
                <option>RESIDENTIAL</option>
                <option>COMMERCIAL</option>
                <option>HOSPITALITY</option>
              </select>
            </label>
            <Field label="Year" value={form.year} onChange={(v) => setForm({ ...form, year: v })} placeholder="2026" />
            <Field label="Area" value={form.area} onChange={(v) => setForm({ ...form, area: v })} placeholder="2,400 sq. ft" />
            <div className="md:col-span-2">
              <Field label="Synopsis" value={form.synopsis} onChange={(v) => setForm({ ...form, synopsis: v })} textarea placeholder="One-paragraph description shown on the project page." />
            </div>
            <div className="md:col-span-2">
              <Field label="Client quote" value={form.quote} onChange={(v) => setForm({ ...form, quote: v })} textarea placeholder="Optional testimonial shown on the project page." />
            </div>
            <div className="md:col-span-2">
              <Field label="Tags (comma-separated)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} placeholder="Teak Millwork, Cove Lighting, Marble Foyer" />
            </div>
            <div className="md:col-span-2">
              <span className="text-xs text-neutral-400">Images (JPG / PNG / WebP, up to 20 MB each)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="mt-1 block w-full text-sm text-neutral-400 file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:text-neutral-200 hover:file:bg-neutral-700"
              />
              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {files.map((f, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="h-20 w-28 object-cover rounded-lg border border-neutral-700"
                      />
                      <span className="absolute bottom-1 right-1 text-[10px] bg-black/70 rounded px-1">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-medium px-5 py-2.5 text-sm transition-colors"
              >
                {saving ? "Saving…" : "Save project"}
              </button>
              <span className="text-xs text-neutral-500">
                {syncEnabled
                  ? "Saves locally and commits projects.json + images to GitHub."
                  : "Saves to the local site. Add GITHUB_TOKEN to also push to GitHub."}
              </span>
            </div>
          </form>
        )}

        {projects === null ? (
          <p className="text-neutral-500 text-sm">Loading projects…</p>
        ) : (
          <ul className="space-y-2">
            {list.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 hover:border-neutral-700 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.heroImage || "/projects/placeholder.jpg"}
                  alt=""
                  className="h-14 w-20 rounded-lg object-cover bg-neutral-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-amber-500/80 font-mono">{p.number}</span>
                    <a
                      href={`/project/${p.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-medium hover:text-amber-400"
                      title={`Open /project/${p.id}`}
                    >
                      {p.title}
                    </a>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">
                    {p.category} · {p.location} · {p.year} · {p.allImages.length} image
                    {p.allImages.length === 1 ? "" : "s"} · /project/{p.id}
                  </p>
                </div>
                <button
                  onClick={() => deleteProject(p)}
                  className="shrink-0 rounded-lg border border-neutral-800 hover:border-red-800 hover:text-red-400 text-neutral-500 px-3 py-1.5 text-xs transition-colors"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const cls =
    "mt-1 w-full rounded-lg bg-black/50 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-amber-500/70 placeholder:text-neutral-600";
  return (
    <label className="block">
      <span className="text-xs text-neutral-400">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={cls}
        />
      )}
    </label>
  );
}
