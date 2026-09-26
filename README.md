# Imagine Interiors — Website

Production website for **Imagine Interiors**, a Dhaka-based interior design
firm. Next.js App Router site with a cinematic scroll-driven hero (door
transition), a "Projects Across Places" map-style portfolio journey, project
detail pages with masonry galleries + lightbox, blog, testimonials, about, and
contact pages.

## Tech Stack

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)                 |
| UI        | React 19 + Tailwind CSS v4                         |
| Language  | TypeScript (strict)                                |
| Fonts     | Playfair Display, Montserrat, Plus Jakarta Sans    |
| Hosting   | Any Node host (Vercel recommended)                 |

No database, no CMS, no backend API — all content lives in typed data files
and all media is served from `public/`.

## Getting Started

```bash
npm install        # install dependencies
npm run dev        # dev server → http://localhost:3000
```

## Production Build & Run

```bash
npm run build      # optimized production build (.next/)
npm start          # serve the production build → http://localhost:3000
```

`npm run lint` runs ESLint; `npx tsc --noEmit` typechecks. Both must pass
before deployment.

## Environment Variables

| Variable                | Required | Purpose                                                    |
| ----------------------- | -------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | No       | Canonical site URL used by sitemap/robots/Open Graph. Falls back to `https://imagineinteriors.design`. |
| `ADMIN_PASSWORD`        | For CMS  | Password for the `/admin` dashboard (see "Project CMS" below). |
| `GITHUB_TOKEN`          | No       | Enables "Save to GitHub" from the CMS. Classic token with the `repo` scope. |
| `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_BRANCH` | No | Target repo for CMS sync (defaults to `sifaaaaaaaat` / `Imagine-Interiors-` / `main`). |

No other secrets or API keys are used. Copy `.env.example` to `.env.local` to get started.

## Where Things Live

```
src/
├── app/                    # Routes (App Router)
│   ├── page.tsx            # Home: cinematic hero + portfolio journey
│   ├── project/[id]/       # Project detail (server page + client UI)
│   ├── blog/[slug]/        # Blog article (server page + client UI)
│   ├── about/ testimonials/ contact/
│   ├── layout.tsx          # Fonts, root metadata (OG/Twitter/robots)
│   ├── sitemap.ts          # /sitemap.xml — all pages, projects, posts
│   ├── robots.ts           # /robots.txt
│   └── not-found.tsx       # Styled 404
├── components/
│   ├── HeroSection.tsx     # Door transition + journey integration (home)
│   ├── SiteNav.tsx  SiteFooter.tsx
│   └── portfolio/
│       ├── PortfolioExplorer.tsx   # Scroll-driven map camera
│       ├── MapRoute.tsx            # Gold serpentine route (SVG)
│       ├── ProjectMarker.tsx       # Glowing map pins
│       ├── ProjectCard.tsx         # Compact place-cards
│       └── ProjectCategoryFilter.tsx
├── app/
│   ├── admin/page.tsx      # ⭐ /admin CMS dashboard (password-protected)
│   └── api/admin/          # CMS API: login, projects list/create/delete
├── data/
│   ├── projects.json       # ⭐ ALL 35 PROJECTS (single source of truth, CMS-writable)
│   ├── realProjects.ts     # Typed loader over projects.json (site imports stay stable)
│   └── siteData.ts         # Blog posts, testimonials, about, contact info, brand logos
└── lib/
    ├── cmsAuth.ts          # Admin sessions (password → bearer token)
    ├── githubSync.ts       # Commits projects.json + images to GitHub via API
    ├── imageMeta.ts        # Dependency-free JPEG/PNG/WebP dimension sniffing
    └── mapLayout.ts        # Journey geometry + camera math (pure functions)

public/
├── projects/<project-id>/  # Project photos (JPG, referenced by projects.json)
├── brands/                 # Client logo wall (testimonials page)
└── blog/                   # Blog thumbnails (/blog/) and full heroes (/blog/full/)
```

## How to Add a New Project

### Recommended: the CMS at `/admin`

1. Set `ADMIN_PASSWORD` in `.env.local` (and `GITHUB_TOKEN` to sync to this
   repo), then open **/admin** and sign in.
2. Click **+ Add project**, fill the form (only the title is required),
   pick the photos, and **Save**.
3. The project appears on the site immediately in dev mode. On Vercel, the
   commit pushed by the CMS triggers a redeploy automatically (~1–2 min).

The first uploaded image becomes the project cover, dimensions are detected
automatically, and images land in `public/projects/<project-id>/`.

### Manual: edit the data file

1. Create a folder `public/projects/<new-project-id>/` and put the photos in
   it (JPG recommended; keep each photo < 500 KB).
2. Open `src/data/projects.json` and append one object following the existing
   shape: `id` (must match the folder name), `number`, `title`, `client`,
   `location`, `category` (`RESIDENTIAL` / `COMMERCIAL` / `HOSPITALITY`),
   `year`, `area`, `synopsis`, `quote`, `tags`, `heroImage`, `allImages`
   (each entry: `id`, `src`, `originalUrl`, `title`, `room`, `width`,
   `height`, `aspectRatio`), and `structuredSpaces`.
3. That's it. The portfolio map journey, category filters, sitemap, and
   `/project/<id>` detail page (with gallery + lightbox) pick it up
   automatically.

## Project CMS (/admin)

A password-protected dashboard for the client to manage the portfolio without
touching code.

- **Login**: set `ADMIN_PASSWORD` in `.env.local` (locally) or as an
  environment variable in the host (production). Sessions are signed-in tokens
  stored in the browser for the tab session.
- **Add project**: title + category + photos is enough; synopsis, quote, tags,
  client, location, year, and area are optional with sensible defaults.
- **Delete project**: removes it from the site and commits the change; photo
  files are kept (delete manually if unwanted).
- **GitHub sync**: with `GITHUB_TOKEN` set, every save/delete commits
  `src/data/projects.json` and new images straight to this repository —
  on Vercel this triggers an automatic redeploy. Without a token, changes are
  saved to the local files only.

## How to Add / Edit Blog Posts

Edit `BLOG_POSTS` in `src/data/siteData.ts`. Each post needs a unique `slug`,
thumbnail (`/blog/…`) and hero (`/blog/full/…`) images in `public/blog/`, and
a `body` array of blocks (`P`, `H2`, `H3`, `H4`, `LI`).

## How to Update Text / Content

- **Contact details** (email, phones, office, factory): `CONTACT_INFO` in
  `src/data/siteData.ts`.
- **About page copy**: `ABOUT` in `src/data/siteData.ts`.
- **Testimonials**: `TESTIMONIALS` in `src/data/siteData.ts`.
- **Client logo wall**: `BRAND_LOGOS` (files in `public/brands/`).
- **Hero footer/labels & door copy**: strings inside
  `src/components/HeroSection.tsx`.
- **Portfolio journey chrome** (headings, tagline, hints):
  `src/components/portfolio/PortfolioExplorer.tsx`.

## Maintenance Notes

- **Journey feel**: scroll length per stop and easing constants live at the
  top of `src/lib/mapLayout.ts` (`VH_PER_STOP` is in
  `src/components/portfolio/PortfolioExplorer.tsx`).
- **Door transition timing**: phase constants (`DOOR_END`, `CAMERA_START`) are
  at the top of `src/components/HeroSection.tsx`.
- **Images**: always ship JPG/WebP; PNG only for logos. Large PNGs balloon
  deploy size and slow first paint.
- After editing data, run `npm run build` — the sitemap and static project
  pages regenerate automatically.

## Deployment

### Vercel (recommended)

**This project is already deployed:** https://imagine-interiors-xi.vercel.app

- Vercel project: `hosen-sifats-projects/imagine-interiors`, connected to this
  GitHub repository — every push to `main` auto-deploys to production.
- Environment variables configured on Vercel: `ADMIN_PASSWORD`,
  `GITHUB_TOKEN` (enables CMS → GitHub sync), `NEXT_PUBLIC_SITE_URL`.
- To redeploy manually: `npx vercel deploy --prod` from the project root.

### Any Node host

```bash
npm ci
npm run build
npm start        # serves on $PORT (default 3000)
```

Put the app behind HTTPS — Next.js serves mixed content safely when the
origin is HTTPS and all assets are local (no third-party scripts).
