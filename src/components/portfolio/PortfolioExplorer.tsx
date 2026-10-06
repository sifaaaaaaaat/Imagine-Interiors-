"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { RealProject } from "@/data/realProjects";
import {
  buildMapLayout,
  cameraAt,
  filterProjects,
  CATEGORIES,
  type CategoryFilter,
} from "@/lib/mapLayout";
import MapPaper from "@/components/portfolio/MapPaper";
import MapRoute from "@/components/portfolio/MapRoute";
import ProjectMarker from "@/components/portfolio/ProjectMarker";
import ProjectCard from "@/components/portfolio/ProjectCard";
import ProjectCategoryFilter from "@/components/portfolio/ProjectCategoryFilter";

/* ============================================================================
 * PORTFOLIO EXPLORER — "Projects Across Places"
 *
 * A full-screen, scroll-driven map journey styled after a real maps app: a
 * white folded paper city sheet (MapPaper) floats on a warm-white page, and
 * the camera pans/tilts across it stop by stop as the user scrolls. A tall
 * spacer gives the page its scroll length; the visible layer is `sticky` and
 * the world (paper + route + markers + cards) pans under a virtual camera
 * whose position is the LERPED scroll progress. Stop anywhere: the camera
 * freezes exactly there. As the camera settles onto a stop it breathes in a
 * gentle zoom about the camera point — the "arrive and focus" feel.
 *
 * Performance: the 60fps loop mutates ONLY transforms/opacity directly on DOM
 * nodes (no React re-renders); React state updates just the active index.
 * ========================================================================== */

/** Scroll length per stop, in viewport heights. */
const VH_PER_STOP = 1.15;

/** A world node registered by each marker/card so the RAF loop can drive
 *  emphasis (opacity/scale) imperatively. */
type WorldItem = {
  el: HTMLElement;
  index: number;
  kind: "card" | "marker";
};

export default function PortfolioExplorer({
  projects,
}: {
  projects: RealProject[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<CategoryFilter>("ALL PROJECTS");

  const active = useMemo(() => filterProjects(projects, filter), [projects, filter]);
  const layout = useMemo(() => buildMapLayout(active), [active]);

  const sectionRef = useRef<HTMLElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Map<string, WorldItem>>(new Map());
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const activeIdxRef = useRef(0);
  const dimsRef = useRef({ w: 1440, h: 810, top: 0, scrollLen: 1 });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  /* Category counts for the filter UI. */
  const counts = useMemo(() => {
    const c = {} as Record<CategoryFilter, number>;
    for (const cat of CATEGORIES) {
      c[cat] =
        cat === "ALL PROJECTS"
          ? projects.length
          : projects.filter((p) => p.category === cat).length;
    }
    return c;
  }, [projects]);

  /* Register/unregister world items for imperative emphasis updates. */
  const registerItem = useCallback((key: string, item: WorldItem | null) => {
    if (item) itemsRef.current.set(key, item);
    else itemsRef.current.delete(key);
  }, []);

  /* Measure viewport + the journey's document-space scroll range. Writes
   * refs only — the RAF loop consumes these without re-rendering React. */
  const measure = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const section = sectionRef.current;
    const top = section
      ? section.getBoundingClientRect().top + window.scrollY
      : 0;
    const stops = Math.max(layout.stops.length, 1);
    const scrollLen = stops * VH_PER_STOP * h; // = spacer height = pinned range
    dimsRef.current = { w, h, top, scrollLen };
  }, [layout.stops.length]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /* Mobile breakpoint (deferred so the effect body never setState directly). */
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMobile(window.innerWidth < 768));
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /* Filter change (event handler, not an effect): return to the first stop
   * of the newly generated route — like re-centering the map. */
  const handleFilterChange = useCallback((c: CategoryFilter) => {
    setFilter((prev) => {
      if (prev !== c) {
        targetRef.current = 0;
        currentRef.current = 0;
        activeIdxRef.current = 0;
        setActiveIndex(0);
        const section = sectionRef.current;
        if (section) {
          const top = section.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(0, top + 2);
        }
      }
      return c;
    });
  }, []);

  /* THE LOOP — lerped camera + gentle zoom-breath + imperative emphasis. */
  useEffect(() => {
    const handleScroll = () => {
      const { top, scrollLen } = dimsRef.current;
      const rel = window.scrollY - top;
      targetRef.current = Math.min(Math.max(rel / Math.max(scrollLen, 1), 0), 1);
    };

    const update = () => {
      // Run the loop only while the journey section is near the viewport —
      // saves CPU when the user is at the hero or elsewhere.
      const { top, scrollLen } = dimsRef.current;
      const rel = window.scrollY - top;
      if (rel < -window.innerHeight * 1.5 || rel > scrollLen + window.innerHeight * 0.5) {
        rafRef.current = requestAnimationFrame(update);
        return;
      }

      const diff = targetRef.current - currentRef.current;
      if (Math.abs(diff) > 0.0004) currentRef.current += diff * 0.09;
      else currentRef.current = targetRef.current;

      const u = currentRef.current;
      const { w, h } = dimsRef.current;
      const cam = cameraAt(layout.stops, u);
      const tx = w / 2 - cam.x;
      const ty = h / 2 - cam.y;

      // Zoom-breath: as the camera settles onto a stop it breathes in up to
      // ~6% about the current camera point — the maps-app "arrive and focus"
      // feel. Mid-glide between stops the scale eases back toward 1.
      if (worldRef.current) {
        const n = Math.max(layout.stops.length, 1);
        const focus = u * (n - 1);
        const dist = Math.abs(focus - Math.round(focus)); // 0 = on a stop
        const settle = Math.max(0, 1 - dist / 0.32);
        const breathe = 1 + 0.06 * settle * settle;
        worldRef.current.style.transformOrigin = `${cam.x.toFixed(2)}px ${cam.y.toFixed(2)}px`;
        worldRef.current.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${breathe.toFixed(4)})`;
      }

      // Imperative emphasis per stop — no React re-render at 60fps.
      const nStops = layout.stops.length;
      const focus = u * Math.max(nStops - 1, 0);
      let nearest = 0;
      let nearestD = Infinity;
      itemsRef.current.forEach((item) => {
        const d = Math.abs(item.index - focus);
        if (d < nearestD) {
          nearestD = d;
          nearest = item.index;
        }
        const em = Math.max(0, 1 - d / 0.62);
        const el = item.el;
        if (item.kind === "card") {
          const vis = em > 0.03;
          el.style.opacity = String(Math.min(1, em * 1.35));
          el.style.transform = `translateY(${((1 - em) * 26).toFixed(1)}px) scale(${(0.86 + em * 0.14).toFixed(3)})`;
          el.style.pointerEvents = em > 0.55 ? "auto" : "none";
          el.style.visibility = vis ? "visible" : "hidden";
        } else {
          el.style.opacity = String(0.35 + em * 0.65);
        }
      });

      if (nearest !== activeIdxRef.current) {
        activeIdxRef.current = nearest;
        setActiveIndex(nearest);
      }

      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    rafRef.current = requestAnimationFrame(update);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [layout]);

  const openProject = useCallback((id: string) => router.push(`/project/${id}`), [router]);

  const nStops = layout.stops.length;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#F4F1E9]"
      aria-label="Projects across places — map exploration"
    >
      {/* Pinned cinematic viewport — MUST precede the spacer so its natural
          position is at the section top; the spacer then provides the pinned
          scroll length. Warm-white page so the paper sheet reads as a map
          floating on white. */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#F4F1E9]">
        {/* soft paper-page vignette — warm light falloff, no dark edges */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgba(112,94,66,0.10)_100%)]" />

        {/* THE WORLD — the paper city map panning under the camera. */}
        <div
          ref={worldRef}
          className="absolute left-0 top-0 will-change-transform"
          style={{ width: layout.world.w, height: layout.world.h }}
        >
          <MapPaper layout={layout} />
          <MapRoute layout={layout} activeIndex={activeIndex} />

          {layout.stops.map((stop, i) => {
            // Vertical serpentine: cards sit on the OUTER side of their pin
            // (toward the band edge) — off the route, and since adjacent
            // pins alternate sides, adjacent cards can never collide.
            const cardW = isMobile
              ? Math.min(310, (typeof window !== "undefined" ? window.innerWidth : 390) - 36)
              : 330;
            const pinOnLeft = stop.pos.x < layout.world.w / 2;
            const cardX = isMobile
              ? stop.pos.x - cardW / 2
              : pinOnLeft
                ? stop.pos.x - 30 - cardW
                : stop.pos.x + 30;
            const cardY = isMobile ? stop.pos.y + 64 : stop.pos.y - 120;
            return (
              <React.Fragment key={stop.project.id}>
                {/* pointer-events-none here; the pin button re-enables
                    clicks on itself so these full-world layers can never
                    swallow card clicks. */}
                <div
                  ref={(el) => registerItem(`${stop.project.id}-m`, el ? { el, index: i, kind: "marker" } : null)}
                  className="pointer-events-none absolute inset-0 z-30"
                  style={{ opacity: 0.35 }}
                >
                  <ProjectMarker
                    x={stop.pos.x}
                    y={stop.pos.y}
                    active={i === activeIndex}
                    visited={i < activeIndex}
                    approach={1}
                    onClick={() => openProject(stop.project.id)}
                    label={stop.project.title}
                  />
                </div>
                <div
                  ref={(el) => registerItem(`${stop.project.id}-c`, el ? { el, index: i, kind: "card" } : null)}
                  className="absolute z-40"
                  style={{
                    left: cardX,
                    top: cardY,
                    opacity: 0,
                    visibility: "hidden",
                  }}
                >
                  <ProjectCard
                    project={stop.project}
                    x={0}
                    y={0}
                    emphasis={1}
                    flip={false}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* ======================= UI CHROME ======================= */}

        {/* TOP LEFT — editorial title block, ink on paper. */}
        <header className="pointer-events-none absolute left-5 top-7 z-20 max-w-[280px] sm:left-10 sm:top-10 sm:max-w-sm">
          <p className="mb-3 flex items-center gap-3 text-[11px] font-semibold tracking-[0.35em] text-[#1F5E96]">
            OUR WORK
            <span className="inline-block h-px w-10 bg-[#1F5E96]/50" />
          </p>
          <h1 className="font-display text-[42px] leading-[1.04] text-[#232323] sm:text-6xl">
            Projects
            <br />
            Across Places
          </h1>
          <p className="mt-4 max-w-[300px] text-[12.5px] leading-relaxed text-[#7A7468]">
            From cozy homes to vibrant commercial spaces, our work lives in
            different corners — each with its own story.
          </p>
          <p className="mt-6 hidden text-[11px] tracking-[0.22em] text-[#6E6E6E] sm:block">
            {String(Math.min(activeIndex + 1, nStops)).padStart(2, "0")} /{" "}
            {String(nStops).padStart(2, "0")}
            <span className="mx-2 text-[#C6BFAF]">·</span>SCROLL TO TRAVEL
          </p>
          {/* Mobile progress + hint */}
          <p className="mt-5 text-[10px] tracking-[0.22em] text-[#6E6E6E] sm:hidden">
            {String(Math.min(activeIndex + 1, nStops)).padStart(2, "0")} /{" "}
            {String(nStops).padStart(2, "0")} · SWIPE TO TRAVEL
          </p>
        </header>

        {/* TOP RIGHT — category navigation (vertical on desktop). */}
        <div className="absolute right-5 top-7 z-30 hidden sm:right-10 sm:top-10 sm:block">
          <ProjectCategoryFilter active={filter} counts={counts} onChange={handleFilterChange} />
        </div>

        {/* Mobile category chips: white pill bar, blue active (maps-app look). */}
        <div className="absolute left-0 right-0 top-5 z-30 flex justify-center px-4 sm:hidden">
          <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-full border border-[#DDD6C6] bg-white/85 px-2 py-1.5 backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-medium tracking-[0.12em] transition-colors ${
                  filter === cat
                    ? "bg-[#3E8ED0] text-white"
                    : "text-[#5B554A] hover:text-[#232323]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM LEFT — brand (desktop only; mobile keeps the tagline). */}
        <div className="pointer-events-none absolute bottom-6 left-5 z-20 hidden items-center gap-3 sm:flex sm:bottom-9 sm:left-10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E8ED0" strokeWidth="1.4">
            <path d="M12 2l3.2 6.8L22 10l-5 4.9L18.2 22 12 18.4 5.8 22 7 14.9 2 10l6.8-1.2L12 2Z" />
          </svg>
          <span className="text-[10.5px] font-semibold tracking-[0.35em] text-[#232323]">
            IMAGINE INTERIORS
          </span>
        </div>

        {/* BOTTOM RIGHT — tagline (centered on mobile). */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20 flex justify-center sm:left-auto sm:right-5 sm:bottom-9 sm:right-10 sm:justify-end">
          <span className="text-[10.5px] font-medium tracking-[0.3em] text-[#1F5E96]">
            SPACES THAT TELL STORIES.
          </span>
          <span className="hidden h-px w-10 bg-[#1F5E96]/40 sm:block" />
        </div>
      </div>

      {/* Scroll spacer providing the physical journey length (pinned range). */}
      <div
        data-spacer
        aria-hidden
        style={{ height: `${Math.max(nStops, 1) * VH_PER_STOP * 100}vh` }}
      />
    </section>
  );
}
