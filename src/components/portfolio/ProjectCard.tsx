"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { RealProject } from "@/data/realProjects";

/* Compact location-info card, visually anchored to its marker — like the
 * place card Google Maps shows when you reach a pin. Dark, bordered, with a
 * gold arrow; the whole card opens the project's existing detail page. */
export default function ProjectCard({
  project,
  x,
  y,
  emphasis,
  flip,
}: {
  project: RealProject;
  x: number;
  y: number;
  /** 0 = hidden/receded, 1 = fully active. Drives scale/opacity/translate. */
  emphasis: number;
  flip: boolean;
}) {
  const router = useRouter();
  const visible = emphasis > 0.03;
  if (!visible) return null;

  return (
    <div
      className="absolute z-20"
      style={{
        left: x,
        top: y,
        transform: `translate(${flip ? "-100%" : "0"}, 0) translateY(${(1 - emphasis) * 26}px) scale(${0.86 + emphasis * 0.14})`,
        transformOrigin: flip ? "100% 50%" : "0 50%",
        opacity: Math.min(1, emphasis * 1.35),
        pointerEvents: emphasis > 0.55 ? "auto" : "none",
        transition: "opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,0.61,0.36,1)",
        willChange: "transform, opacity",
      }}
    >
      <button
        onClick={() => router.push(`/project/${project.id}`)}
        aria-label={`Open ${project.title}`}
        className="group block w-[300px] cursor-pointer overflow-hidden rounded-xl border border-white/12 bg-[#0B0B0B]/95 text-left shadow-[0_18px_50px_rgba(0,0,0,0.65)] backdrop-blur-sm transition-colors duration-300 hover:border-yellow-400/40 sm:w-[330px]"
      >
        <div className="relative h-[170px] w-full overflow-hidden sm:h-[185px]">
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            sizes="330px"
            loading="lazy"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent" />
        </div>

        <div className="flex items-end justify-between gap-3 px-4 pb-3.5 pt-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-snug text-[#F2F2F2]">
              {project.title}
            </h3>
            <p className="mt-0.5 truncate text-[12px] text-[#9C9C9C]">
              {project.location || "Dhaka, Bangladesh"}
            </p>
            <p className="mt-1 text-[11px] tracking-wide text-[#8A8A8A]">
              <span className="uppercase">{project.category}</span>
              <span className="mx-1.5 text-[#5A5A5A]">·</span>
              <span>{project.year}</span>
            </p>
          </div>
          <span className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-yellow-400 transition-all duration-300 group-hover:border-yellow-400/60 group-hover:bg-yellow-400/10">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
            </svg>
          </span>
        </div>
      </button>
    </div>
  );
}
