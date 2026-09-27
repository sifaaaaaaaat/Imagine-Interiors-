import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { ABOUT, CONTACT_INFO, STATS } from "@/data/siteData";

export const metadata: Metadata = {
  title: "About — Imagine Interiors",
  description:
    "Imagine Interiors is an internationally recognized interior and exterior design firm in Bangladesh with expertise in residential, commercial, hospitality, retail, healthcare and beauty projects.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] selection:bg-white selection:text-black">
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10 px-5 sm:px-8 lg:px-12 py-4 flex flex-wrap items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-white font-heading font-bold text-xs tracking-[0.25em] uppercase"
        >
          <span className="w-2 h-2 rounded-full bg-white" />
          IMAGINE INTERIORS
        </Link>
        <SiteNav variant="dark" />
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 pt-20 pb-14 text-center">
          <span className="text-xs font-mono tracking-[0.3em] text-[#777777] uppercase block mb-4">
            ABOUT THE STUDIO
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.02]">
            Creating beautiful
            <br />
            interiors in Bangladesh
          </h1>
          <p className="mt-8 text-[#999999] text-base sm:text-lg font-light max-w-2xl mx-auto leading-relaxed">
            {ABOUT.intro}
          </p>
          <div className="mt-10 flex items-center justify-center gap-6 text-[11px] font-mono tracking-widest text-[#666666] uppercase">
            <span>SINCE {STATS.since}</span>
            <span>·</span>
            <span>{STATS.customers} CLIENTS</span>
            <span>·</span>
            <span>{STATS.projects} FEATURED PROJECTS</span>
          </div>
        </section>

        {/* Turnkey + Imagine Way */}
        <section className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.03] border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              {ABOUT.turnkeyTitle}
            </h2>
            <p className="mt-5 text-sm text-[#999999] font-light leading-relaxed">
              {ABOUT.turnkey}
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.03] border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              {ABOUT.theWayTitle}
            </h2>
            <p className="mt-5 text-sm text-[#999999] font-light leading-relaxed">
              {ABOUT.theWayIntro}
            </p>
            <ul className="mt-5 space-y-2">
              {ABOUT.theWaySteps.map((step) => (
                <li
                  key={step}
                  className="flex items-start gap-3 text-sm text-[#CCCCCC] font-light"
                >
                  <span className="text-white mt-0.5">✓</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Philosophy */}
        <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            {ABOUT.philosophyTitle}
          </h2>
          <div className="mt-8 space-y-4">
            {ABOUT.philosophy.map((line) => (
              <p
                key={line}
                className="text-[#AAAAAA] text-base font-light leading-relaxed"
              >
                {line}
              </p>
            ))}
          </div>
        </section>

        {/* Design styles */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <span className="text-xs font-mono tracking-[0.3em] text-[#777777] uppercase block mb-3 text-center">
            DESIGN STYLES WE FOLLOW
          </span>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ABOUT.styles.map((style) => (
              <div
                key={style.name}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/25 transition-colors duration-300"
              >
                <h3 className="text-sm font-heading font-bold text-white tracking-wide">
                  {style.name}
                </h3>
                <p className="mt-2 text-xs text-[#888888] font-light leading-relaxed">
                  {style.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <span className="text-xs font-mono tracking-[0.3em] text-[#777777] uppercase block mb-3 text-center">
            OUR DESIGN SERVICES
          </span>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {ABOUT.services.map((s) => (
              <span
                key={s}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono tracking-widest text-[#BBBBBB] uppercase"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Why choose */}
        <section className="max-w-6xl mx-auto px-6 pb-4">
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight text-center">
            Why Choose Imagine Interiors?
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            {ABOUT.whyChoose.map((w) => (
              <div
                key={w.title}
                className="p-7 rounded-3xl bg-gradient-to-b from-[#161616] to-[#0D0D0D] border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white mb-4">
                  ✓
                </div>
                <h3 className="font-heading font-bold text-white">
                  {w.title}
                </h3>
                <p className="mt-2 text-xs text-[#888888] font-light leading-relaxed">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 pt-16 text-center">
          <div className="p-10 rounded-[32px] bg-gradient-to-b from-[#151515] to-[#0B0B0B] border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Will the next one be yours?
            </h2>
            <p className="mt-3 text-sm text-[#888888] font-light">
              {CONTACT_INFO.phones[0]} · {CONTACT_INFO.email}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block px-8 py-3.5 rounded-full bg-white text-black font-heading font-bold text-xs tracking-[0.22em] uppercase hover:bg-[#E0E0E0] transition-colors"
            >
              BOOK CONSULTATION
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
