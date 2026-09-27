"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { REAL_PROJECTS, ProjectImage } from "@/data/realProjects";

// Masonry layout: distribute images across columns by shortest column height
function distributeToColumns(
  images: ProjectImage[],
  colCount: number
): ProjectImage[][] {
  const cols: ProjectImage[][] = Array.from({ length: colCount }, () => []);
  const colHeights: number[] = Array(colCount).fill(0);

  images.forEach((img) => {
    const shortestCol = colHeights.indexOf(Math.min(...colHeights));
    cols[shortestCol].push(img);
    // Use aspect ratio to estimate relative height
    const ratio = img.height / img.width;
    colHeights[shortestCol] += ratio;
  });

  return cols;
}

export default function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const project = REAL_PROJECTS.find((p) => p.id === resolvedParams.id);
  const [lightboxImage, setLightboxImage] = useState<ProjectImage | null>(null);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Stagger-in animation via IntersectionObserver
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-img-id");
            if (id) {
              setVisibleItems((prev) => new Set(prev).add(id));
            }
          }
        });
      },
      { rootMargin: "60px", threshold: 0.05 }
    );

    const elements = document.querySelectorAll("[data-img-id]");
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [project]);

  // Keyboard: Escape closes lightbox, arrows navigate
  useEffect(() => {
    if (!lightboxImage || !project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImage(null);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const idx = project.allImages.findIndex((i) => i.id === lightboxImage.id);
        const next = (idx + 1) % project.allImages.length;
        setLightboxImage(project.allImages[next]);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const idx = project.allImages.findIndex((i) => i.id === lightboxImage.id);
        const prev = (idx - 1 + project.allImages.length) % project.allImages.length;
        setLightboxImage(project.allImages[prev]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">Project Not Found</h1>
          <Link
            href="/"
            className="text-sm font-mono tracking-widest uppercase text-[#888888] hover:text-white transition-colors"
          >
            ← RETURN TO HOME
          </Link>
        </div>
      </div>
    );
  }

  // Responsive column count
  const columns3 = distributeToColumns(project.allImages, 3);
  const columns2 = distributeToColumns(project.allImages, 2);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] selection:bg-white selection:text-black">
      {/* ============================================================ */}
      {/* STICKY HEADER NAV                                            */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/8 px-5 sm:px-8 lg:px-12 py-4 flex flex-wrap items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/8 hover:bg-white text-white hover:text-black border border-white/15 transition-all duration-300 text-xs tracking-[0.16em] uppercase font-semibold"
        >
          <svg
            className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>ALL PROJECTS</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono tracking-widest text-[#666666] uppercase">
          <span>{project.number}</span>
          {project.location && (
            <>
              <span>/</span>
              <span>{project.location}</span>
            </>
          )}
          <span>/</span>
          <span>{project.allImages.length} PHOTOGRAPHS</span>
        </div>

        <div className="text-xs font-mono tracking-widest text-[#555555] uppercase">
          {project.year}
        </div>
      </header>

      {/* ============================================================ */}
      {/* PROJECT HERO / INFO                                          */}
      {/* ============================================================ */}
      <section className="w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-12">
        <div className="flex flex-col gap-6">
          <span className="text-xs font-mono tracking-[0.3em] text-[#555555] uppercase">
            PROJECT {project.number} — {project.category}
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.05]">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-mono tracking-widest text-[#888888] uppercase pt-2">
            {project.location && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#444444]" />
                <span>{project.location}</span>
              </div>
            )}
            {project.area && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#444444]" />
                <span>{project.area}</span>
              </div>
            )}
            {project.client && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#444444]" />
                <span>{project.client}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#444444]" />
              <span>{project.year}</span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#999999] font-light max-w-3xl leading-relaxed pt-2">
            {project.synopsis}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/8 text-[10px] font-mono tracking-widest text-[#888888] uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="h-px bg-white/8" />
      </div>

      {/* ============================================================ */}
      {/* MASONRY PHOTO GALLERY - NO TEXT ON IMAGES                    */}
      {/* ============================================================ */}
      <section className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 pt-10 pb-20">
        {/* 3-Column Masonry for lg+, 2-column for sm+, 1-col for mobile */}
        {/* Desktop: 3 columns */}
        <div className="hidden lg:grid grid-cols-3 gap-4">
          {columns3.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-4">
              {col.map((img, imgIdx) => (
                <div
                  key={img.id}
                  data-img-id={img.id}
                  onClick={() => setLightboxImage(img)}
                  className="relative w-full overflow-hidden rounded-2xl bg-[#141414] cursor-pointer group"
                  style={{
                    aspectRatio: `${img.width}/${img.height}`,
                    opacity: visibleItems.has(img.id) ? 1 : 0,
                    transform: visibleItems.has(img.id)
                      ? "translateY(0) scale(1)"
                      : "translateY(40px) scale(0.97)",
                    transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${imgIdx * 0.08}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${imgIdx * 0.08}s`,
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                  />
                  {/* Minimal hover overlay - no text, just subtle zoom effect */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tablet: 2 columns */}
        <div className="hidden sm:grid lg:hidden grid-cols-2 gap-3">
          {columns2.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-3">
              {col.map((img, imgIdx) => (
                <div
                  key={img.id}
                  data-img-id={img.id}
                  onClick={() => setLightboxImage(img)}
                  className="relative w-full overflow-hidden rounded-xl bg-[#141414] cursor-pointer group"
                  style={{
                    aspectRatio: `${img.width}/${img.height}`,
                    opacity: visibleItems.has(img.id) ? 1 : 0,
                    transform: visibleItems.has(img.id)
                      ? "translateY(0) scale(1)"
                      : "translateY(40px) scale(0.97)",
                    transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${imgIdx * 0.08}s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${imgIdx * 0.08}s`,
                  }}
                >
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    sizes="50vw"
                    className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Mobile: single column */}
        <div className="grid sm:hidden grid-cols-1 gap-3">
          {project.allImages.map((img, imgIdx) => (
            <div
              key={img.id}
              data-img-id={img.id}
              onClick={() => setLightboxImage(img)}
              className="relative w-full overflow-hidden rounded-xl bg-[#141414] cursor-pointer group"
              style={{
                aspectRatio: `${img.width}/${img.height}`,
                opacity: visibleItems.has(img.id) ? 1 : 0,
                transform: visibleItems.has(img.id)
                  ? "translateY(0) scale(1)"
                  : "translateY(30px) scale(0.98)",
                transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${imgIdx * 0.06}s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${imgIdx * 0.06}s`,
              }}
            >
              <Image
                src={img.src}
                alt={img.title}
                fill
                sizes="100vw"
                className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      {project.quote && (
        <section className="w-full max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 pb-20">
          <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.03] border border-white/8">
            <span className="text-5xl sm:text-6xl font-heading font-black text-white/10 leading-none block mb-4">&ldquo;</span>
            <p className="text-base sm:text-lg text-[#CCCCCC] font-light italic leading-relaxed -mt-8 pl-2">
              {project.quote}
            </p>
            <div className="mt-6 pt-4 border-t border-white/8 flex items-center justify-between text-xs font-mono tracking-widest text-[#666666] uppercase">
              <span>{project.client || project.title}</span>
              <span>{project.location || "Dhaka, Bangladesh"}</span>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Nav */}
      <footer className="w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 pt-8 border-t border-white/8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#888888] hover:text-white uppercase transition-colors"
          >
            ← BACK TO ALL PROJECTS
          </Link>

          {/* Navigate to next/prev project */}
          <div className="flex items-center gap-3">
            {(() => {
              const idx = REAL_PROJECTS.findIndex((p) => p.id === project.id);
              const prev = REAL_PROJECTS[(idx - 1 + REAL_PROJECTS.length) % REAL_PROJECTS.length];
              const next = REAL_PROJECTS[(idx + 1) % REAL_PROJECTS.length];
              return (
                <>
                  <Link
                    href={`/project/${prev.id}`}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono tracking-widest text-[#AAAAAA] hover:text-white uppercase transition-all"
                  >
                    ← {prev.title.split(",")[0]}
                  </Link>
                  <Link
                    href={`/project/${next.id}`}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono tracking-widest text-[#AAAAAA] hover:text-white uppercase transition-all"
                  >
                    {next.title.split(",")[0]} →
                  </Link>
                </>
              );
            })()}
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* LIGHTBOX - Full screen, no text overlays                     */}
      {/* ============================================================ */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-2xl"
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {/* Previous */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = project.allImages.findIndex((i) => i.id === lightboxImage.id);
              const prev = (idx - 1 + project.allImages.length) % project.allImages.length;
              setLightboxImage(project.allImages[prev]);
            }}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-lg transition-colors cursor-pointer"
            aria-label="Previous photo"
          >
            ←
          </button>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const idx = project.allImages.findIndex((i) => i.id === lightboxImage.id);
              const next = (idx + 1) % project.allImages.length;
              setLightboxImage(project.allImages[next]);
            }}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-lg transition-colors cursor-pointer"
            aria-label="Next photo"
          >
            →
          </button>

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl max-h-[85vh] w-full flex items-center justify-center"
          >
            <div
              className="relative w-full flex items-center justify-center overflow-hidden rounded-2xl shadow-2xl bg-black border border-white/10"
              style={{
                aspectRatio: lightboxImage.aspectRatio || "3/2",
                maxHeight: "80vh",
              }}
            >
              <Image
                src={lightboxImage.src}
                alt={lightboxImage.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 85vw"
                className="object-contain"
              />
            </div>

            {/* Minimal caption: just counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-mono text-[#666666] tracking-widest">
              {project.allImages.findIndex((i) => i.id === lightboxImage.id) + 1} / {project.allImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
