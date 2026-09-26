import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <span className="text-xs font-mono tracking-[0.35em] text-yellow-400 uppercase">
          404 — LOST IN THE ARCHIVE
        </span>
        <h1 className="mt-6 text-4xl sm:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.05]">
          This page doesn&rsquo;t exist
        </h1>
        <p className="mt-6 max-w-md text-sm text-[#999999] font-light leading-relaxed">
          The page you are looking for may have been moved, renamed, or never
          existed. Explore our work or head back home.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-white text-black font-heading font-bold text-xs tracking-widest uppercase hover:bg-[#E0E0E0] transition-colors"
          >
            BACK TO HOME
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full border border-white/20 text-white font-heading font-bold text-xs tracking-widest uppercase hover:bg-white/10 transition-colors"
          >
            CONTACT US
          </Link>
        </div>
      </main>
    </div>
  );
}
