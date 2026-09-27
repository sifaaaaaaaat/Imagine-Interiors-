"use client";

import React, { useState } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { CONTACT_INFO } from "@/data/siteData";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

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
              <a
                href={CONTACT_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open our office location in Google Maps"
                title="Open in Google Maps"
                className="group flex items-start gap-2 text-sm text-[#BBBBBB] font-light leading-relaxed hover:text-white transition-colors"
              >
                <span>{CONTACT_INFO.office}</span>
                <svg
                  className="shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </a>
            </div>
            <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#777777] uppercase block mb-4">
                FOLLOW US
              </span>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    {
                      name: "Facebook",
                      href: CONTACT_INFO.socials.facebook,
                      path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                    },
                    {
                      name: "LinkedIn",
                      href: CONTACT_INFO.socials.linkedin,
                      path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
                    },
                    {
                      name: "Instagram",
                      href: CONTACT_INFO.socials.instagram,
                      path: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
                    },
                    {
                      name: "YouTube",
                      href: CONTACT_INFO.socials.youtube,
                      path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
                    },
                  ] as const
                ).map(({ name, href, path }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Imagine Interiors on ${name}`}
                    title={name}
                    className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-[#CCCCCC] hover:bg-white hover:text-black hover:border-white transition-colors"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
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
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (sending) return;
                    const fd = new FormData(e.currentTarget);
                    setSending(true);
                    setSendError("");
                    try {
                      const res = await fetch("/api/inquiries", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          name: fd.get("name"),
                          contact: fd.get("contact"),
                          typology: fd.get("typology"),
                          location: fd.get("location"),
                          message: fd.get("message"),
                          company: fd.get("company"),
                          source: "contact-page",
                        }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok || !data.ok) {
                        setSendError(
                          data.error ??
                            "Could not send right now — please call or WhatsApp us instead."
                        );
                        return;
                      }
                      setSubmitted(true);
                    } catch {
                      setSendError(
                        "Network error — please call or WhatsApp us instead."
                      );
                    } finally {
                      setSending(false);
                    }
                  }}
                  className="space-y-4"
                >
                  {/* Honeypot — hidden from humans, catches spam bots. */}
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest text-[#888888] uppercase mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
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
                      name="contact"
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
                      <select
                      name="typology"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#222222] border border-white/10 text-sm text-white focus:outline-none focus:border-white/40"
                    >
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
                      name="location"
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
                      name="message"
                      rows={4}
                      required
                      placeholder="Describe your space, square footage, and timeline..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/40 resize-none"
                    />
                  </div>

                  {sendError && (
                    <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-3 py-2">
                      {sendError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3.5 rounded-xl bg-white text-black font-heading font-bold text-xs tracking-[0.2em] uppercase hover:bg-[#E0E0E0] transition-colors mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? "SENDING…" : "SEND INQUIRY"}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>

        {/* Office location — interactive Google Maps embed of the official */}
        {/* “Imagine Interiors - Dhaka” listing.                              */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="rounded-3xl overflow-hidden border border-white/10">
            <iframe
              src={CONTACT_INFO.mapsEmbed}
              title="Imagine Interiors office on Google Maps — SEL Rose-N-Dale, Banglamotor, Dhaka"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[320px] sm:h-[400px] block border-0 grayscale invert-[0.92] contrast-[0.88] hover:grayscale-0 hover:invert-0 hover:contrast-100 transition-all duration-500"
            />
          </div>
          <p className="mt-4 text-[10px] font-mono tracking-[0.25em] text-[#777777] uppercase text-center">
            Find us at Banglamotor, Dhaka
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
