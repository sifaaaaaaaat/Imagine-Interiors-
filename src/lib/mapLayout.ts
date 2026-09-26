import type { RealProject } from "@/data/realProjects";

/* ============================================================================
 * MAP LAYOUT — "Explore our projects like exploring places on a map."
 *
 * A pure library with zero React: given the projects that currently
 * participate (after category filtering), it generates
 *
 *   · an organic winding route through the WORLD (a 3000×1700 abstract map),
 *   · a marker position on that route for every project, and
 *   · camera math to fly the viewport smoothly from place to place.
 *
 * The same route shape is reused for the SVG path, the marker coordinates and
 * the camera targets, so the journey stays perfectly coherent at any size.
 * ========================================================================== */

export type Vec2 = { x: number; y: number };

export interface MapStop {
  project: RealProject;
  index: number;
  /** Marker position in world coordinates. */
  pos: Vec2;
  /** Outward normal at the marker (used to place cards off the route). */
  normal: Vec2;
  /** Cumulative arc-length position of this stop, normalized 0→1. */
  routeT: number;
  /** Camera center that frames this stop. */
  cam: Vec2;
}

export interface MapLayout {
  stops: MapStop[];
  /** SVG path data for the whole route (world units). */
  pathD: string;
  /** World-space bounding box of the route. */
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
  world: { w: number; h: number };
}

/** Deterministic PRNG so the journey is identical on every render/reload. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Catmull-Rom → cubic bezier converter for one open polyline. */
export function catmullRomPath(pts: Vec2[]): string {
  if (pts.length < 2) return "";
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < p.length - 2; i++) {
    const p0 = p[i - 1];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/** Piecewise-linear point + tangent on a polyline (arch-length t in 0→1). */
function samplePolyline(pts: Vec2[], t: number): { p: Vec2; tan: Vec2 } {
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const len = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
    segs.push(len);
    total += len;
  }
  let target = Math.min(Math.max(t, 0), 1) * total;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const f = segs[i] === 0 ? 0 : Math.min(target / segs[i], 1);
      const p = {
        x: pts[i].x + (pts[i + 1].x - pts[i].x) * f,
        y: pts[i].y + (pts[i + 1].y - pts[i].y) * f,
      };
      const len = segs[i] || 1;
      return { p, tan: { x: (pts[i + 1].x - pts[i].x) / len, y: (pts[i + 1].y - pts[i].y) / len } };
    }
    target -= segs[i];
  }
  const last = pts[pts.length - 1];
  return { p: last, tan: { x: 1, y: 0 } };
}

/** The journey shape: a VERTICAL serpentine — the route descends through a
 *  tall world, snaking left and right with rounded U-bends like the reference
 *  ribbon. The camera travels downward as the user scrolls. */
function makeJourney(
  count: number,
  rnd: () => number
): { anchors: Vec2[]; world: { w: number; h: number } } {
  // A NARROW band so ~2 U-bends fit in one viewport — the ribbon reads as a
  // vertical snake at every camera position, like the reference.
  const W = 1100;
  const M = 320;
  const STEP = 430; // vertical distance between anchor turns (bend ≈ screen)
  const turns = Math.max(8, Math.round(count / 2.2));
  const H = M * 2 + turns * STEP;

  const anchors: Vec2[] = [];
  for (let i = 0; i <= turns; i++) {
    const y = M + ((H - M * 2) * i) / turns;
    let x: number;
    if (i === 0 || i === turns) {
      // Enter top-center, exit bottom-center — like the reference ribbon.
      x = W * 0.5 + (rnd() - 0.5) * 40;
    } else {
      // Tight edge-to-edge swings; Catmull-Rom rounds them into U-bends.
      const right = i % 2 === 0;
      x = (right ? W * 0.83 : W * 0.17) + (rnd() - 0.5) * 40;
    }
    anchors.push({ x, y: i === 0 || i === turns ? y : y + (rnd() - 0.5) * 30 });
  }
  return { anchors, world: { w: W, h: H } };
}

export function buildMapLayout(projects: RealProject[]): MapLayout {
  const rnd = mulberry32(20260925);
  const { anchors, world } = makeJourney(projects.length, rnd);
  const spline = catmullRomPath(anchors);

  // Dense polyline sampling of the bezier for arc-length math + normals.
  const dense: Vec2[] = [anchors[0]];
  const CMD = 180; // samples per cubic segment
  // Re-derive control points exactly like catmullRomPath did:
  const p = [anchors[0], ...anchors, anchors[anchors.length - 1]];
  for (let i = 1; i < p.length - 2; i++) {
    const p0 = p[i - 1], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    for (let s = 1; s <= CMD; s++) {
      const t = s / CMD;
      const mt = 1 - t;
      const x = mt*mt*mt*p1.x + 3*mt*mt*t*c1.x + 3*mt*t*t*c2.x + t*t*t*p2.x;
      const y = mt*mt*mt*p1.y + 3*mt*mt*t*c1.y + 3*mt*t*t*c2.y + t*t*t*p2.y;
      dense.push({ x, y });
    }
  }

  const n = projects.length;
  const stops: MapStop[] = projects.map((project, i) => {
    // Trim from the very ends so the route visibly leads in and out.
    const t = n === 1 ? 0.5 : 0.06 + (i / (n - 1)) * 0.88;
    const { p, tan } = samplePolyline(dense, t);
    const len = Math.hypot(tan.x, tan.y) || 1;
    const normal = { x: -tan.y / len, y: tan.x / len };
    return {
      project,
      index: i,
      pos: p,
      normal,
      routeT: t,
      cam: { x: p.x, y: p.y },
    };
  });

  const xs = dense.map((d) => d.x);
  const ys = dense.map((d) => d.y);
  const bounds = {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };

  return { stops, pathD: spline, bounds, world };
}

/** Camera focus for a given normalized journey progress (0→1): glides the
 *  viewport from stop to stop with a gentle pause on each (ease-in-out per
 *  segment). This is what makes scrolling feel like flying a map camera. */
export function cameraAt(stops: MapStop[], u: number): Vec2 {
  if (stops.length === 0) return { x: 1500, y: 850 };
  if (stops.length === 1) return stops[0].cam;
  const seg = u * (stops.length - 1);
  const i = Math.min(Math.floor(seg), stops.length - 2);
  const f = seg - i;
  const ease = f * f * (3 - 2 * f); // smoothstep: pauses at each stop
  const a = stops[i].cam;
  const b = stops[i + 1].cam;
  return {
    x: a.x + (b.x - a.x) * ease,
    y: a.y + (b.y - a.y) * ease,
  };
}

/** Journey progress (0→1) at which each stop becomes the active stop. */
export function stopActivation(stops: MapStop[]): number[] {
  const n = stops.length;
  if (n === 0) return [];
  if (n === 1) return [0];
  return stops.map((_, i) => i / (n - 1));
}

export const CATEGORIES = [
  "ALL PROJECTS",
  "RESIDENTIAL",
  "COMMERCIAL",
  "RETAIL",
  "HOSPITALITY",
] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];

export function filterProjects(
  projects: RealProject[],
  filter: CategoryFilter
): RealProject[] {
  if (filter === "ALL PROJECTS") return projects;
  return projects.filter((p) => p.category === filter);
}
