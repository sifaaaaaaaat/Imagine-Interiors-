"use client";

import React from "react";
import type { MapLayout } from "@/lib/mapLayout";

/* The abstract map: a single SVG in WORLD coordinates holding the gold route
 * (glow underlay + crisp line + animated dash) and per-stop location rings.
 * Everything pans under the camera with pure transforms — no tiles, no
 * geography, just an elegant journey line. */
export default function MapRoute({
  layout,
  activeIndex,
}: {
  layout: MapLayout;
  activeIndex: number;
}) {
  const { stops, pathD, world } = layout;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={world.w}
      height={world.h}
      viewBox={`0 0 ${world.w} ${world.h}`}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="routeGold" x1="0" y1="0" x2={world.w} y2={world.h} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8a6a1d" />
          <stop offset="0.35" stopColor="#EAB308" />
          <stop offset="0.7" stopColor="#F5D878" />
          <stop offset="1" stopColor="#B7891F" />
        </linearGradient>
        <filter id="routeGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* soft glow underlay */}
      <path d={pathD} stroke="url(#routeGold)" strokeWidth="7" strokeLinecap="round" filter="url(#routeGlow)" opacity="0.5" />
      {/* crisp route line */}
      <path d={pathD} stroke="url(#routeGold)" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
      {/* flowing dash hinting direction of travel */}
      <path
        d={pathD}
        stroke="#FFF3C4"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeDasharray="2 30"
        className="route-dash"
        opacity="0.7"
      />

      {/* location rings drawn on the route under each pin */}
      {stops.map((s, i) => {
        const active = i === activeIndex;
        return (
          <ellipse
            key={s.project.id}
            cx={s.pos.x}
            cy={s.pos.y}
            rx={active ? 30 : 22}
            ry={active ? 12 : 8.5}
            stroke={active ? "#F5D878" : "#EAB308"}
            strokeWidth={active ? 2 : 1.2}
            opacity={active ? 0.95 : 0.4}
            style={{ transition: "all 0.5s ease" }}
          />
        );
      })}
    </svg>
  );
}
