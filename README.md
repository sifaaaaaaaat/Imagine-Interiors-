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

No other environment variables, secrets, or API keys are used.

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
├── data/
│   ├── realProjects.ts     # ⭐ ALL 35 PROJECTS (single source of truth)
│   └── siteData.ts         # Blog posts, testimonials, about, contact info, brand logos
└── lib/
    └── mapLayout.ts        # Journey geometry + camera math (pure functions)

public/
├── projects/<project-id>/  # Project photos (JPG, referenced by realProjects.ts)
├── brands/                 # Client logo wall (testimonials page)
└── blog/                   # Blog thumbnails (/blog/) and full heroes (/blog/full/)
```

## How to Add a New Project

1. Create a folder `public/projects/<new-project-id>/` and put the photos in
   it (JPG recommended; keep each photo < 500 KB).
2. Open `src/data/realProjects.ts` and append one object to `REAL_PROJECTS`
   following the existing shape: `id` (must match the folder name), `number`,
   `title`, `client`, `location`, `category` (`RESIDENTIAL` / `COMMERCIAL` /
   `HOSPITALITY`), `year`, `area`, `synopsis`, `quote`, `tags`, `heroImage`,
   `allImages` (each entry: `id`, `src`, `originalUrl`, `title`, `room`,
   `width`, `height`, `aspectRatio`), and `structuredSpaces`.
3. That's it. The portfolio map journey, category filters, sitemap, and
   `/project/<id>` detail page (with gallery + lightbox) pick it up
   automatically.

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

1. Push the repo to GitHub/GitLab.
2. Import the project in Vercel; framework preset **Next.js** is detected.
3. (Optional) set `NEXT_PUBLIC_SITE_URL` to the final domain.
4. Deploy. Static pages and all `/project/*`, `/blog/*` routes prerender.

### Any Node host

```bash
npm ci
npm run build
npm start        # serves on $PORT (default 3000)
```

Put the app behind HTTPS — Next.js serves mixed content safely when the
origin is HTTPS and all assets are local (no third-party scripts).
