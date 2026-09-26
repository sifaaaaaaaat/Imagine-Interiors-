"use client";

import React, { useState } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { CONTACT_INFO } from "@/data/siteData";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] selection:bg-white selection:text-black">
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10 px-5 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
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
            GET IN TOUCH
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.02]">
            Want to discuss a
            <br />
            design project?
          </h1>
          <p className="mt-8 text-[#999999] text-base sm:text-lg font-light max-w-2xl mx-auto leading-relaxed">
            We&rsquo;ll be happy to sit with you and help you translate your
            design dream into reality!
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact details */}
          <div className="space-y-5">
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#777777] uppercase block mb-4">
                EMAIL
              </span>
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="text-lg sm:text-xl text-white font-light hover:text-[#CCCCCC] transition-colors break-all"
              >
                ✉️ {CONTACT_INFO.email}
              </a>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#777777] uppercase block mb-4">
                PHONE
              </span>
              <div className="space-y-2">
                {CONTACT_INFO.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="block text-lg sm:text-xl text-white font-light hover:text-[#CCCCCC] transition-colors"
                  >
                    📲 {phone}
                  </a>
                ))}
                <a
                  href={`https://wa.me/${CONTACT_INFO.phones[0].replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-[11px] font-mono tracking-widest uppercase text-white hover:bg-white hover:text-black transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.8-5c-.4-.7-.9-1.6-.9-2.5s.5-1.4.7-1.6c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.4-.1.7a9.6 9.6 0 0 0 4.4 3.8c.3.1.5.1.7-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.4s0 .7-.2 1.1Z" />
                  </svg>
                  WHATSAPP US
                </a>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#777777] uppercase block mb-4">
                OFFICE
              </span>
              <p className="text-sm text-[#BBBBBB] font-light leading-relaxed">
                {CONTACT_INFO.office}
              </p>
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#777777] uppercase block mb-4 mt-8">
                FACTORY
              </span>
              <p className="text-sm text-[#BBBBBB] font-light leading-relaxed">
                {CONTACT_INFO.factory}
              </p>
            </div>
          </div>

          {/* Inquiry form */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#141414] border border-white/15 h-fit">
            {submitted ? (
              <div className="p-8 text-center bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto mb-3 text-lg">
                  ✓
                </div>
                <h3 className="font-heading font-bold text-lg text-white">
                  Inquiry Transmitted
                </h3>
                <p className="text-xs text-[#AAAAAA] mt-2">
                  Thank you for reaching out to Imagine Interiors. Our team will
                  review your spatial brief shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2 rounded-full bg-white text-black font-heading font-bold text-xs tracking-widest uppercase cursor-pointer"
                >
                  SEND ANOTHER
                </button>
              </div>
            ) : (
              <>
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#777777] uppercase block mb-2">
                  PROJECT INQUIRY
                </span>
                <h2 className="text-2xl font-heading font-bold text-white">
                  Tell us about your project
                </h2>
                <p className="text-xs text-[#888888] mt-2 mb-6">
                  Information about your project helps us prepare for the
                  meeting so we can have a productive discussion.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
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
                      placeholder="e.g. Mrs. Sen / Mr. Fahad"
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
                        <option>Apartment / Residence</option>
                        <option>Duplex Interior Design</option>
                        <option>Office Space</option>
                        <option>Restaurant / Hotel</option>
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
                      Spatial Scope &amp; Requirements
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your space, square footage, and timeline..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/40 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-white text-black font-heading font-bold text-xs tracking-[0.2em] uppercase hover:bg-[#E0E0E0] transition-colors mt-2 cursor-pointer"
                  >
                    SEND INQUIRY
                  </button>
                </form>
              </>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
