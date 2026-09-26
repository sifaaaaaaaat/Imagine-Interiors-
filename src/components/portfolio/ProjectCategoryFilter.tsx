"use client";

import React from "react";
import { CATEGORIES, type CategoryFilter } from "@/lib/mapLayout";

/* Vertical project-category navigation (top right), with the route-line +
 * dots visual from the reference: the active entry shows a filled gold dot. */
export default function ProjectCategoryFilter({
  active,
  counts,
  onChange,
}: {
  active: CategoryFilter;
  counts: Record<CategoryFilter, number>;
  onChange: (c: CategoryFilter) => void;
}) {
  return (
    <nav aria-label="Project categories" className="relative flex flex-col gap-[18px]">
      {/* vertical gold line through the dots */}
      <span className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-yellow-400/50 via-yellow-400/25 to-yellow-400/10" />

      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        const count = counts[cat] ?? 0;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className="group relative flex cursor-pointer items-center gap-3 pl-0 text-left"
            aria-pressed={isActive}
          >
            <span
              className="relative z-10 h-[11px] w-[11px] shrink-0 rounded-full border transition-all duration-300"
              style={{
                borderColor: isActive ? "#EAB308" : "rgba(255,255,255,0.35)",
                background: isActive ? "#EAB308" : "transparent",
                boxShadow: isActive ? "0 0 10px rgba(234,179,8,0.8)" : "none",
              }}
            />
            <span
              className={`text-[10.5px] font-medium tracking-[0.14em] transition-colors duration-300 ${
                isActive ? "text-yellow-400" : "text-[#8F8F8F] group-hover:text-[#C9C9C9]"
              }`}
            >
              {cat}
              {cat !== "ALL PROJECTS" && count === 0 && (
                <span className="ml-1.5 text-[9px] text-[#5A5A5A]">— 0</span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
