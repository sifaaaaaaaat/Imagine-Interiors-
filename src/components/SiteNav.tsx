"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/testimonials", label: "TESTIMONIALS" },
  { href: "/contact", label: "CONTACT" },
  { href: "/blog", label: "BLOG" },
];

export default function SiteNav({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  return (
    <nav
      className={`flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] font-body tracking-[0.18em] uppercase ${
        isDark ? "text-[#7A7B7E]" : "text-[#55565A]"
      }`}
    >
      {NAV_LINKS.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-2.5 sm:px-3 py-1.5 rounded-full border transition-all duration-300 ${
              active
                ? isDark
                  ? "bg-white text-black border-white"
                  : "bg-black text-white border-black"
                : isDark
                  ? "border-white/15 hover:bg-white hover:text-black hover:border-white"
                  : "border-[#55565A]/25 hover:bg-black hover:text-white hover:border-black"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
