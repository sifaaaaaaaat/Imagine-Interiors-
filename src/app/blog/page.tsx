import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { BLOG_POSTS } from "@/data/siteData";

export const metadata: Metadata = {
  title: "Blog — Imagine Interiors",
  description:
    "Tips and insights on interior design in Bangladesh: apartment costs, duplex guides, office design, kitchen flooring, and more from our Dhaka studio.",
};

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

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
            JOURNAL &amp; INSIGHTS
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-extrabold text-white tracking-tight leading-[1.02]">
            Blog
          </h1>
          <p className="mt-8 text-[#999999] text-base sm:text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Our top tips on interior design in Bangladesh — designing on a
            budget, creating beautiful living rooms and offices, and more.
          </p>
        </section>

        {/* Featured post */}
        <section className="max-w-6xl mx-auto px-6 pb-8">
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[28px] overflow-hidden border border-white/10 bg-[#141414] hover:border-white/25 transition-colors"
          >
            <div className="relative min-h-[260px] lg:min-h-[360px]">
              <Image
                src={featured.hero}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
              />
            </div>
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-[10px] font-mono tracking-widest text-[#777777] uppercase">
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white">
                  LATEST
                </span>
                <span>{featured.category}</span>
                <span>·</span>
                <span>{featured.date}</span>
              </div>
              <h2 className="mt-4 text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight leading-tight group-hover:text-[#DDDDDD] transition-colors">
                {featured.title}
              </h2>
              <p className="mt-4 text-sm text-[#999999] font-light leading-relaxed">
                {featured.excerpt}
              </p>
              <span className="mt-6 text-xs font-mono tracking-widest text-white uppercase flex items-center gap-2">
                READ ARTICLE
                <span className="transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </span>
            </div>
          </Link>
        </section>

        {/* Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-[24px] overflow-hidden bg-[#141414] border border-white/10 hover:border-white/25 transition-all duration-500"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.thumb}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-[1.06] transition-transform duration-700"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#777777] uppercase">
                    <span>{post.category}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="mt-3 text-base font-heading font-bold text-white leading-snug group-hover:text-[#DDDDDD] transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#888888] font-light leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="mt-auto pt-5 text-[10px] font-mono tracking-widest text-white/80 uppercase flex items-center gap-2">
                    READ
                    <span className="transform group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
