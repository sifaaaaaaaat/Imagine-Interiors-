"use client";

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import { REAL_PROJECTS } from "@/data/realProjects";
import SiteNav from "@/components/SiteNav";
import PortfolioExplorer from "@/components/portfolio/PortfolioExplorer";

/* ---------------------------------------------------------------------------
 * ONE SCROLL TIMELINE · ONE CONTINUOUS CAMERA JOURNEY
 *
 * Conceptual layer stack (bottom → top), inside the pinned viewport:
 *
 *   [z-0]  PORTFOLIO ENVIRONMENT — the real, pure-black archive background.
 *          It sits BEHIND the wall for the entire shot. No fake reveal.
 *
 *   [z-10] HERO WALL — the beige studio wall with the arched doorway
 *          genuinely CUT OUT of it (built from strips + corner patches).
 *          Through the hole you always see the black environment.
 *
 *   [z-10, inside wall] DOOR LEAF — hinged at the doorway's left edge,
 *          swinging open to expose more of the black room behind it.
 *
 *   [z-20] HERO CHROME — header / wordmark / footer / hints.
 *
 *   [z-20, inside environment] ARCHIVE REVEAL — real content of the
 *          destination room, scaling up with the same camera transform.
 *
 * Timeline (single `camera` value, 0 → 1, driven only by scroll):
 *
 *   camera 0.00 – 0.45   door swings open; camera stands still outside
 *   camera 0.45 – 1.00   camera dollies forward, through the doorway,
 *                        into the Portfolio room
 * ------------------------------------------------------------------------- */

/** Door swing occupies this portion of the timeline. */
const DOOR_END = 0.45;
/** Camera begins its forward move while the last few degrees finish, so the
 *  hand-off feels like momentum, not two separate acts. */
const CAMERA_START = 0.4;

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/* Measured geometry of the wordmark stage, in viewport pixels. Every part of
 * the doorway (hole, shoulder patch, frame, leaf) is derived from ONE rect so
 * they are pixel-perfectly concentric and aligned with the wordmark at any
 * viewport size. */
type StageRect = {
  left: number;
  top: number;
  width: number;
  height: number;
  vw: number;
  vh: number;
};

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveredPill, setIsHoveredPill] = useState(false);

  const heroTrackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const [stage, setStage] = useState<StageRect | null>(null);

  // Measure the wordmark stage so the doorway can be built in exact pixels.
  // Runs pre-paint (layout effect) so the first painted frame is already
  // correct, and re-measures on resize.
  useIsoLayoutEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setStage({
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        vw: window.innerWidth,
        vh: window.innerHeight,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Smooth scroll listener with lerped interpolation — the ONE progress value
  // that drives the entire door + camera sequence. Stop scrolling anywhere and
  // the shot simply freezes at that exact cinematic moment.
  useEffect(() => {
    const handleScroll = () => {
      if (!heroTrackRef.current) return;
      const track = heroTrackRef.current;
      const totalScroll = track.offsetHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const progress = clamp01(window.scrollY / totalScroll);
      targetProgressRef.current = progress;
    };

    const updateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0005) {
        currentProgressRef.current += diff * 0.12;
        setScrollProgress(currentProgressRef.current);
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current;
        setScrollProgress(currentProgressRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateLoop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    animationFrameRef.current = requestAnimationFrame(updateLoop);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Smooth programmatic scroll down into archive
  const scrollToArchive = useCallback(() => {
    if (!heroTrackRef.current) return;
    const track = heroTrackRef.current;
    const targetY = track.offsetHeight - window.innerHeight + 10;
    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  }, []);

  // Smooth programmatic scroll back to hero
  const scrollToHero = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Subtle 3D mouse parallax on hero when at top
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scrollProgress > 0.2) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (contactDrawerOpen) {
          setContactDrawerOpen(false);
        } else if (scrollProgress > 0.8) {
          scrollToHero();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contactDrawerOpen, scrollProgress, scrollToHero]);

  /* -----------------------------------------------------------------------
   * THE ONE TIMELINE — every value below derives from `camera`.
   * --------------------------------------------------------------------- */
  const camera = scrollProgress;

  // ACT 1 · door swing (0 → DOOR_END): camera stands still, the leaf opens.
  // Capped just short of 90° so the leaf never reaches edge-on invisibility.
  const doorProgress = easeInOutCubic(clamp01(camera / DOOR_END));
  const doorAngle = doorProgress * 82; // degrees, left hinge, opening inward

  // ACT 2 · camera dolly (CAMERA_START → 1): one continuous forward walk.
  const pushRaw = clamp01((camera - CAMERA_START) / (1 - CAMERA_START));
  const push = easeInOutCubic(pushRaw);
  // Physical feel: the eased dolly walks the camera from the far side of the
  // room up to and THROUGH the doorway plane. Max scale 24× guarantees the
  // wall, frame AND the opened leaf all fully pass the lens — the camera
  // ends cleanly inside the room with nothing left at the frame edges.
  const cameraScale = 1 + push * 23;

  // Hero text drifts out of focus as the camera commits to the move.
  const textBlur = push * 14;
  const textOpacity = Math.max(0, 1 - clamp01(camera / 0.3));
  const uiChromeOpacity = Math.max(0, 1 - camera * 3.5);

  // The archive content lives in the same camera space — it scales with a
  // slower factor (it sits DEEPER than the wall plane) so the wall rushes
  // past while the room content approaches gently. No seam, no second act.
  const archiveRevealOpacity = clamp01((pushRaw - 0.12) / 0.4);
  const archiveContentScale = 1 + push * 0.9;

  // Dolly pivot = the doorway's true center, in % of the viewport (measured),
  // so the camera walks straight through the middle of the opening.
  const doorCx = stage ? ((stage.left + 0.4746 * stage.width + 0.05275 * stage.width) / stage.vw) * 100 : 53.5;
  const cameraOrigin = `${doorCx.toFixed(3)}% 50%`;

  return (
    <div className="relative w-full bg-black text-[#E0E0E0] selection:bg-white selection:text-black">
      {/* ===================================================================== */}
      {/* 1. SCROLL TRACK FOR THE CONTINUOUS CAMERA JOURNEY (300vh)             */}
      {/* ===================================================================== */}
      <section
        ref={heroTrackRef}
        className="relative w-full h-[300vh] bg-black"
        onMouseMove={handleHeroMouseMove}
      >
        {/* Sticky 100vh Viewport: pinned while the camera travels */}
        <div className="sticky top-0 h-screen w-full overflow-hidden studio-canvas select-none">
          {/* ================================================================ */}
          {/* LAYER z-0 · PORTFOLIO ENVIRONMENT                                */}
          {/* The real black room. It exists behind the wall from the very     */}
          {/* first frame — the doorway is just a hole in the wall above it.   */}
          {/* ================================================================ */}
          <div
            className="absolute inset-0 z-0 bg-black overflow-hidden"
            style={{ willChange: "transform" }}
          >
            {/* Same scene, deeper plane: the room content approaches much
                slower than the wall — depth parallax from one camera move. */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformOrigin: cameraOrigin }}
            >
              {/* Archive welcome content — the interior of the Portfolio */}
              <div
                className="flex flex-col items-center justify-center p-6 text-center"
                style={{
                  opacity: Math.min(archiveRevealOpacity * 1.2, 1),
                  transform: `scale(${archiveContentScale})`,
                  transformOrigin: "50% 50%",
                  willChange: "transform, opacity",
                }}
              >
                <span className="text-[10px] sm:text-xs font-mono tracking-[0.18em] sm:tracking-[0.3em] text-[#888888] uppercase block mb-3 max-w-full">
                  IMAGINE INTERIORS · ARCHITECTURAL ARCHIVE
                </span>
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight">
                  COMPANY WORKS
                </h2>
                <p className="mt-4 text-[#A0A0A0] text-sm sm:text-base font-light max-w-xl mx-auto">
                  Scroll to explore our realized architectural projects across
                  Bangladesh.
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono tracking-widest text-[#777777] uppercase">
                  <span>SCROLL DOWN</span>
                  <span className="animate-bounce">↓</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* LAYER z-10 · HERO WALL with the arched doorway cut out of it.    */}
          {/* Built from beige strips + 4 corner patches positioned from the   */}
          {/* doorway box — a genuine punched hole, not a painted background.  */}
          {/* The whole wall dollys with the SAME camera transform so the      */}
          {/* doorway physically rushes past the lens.                        */}
          {/* ================================================================ */}
          <div
            className="absolute inset-0 z-10 overflow-hidden"
            style={{
              transform: `scale(${cameraScale})`,
              transformOrigin: cameraOrigin,
              willChange: "transform",
              // Once the camera is essentially through, the wall fades so the
              // seam into the archive is clean even if the lerp lags.
              opacity: 1 - clamp01((pushRaw - 0.92) / 0.07),
            }}
          >
            <div className="relative w-full h-full">
              <WallWithDoorway
                stage={stage}
                doorAngle={doorAngle}
                isHoveredPill={isHoveredPill}
                onEnter={scrollToArchive}
                onHoverChange={setIsHoveredPill}
                cameraCommitted={pushRaw > 0.02}
              />
            </div>
          </div>

          {/* ================================================================ */}
          {/* LAYER z-20 · HERO CHROME (header, wordmark, footer)              */}
          {/* ================================================================ */}
          <div className="absolute inset-0 z-20 flex flex-col justify-between items-center pointer-events-none">
            {/* Subtle Studio Top Header */}
            <header
              className="relative z-30 w-full px-6 md:px-12 pt-6 md:pt-8 flex items-center justify-between text-[#55565A] pointer-events-auto"
              style={{
                opacity: uiChromeOpacity,
                transform: `translateY(${-camera * 40}px)`,
                pointerEvents: camera > 0.15 ? "none" : "auto",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#55565A]" />
                <span className="font-heading font-bold text-xs tracking-[0.25em] uppercase">
                  IMAGINE INTERIORS
                </span>
              </div>

              <div className="hidden md:flex items-center">
                <SiteNav variant="light" />
              </div>

              <button
                onClick={scrollToArchive}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#55565A]/30 text-xs font-body tracking-[0.16em] uppercase hover:bg-black hover:text-white hover:border-black transition-all duration-300 cursor-pointer"
              >
                <span>EXPLORE WORKS</span>
                <span className="text-[10px]">↘</span>
              </button>
            </header>

            {/* CENTER COMPOSITION: wordmark halves beside the door */}
            <div
              className="relative z-20 my-auto flex items-center justify-center w-full px-4 sm:px-6 pointer-events-none"
              style={{
                opacity: textOpacity,
                filter: `blur(${textBlur}px)`,
              }}
            >
              <div
                ref={stageRef}
                className="relative w-[94vw] max-w-[1150px] aspect-[1024/576] flex items-center justify-center"
                style={{
                  transform: `perspective(1200px) rotateX(${
                    -mousePos.y * 2.5 * (1 - camera)
                  }deg) rotateY(${mousePos.x * 2.5 * (1 - camera)}deg)`,
                  willChange: "transform",
                }}
              >
                {/* LEFT TEXT BLOCK: IMAG (top) and INTER (bottom) */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: "2.44%",
                    top: "23.44%",
                    width: "43.46%",
                    height: "46.01%",
                    transform: `translate3d(${-push * 45}%, 0, 0) scale(${1 + push * 1.4})`,
                    transformOrigin: "right center",
                    willChange: "transform",
                  }}
                >
                  <Image
                    src="/hero-text-left.png"
                    alt="IMAGINE INTERIORS - IMAG INTER"
                    fill
                    priority
                    sizes="(max-width: 1150px) 42vw, 500px"
                    className="object-contain object-left"
                  />
                </div>

                {/* RIGHT TEXT BLOCK: NE (top) and ORS (bottom) */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: "58.59%",
                    top: "23.44%",
                    width: "29.79%",
                    height: "46.01%",
                    transform: `translate3d(${push * 45}%, 0, 0) scale(${1 + push * 1.4})`,
                    transformOrigin: "left center",
                    willChange: "transform",
                  }}
                >
                  <Image
                    src="/hero-text-right.png"
                    alt="IMAGINE INTERIORS - NE ORS"
                    fill
                    priority
                    sizes="(max-width: 1150px) 29vw, 340px"
                    className="object-contain object-left"
                  />
                </div>
              </div>
            </div>

            {/* Studio Bottom Footer */}
            <footer
              className="relative z-30 w-full px-6 md:px-12 pb-6 md:pb-8 flex items-center justify-between text-[#7A7B7E] text-[11px] font-body tracking-[0.18em] uppercase pointer-events-auto"
              style={{
                opacity: uiChromeOpacity,
                transform: `translateY(${camera * 40}px)`,
                pointerEvents: camera > 0.15 ? "none" : "auto",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">SCROLL TO OPEN THE DOOR</span>
                <span className="text-[#333333] font-medium">INTO ARCHIVE</span>
                <svg
                  className="w-3.5 h-3.5 animate-bounce text-[#333333]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>

              <div className="hidden sm:flex items-center gap-4 text-[#888888]">
                <span>RESIDENTIAL</span>
                <span>·</span>
                <span>DUPLEX</span>
                <span>·</span>
                <span>PENTHOUSE</span>
              </div>

              <div className="flex items-center gap-2">
                <span>© 2026 IMAGINE INTERIORS</span>
              </div>
            </footer>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. PROJECT CARDS - ONE PER PROJECT (Navigate to /project/[id])        */}
      {/* ===================================================================== */}
      <main
        id="archive-section"
        className="relative z-30 w-full min-h-screen bg-black text-[#E0E0E0] pb-32"
      >
        {/* Arrival navigation bar — scrolls away as the map journey begins
            (the explorer carries its own chrome from here on). */}
        <header className="relative z-40 w-full bg-black px-4 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToHero}
              className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-all duration-300 text-xs tracking-[0.16em] uppercase font-semibold cursor-pointer"
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
              <span>BACK TO HERO</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 text-xs font-mono tracking-widest text-[#888888] pl-2">
              <span>/</span>
              <span>PROJECT ARCHIVE</span>
              <span>({REAL_PROJECTS.length} PROJECTS)</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
            <SiteNav variant="dark" />
          </div>

          {/* Commission Action Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setContactDrawerOpen(true)}
              className="px-5 py-2 rounded-full text-xs font-heading font-medium tracking-[0.2em] uppercase bg-white text-black hover:bg-[#E0E0E0] transition-colors shadow-lg cursor-pointer"
            >
              COMMISSION A SPACE
            </button>
          </div>
        </header>

        {/* =================================================================== */}
        {/* PROJECTS ACROSS PLACES — cinematic map exploration                    */}
        {/* =================================================================== */}
        <PortfolioExplorer projects={REAL_PROJECTS} />

        {/* Bottom Editorial Summary */}
        <section className="mt-28 max-w-6xl mx-auto px-6 text-center">
          <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-b from-[#151515] to-[#0B0B0B] border border-white/10">
            <span className="text-xs font-mono tracking-[0.25em] text-[#888888] uppercase block mb-3">
              {REAL_PROJECTS.length} VERIFIED ARCHITECTURAL COMMISSIONS
            </span>
            <h3 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
              SPATIAL EXPERTISE & CRAFTSMANSHIP
            </h3>
            <p className="mt-4 text-[#8E8E8E] text-sm sm:text-base max-w-2xl mx-auto font-light">
              From compact urban residences in Mirpur and Banani to sweeping
              double-height duplexes in Kushtia, we design with monolithic
              materials, natural illumination, and timeless proportions.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setContactDrawerOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-heading font-bold text-xs tracking-[0.22em] uppercase hover:bg-[#E0E0E0] transition-colors shadow-lg cursor-pointer"
              >
                START YOUR PROJECT BRIEF
              </button>
              <button
                onClick={scrollToHero}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-heading tracking-[0.22em] uppercase transition-colors cursor-pointer"
              >
                ← RETURN TO HERO
              </button>
            </div>
          </div>
        </section>

        {/* Archive Footer */}
        <footer className="mt-20 pt-8 border-t border-white/10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#666666] tracking-widest uppercase gap-4">
          <div>IMAGINE INTERIORS DESIGN PRACTICE © 2026</div>
          <div className="flex items-center gap-4 min-w-0 flex-wrap">
            <span>BANANI</span>
            <span>·</span>
            <span>UTTARA</span>
            <span>·</span>
            <span>MIRPUR</span>
            <span>·</span>
            <span>DHANMONDI</span>
            <span>·</span>
            <span>KUSHTIA</span>
          </div>
          <button
            onClick={scrollToHero}
            className="text-white hover:underline cursor-pointer"
          >
            RETURN TO TOP ↑
          </button>
        </footer>
      </main>

      {/* ===================================================================== */}
      {/* STUDIO INQUIRY / COMMISSION DRAWER                                    */}
      {/* ===================================================================== */}
      {contactDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-[#141414] border border-white/15 rounded-3xl p-6 sm:p-10 text-white shadow-2xl"
          >
            <button
              onClick={() => setContactDrawerOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              ✕
            </button>

            <span className="text-xs font-mono tracking-[0.25em] text-[#888888] uppercase block mb-2">
              COMMISSION INQUIRY
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold">
              Commission Imagine Interiors
            </h3>
            <p className="text-xs sm:text-sm text-[#888888] mt-2 mb-6">
              Share details regarding your apartment, duplex, or commercial
              project. Our principal team will contact you within 24 hours.
            </p>

            {isContactSubmitted ? (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto mb-3 text-lg">
                  ✓
                </div>
                <h4 className="font-heading font-bold text-lg text-white">
                  Inquiry Transmitted
                </h4>
                <p className="text-xs text-[#AAAAAA] mt-2">
                  Thank you for reaching out to Imagine Interiors. Our team will
                  review your spatial brief shortly.
                </p>
                <button
                  onClick={() => {
                    setIsContactSubmitted(false);
                    setContactDrawerOpen(false);
                  }}
                  className="mt-6 px-6 py-2 rounded-full bg-white text-black font-heading font-bold text-xs tracking-widest uppercase cursor-pointer"
                >
                  DONE
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsContactSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-[#888888] uppercase mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asfacuzzaman Sohel / Mrs. Sen"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-[#888888] uppercase mb-1">
                    Phone / Email Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="01712 664168 / client@mail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#888888] uppercase mb-1">
                      Typology
                    </label>
                    <select className="w-full px-3 py-2.5 rounded-xl bg-[#222222] border border-white/10 text-sm text-white focus:outline-none focus:border-white/40">
                      <option>Duplex Interior Design</option>
                      <option>Luxury Apartment / Residence</option>
                      <option>Penthouse Living</option>
                      <option>Commercial Space</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#888888] uppercase mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Banani, Uttara, Kushtia"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-[#888888] uppercase mb-1">
                    Spatial Scope & Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your space, square footage, and timeline..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-white text-black font-heading font-bold text-xs tracking-[0.2em] uppercase hover:bg-[#E0E0E0] transition-colors mt-2 cursor-pointer"
                >
                  TRANSMIT COMMISSION BRIEF
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===========================================================================
 * WALL WITH DOORWAY
 * The beige hero wall with a genuine arched hole where the door sits.
 *
 * ALL geometry is derived from the MEASURED stage rect (the same box the
 * wordmark sits in), in exact viewport pixels. Hole, shoulder patch, frame,
 * leaf and window all share one coordinate system and one set of radii, so
 * they are pixel-perfectly concentric and aligned with the wordmark at any
 * viewport size — no overlap, no drift.
 * ========================================================================= */
function WallWithDoorway({
  stage,
  doorAngle,
  isHoveredPill,
  onEnter,
  onHoverChange,
  cameraCommitted,
}: {
  stage: StageRect | null;
  doorAngle: number;
  isHoveredPill: boolean;
  onEnter: () => void;
  onHoverChange: (v: boolean) => void;
  cameraCommitted: boolean;
}) {
  if (!stage) return null;

  /* Doorway slot in the ORIGINAL stage coordinates (matches the composition
   * the wordmark PNGs were designed against). */
  const SLOT = { left: 0.4746, top: 0.2483, width: 0.1055, height: 0.434 };

  /* Doorway box in viewport pixels, from the measured stage. */
  const D = {
    left: stage.left + SLOT.left * stage.width,
    top: stage.top + SLOT.top * stage.height,
    width: SLOT.width * stage.width,
    height: SLOT.height * stage.height,
  };

  const F = 5; // frame inflation around the hole, in px
  const EXT = 26; // wall-side extension of the shoulder patch, in px

  /* Arch radii in px — shared by leaf, frame and shoulder cutout so every
   * curve is exactly parallel/concentric. */
  const rx = D.width / 2; // px
  const ry = 0.215 * D.height; // px

  const leafRadius = `${rx}px ${rx}px 6px 6px / ${ry}px ${ry}px 6px 6px`;
  const frameRadius = `${rx + F}px ${rx + F}px 6px 6px / ${ry + F}px ${ry + F}px 6px 6px`;

  const stripStyle = () =>
    ({
      position: "absolute" as const,
      background: "#f1f1f1",
    }) as const;

  return (
    <>
      {/* ---- wall plates around the doorway (the hole is what's missing) -- */}
      {/* Plates OVERLAP by a few px instead of meeting edge-to-edge: during   */}
      {/* the camera's continuous scale transform, subpixel rounding can open  */}
      {/* hairline gaps at exact junctions, flashing the black room behind as  */}
      {/* thin vertical lines at the jambs. Same color, so overlaps are        */}
      {/* invisible; the 3px poke into the hole tucks under the frame lining   */}
      {/* and the closed leaf.                                                 */}
      <div
        style={{
          ...stripStyle(),
          left: 0,
          top: 0,
          width: D.left + 3,
          height: "100%",
        }}
      />
      <div
        style={{
          ...stripStyle(),
          left: D.left + D.width - 3,
          top: 0,
          right: 0,
          height: "100%",
        }}
      />
      <div
        style={{
          ...stripStyle(),
          left: D.left - 2,
          top: 0,
          width: D.width + 4,
          height: D.top,
        }}
      />
      <div
        style={{
          ...stripStyle(),
          left: D.left - 2,
          top: D.top + D.height - 3,
          width: D.width + 4,
          height: `calc(100% - ${D.top + D.height - 3}px)`,
        }}
      />

      {/* ---- arch shoulder patch: the wall around the arch head. Its      */}
      {/* transparent elliptical cutout uses the SAME px radii and the SAME */}
      {/* center as the leaf's arch — pixel-perfect coincidence, no seam.   */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: D.left - EXT,
          top: D.top - EXT,
          width: D.width + EXT * 2,
          height: ry + EXT,
          background: `radial-gradient(${rx}px ${ry}px at ${rx + EXT}px ${
            ry + EXT
          }px, rgba(241,241,241,0) 99%, #f1f1f1 100%)`,
        }}
      />

      {/* ---- arch frame reveal (jamb lining around the hole) -------------- */}
      {/* Inflated by F px on every side with radii inflated by F px too —   */}
      {/* exactly concentric with the leaf, so the curves never cross.       */}
      <div
        className="pointer-events-none"
        style={{
          position: "absolute",
          left: D.left - F,
          top: D.top - F,
          width: D.width + F * 2,
          height: D.height + F * 2,
          borderRadius: frameRadius,
          boxShadow:
            "inset 0 0 0 2px rgba(120,98,70,0.45), inset 0 0 0 7px rgba(219,203,181,0.9), inset 0 0 0 8px rgba(97,78,55,0.35)",
        }}
      />

      {/* ---- DOOR LEAF — hinged at the LEFT edge of the hole --------------- */}
      {/* Swings open INTO the room: rotateY around its left edge, so the     */}
      {/* opening grows and the black environment is progressively revealed.  */}
      <div
        onClick={onEnter}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => onHoverChange(false)}
        role="button"
        tabIndex={0}
        aria-label="Click or scroll to open the door and enter the works archive"
        className="absolute cursor-pointer group outline-none"
        style={{
          left: D.left,
          top: D.top,
          width: D.width,
          height: D.height,
          perspective: "1400px",
        }}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `rotateY(${doorAngle}deg)`,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
            willChange: "transform",
            filter: "drop-shadow(0 10px 16px rgba(70,52,30,0.3))",
          }}
        >
          {/* leaf face — beige panel with backlit fluted arch */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              borderRadius: leafRadius,
              background:
                "linear-gradient(115deg, #D9C9B3 0%, #CBB9A1 45%, #BCA98F 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -10px 20px rgba(97,78,55,0.28)",
            }}
          >
            {/* subtle wood-grain sheen on the leaf */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 3px, rgba(120,95,65,0.05) 3px 6px)",
              }}
            />
            {/* recessed panel outlines, like the reference wall */}
            <div className="absolute left-[6%] right-[6%] bottom-[3%] h-[16%] rounded-[4px] border border-white/25 shadow-[inset_0_2px_6px_rgba(97,78,55,0.18)] pointer-events-none" />
          </div>
        </div>

        {/* Interactive hover prompt (only while closed & camera outside) */}
        <div
          className={`absolute inset-0 flex items-center justify-center p-2 text-center transition-all duration-300 pointer-events-none ${
            isHoveredPill && !cameraCommitted && doorAngle < 8
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          }`}
        >
          <span className="text-[8px] sm:text-[9px] font-heading font-bold tracking-[0.2em] text-[#5F4B32] uppercase bg-white/75 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-md">
            ENTER
            <br />
            ARCHIVE
          </span>
        </div>

        {!isHoveredPill && !cameraCommitted && doorAngle < 8 && (
          <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center opacity-70 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B98A3C] animate-portal-pulse" />
          </div>
        )}
      </div>
    </>
  );
}
