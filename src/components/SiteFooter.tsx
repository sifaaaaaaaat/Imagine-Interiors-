import Link from "next/link";
import { CONTACT_INFO } from "@/data/siteData";

export default function SiteFooter() {
  return (
    <footer className="mt-24 pt-10 pb-14 border-t border-white/10 max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] font-mono text-[#666666] tracking-widest uppercase">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-white/40" />
        <span>IMAGINE INTERIORS © 2026</span>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <a
          href={`mailto:${CONTACT_INFO.email}`}
          className="hover:text-white transition-colors"
        >
          {CONTACT_INFO.email}
        </a>
        <span className="text-[#444444]">{CONTACT_INFO.phones.join(" · ")}</span>
      </div>

      <nav className="flex items-center gap-5">
        <Link href="/about" className="hover:text-white transition-colors">
          ABOUT
        </Link>
        <Link
          href="/testimonials"
          className="hover:text-white transition-colors"
        >
          TESTIMONIALS
        </Link>
        <Link href="/contact" className="hover:text-white transition-colors">
          CONTACT
        </Link>
        <Link href="/blog" className="hover:text-white transition-colors">
          BLOG
        </Link>
      </nav>
    </footer>
  );
}
