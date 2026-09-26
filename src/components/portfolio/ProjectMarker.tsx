"use client";

import React from "react";

/* A glowing gold map pin. States mirror Google-Maps semantics: inactive =
 * subtle, active = larger + brighter + expanding ripple ("you are here"). */
export default function ProjectMarker({
  x,
  y,
  active,
  visited,
  approach,
  onClick,
  label,
}: {
  x: number;
  y: number;
  active: boolean;
  visited: boolean;
  approach: number;
  onClick: () => void;
  label: string;
}) {
  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -92%)",
        transition: "opacity 0.5s ease",
        opacity: 0.35 + approach * 0.65,
      }}
    >
      <button
        onClick={onClick}
        aria-label={`Open project: ${label}`}
        className="pointer-events-auto relative block cursor-pointer outline-none"
        style={{ width: 44, height: 52 }}
      >
        {/* ground rings */}
        <span
          className="marker-ring absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            width: active ? 52 : 38,
            height: active ? 52 : 38,
            borderColor: active ? "rgba(234,179,8,0.75)" : "rgba(234,179,8,0.28)",
            opacity: active ? 0.9 : 0.35 + approach * 0.3,
            boxShadow: active ? "0 0 24px rgba(234,179,8,0.35)" : "none",
          }}
        />
        {/* expanding ripple while active */}
        {active && (
          <span
            className="marker-pulse absolute left-1/2 top-full rounded-full border border-yellow-400/70"
            style={{ width: 52, height: 52 }}
          />
        )}

        {/* the pin itself */}
        <span
          className="marker-pin absolute left-1/2 top-0 -translate-x-1/2 bg-yellow-400"
          style={{
            width: active ? 26 : 21,
            height: active ? 32 : 26,
            transition: "width 0.45s cubic-bezier(0.34,1.4,0.64,1), height 0.45s cubic-bezier(0.34,1.4,0.64,1)",
            opacity: visited && !active ? 0.85 : 1,
          }}
        />
      </button>
    </div>
  );
}
