import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { TESTIMONIALS, STATS, BRAND_LOGOS } from "@/data/siteData";

export const metadata: Metadata = {
  title: "Testimonials — Imagine Interiors",
  description:
    "From home to office and restaurant interiors, we've transformed spaces for happy clients across Dhaka and beyond.",
};

export default function TestimonialsPage() {
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
            CLIENT VOICES
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.02]">
            Our Happy
            <br />
            Customers
          </h1>
          <p className="mt-8 text-[#999999] text-base sm:text-lg font-light max-w-2xl mx-auto leading-relaxed">
            What just a few of our more than {STATS.customers} satisfied
            customers from all over Bangladesh have to say about us.
          </p>
        </section>

        {/* Testimonial cards */}
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                className={`p-8 sm:p-10 rounded-[28px] bg-gradient-to-b from-[#161616] to-[#0C0C0C] border border-white/10 flex flex-col ${
                  i % 2 === 1 ? "md:translate-y-6" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono tracking-[0.25em] text-white uppercase font-semibold">
                    {t.tag}
                  </span>
                  <div className="flex gap-1 text-white/70 text-xs">
                    {"★★★★★".split("").map((s, j) => (
                      <span key={j}>{s}</span>
                    ))}
                  </div>
                </div>

                <span className="text-5xl font-heading font-black text-white/10 leading-none block mb-2">
                  &ldquo;
                </span>

                <div className="space-y-3 -mt-4">
                  {t.text.map((para) => (
                    <p
                      key={para.slice(0, 24)}
                      className="text-sm sm:text-[15px] text-[#CCCCCC] font-light italic leading-relaxed"
                    >
                      {para}
                    </p>
                  ))}
                </div>

                <div className="mt-auto pt-7">
                  <div className="border-t border-white/8 pt-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white text-xs font-heading font-bold">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <span className="text-xs font-mono tracking-widest text-[#888888] uppercase">
                      {t.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trusted brands logo wall */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-4">
          <div className="text-center mb-10">
            <span className="text-xs font-mono tracking-[0.3em] text-[#777777] uppercase block mb-3">
              TRUSTED BY THE BEST BRANDS
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              500+ Clients Across Bangladesh
            </h2>
          </div>

          <div className="p-8 sm:p-10 rounded-[32px] bg-[#F5F5F5] border border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8 items-center">
              {BRAND_LOGOS.map((logo) => (
                <div
                  key={logo.file}
                  className="flex items-center justify-center h-16 sm:h-20 px-3"
                >
                  <Image
                    src={logo.file}
                    alt={logo.name}
                    width={140}
                    height={64}
                    className="max-h-full w-auto object-contain opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 pt-16 text-center">
          <div className="p-10 rounded-[32px] bg-gradient-to-b from-[#151515] to-[#0B0B0B] border border-white/10">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
              Ready to design your space?
            </h2>
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
