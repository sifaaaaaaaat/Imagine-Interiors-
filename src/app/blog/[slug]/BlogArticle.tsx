"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import SiteNav from "@/components/SiteNav";
import { BLOG_POSTS } from "@/data/siteData";

export default function BlogArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const others = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col">
        <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10 px-5 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-white font-heading font-bold text-xs tracking-[0.25em] uppercase"
          >
            <span className="w-2 h-2 rounded-full bg-white" />
            IMAGINE INTERIORS
          </Link>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-3xl font-heading font-extrabold text-white">
            Article not found
          </h1>
          <Link
            href="/blog"
            className="mt-6 px-6 py-3 rounded-full bg-white text-black font-heading font-bold text-xs tracking-widest uppercase"
          >
            BACK TO BLOG
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] selection:bg-white selection:text-black">
      <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10 px-5 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-white font-heading font-bold text-xs tracking-[0.25em] uppercase"
        >          <span className="w-2 h-2 rounded-full bg-white" />
            IMAGINE INTERIORS
          </Link>
        <SiteNav variant="dark" />
      </header>

      <article>
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-10">
          <Link
            href="/blog"
            className="text-xs font-mono tracking-widest text-[#888888] hover:text-white uppercase transition-colors"
          >
            ← BACK TO BLOG
          </Link>

          <div className="mt-8 flex items-center gap-3 text-[11px] font-mono tracking-widest text-[#888888] uppercase">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white">
              {post.category}
            </span>
            <span>{post.date}</span>
          </div>

          <h1 className="mt-5 text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight leading-[1.08]">
            {post.title}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#999999] font-light leading-relaxed">
            {post.excerpt.replace(/\.\.\.$/, "")}
          </p>
        </section>

        {/* Hero image */}
        <section className="max-w-5xl mx-auto px-6">
          <div className="relative w-full aspect-[16/9] rounded-[24px] overflow-hidden border border-white/10">
            <Image
              src={post.hero}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </section>

        {/* Body */}
        <section className="max-w-3xl mx-auto px-6 pt-12 pb-8">
          {post.body.map((block, i) => {
            if (block.t === "H2") {
              return (
                <h2
                  key={i}
                  className="mt-12 mb-4 text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.t === "H3" || block.t === "H4") {
              return (
                <h3
                  key={i}
                  className="mt-8 mb-3 text-lg sm:text-xl font-heading font-bold text-[#F0F0F0]"
                >
                  {block.text}
                </h3>
              );
            }
            if (block.t === "LI") {
              return (
                <p
                  key={i}
                  className="mb-2 pl-4 text-[15px] text-[#BBBBBB] font-light leading-relaxed border-l border-white/15"
                >
                  {block.text}
                </p>
              );
            }
            return (
              <p
                key={i}
                className="mb-5 text-[15px] sm:text-base text-[#BBBBBB] font-light leading-[1.85]"
              >
                {block.text}
              </p>
            );
          })}
        </section>

        {/* Source link */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 text-center">
            <p className="text-xs text-[#777777] font-light">
              This article was originally published on our studio journal.
            </p>
            <a
              href={post.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs font-mono tracking-widest text-white uppercase hover:underline"
            >
              VIEW ORIGINAL ARTICLE ↗
            </a>
          </div>
        </section>

        {/* More posts */}
        <section className="max-w-6xl mx-auto px-6 pb-10">
          <span className="text-xs font-mono tracking-[0.3em] text-[#777777] uppercase block mb-6">
            MORE FROM THE JOURNAL
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {others.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-[20px] overflow-hidden bg-[#141414] border border-white/10 hover:border-white/25 transition-colors"
              >
                <div className="relative w-full aspect-[16/10]">
                  <Image
                    src={p.thumb}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-[1.05] transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-mono tracking-widest text-[#777777] uppercase">
                    {p.category} · {p.date}
                  </span>
                  <h3 className="mt-2 text-sm font-heading font-bold text-white leading-snug">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
