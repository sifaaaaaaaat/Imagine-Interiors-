"""Emit TS snippets for BLOG_POSTS (incl. article bodies) from scraped JSON."""
import json

posts = json.load(open(".tmp-scratch/blog_posts.json", encoding="utf-8"))

def clean(s):
    # escape backslashes, normalize curly punctuation, then escape quotes
    s = s.replace("\\", "\\\\")
    for a, b in (("\u2019", "'"), ("\u2018", "'"),
                 ("\u201c", '"'), ("\u201d", '"'),
                 ("\u2014", "-"), ("\u2013", "-"),
                 ("\ufffd", "'")):
        s = s.replace(a, b)
    s = s.replace('"', '\\"')
    s = re.sub(r"\s+", " ", s)
    return s

import re  # noqa: E402

lines = ["export const BLOG_POSTS: BlogPost[] = ["]
for p in posts:
    lines.append("  {")
    lines.append('    slug: "%s",' % p["slug"])
    lines.append('    title: "%s",' % clean(p["title"]))
    lines.append('    date: "%s",' % p["date"])
    lines.append('    category: "%s",' % clean(p["category"]))
    lines.append('    thumb: "%s",' % p["thumbLocal"])
    lines.append('    hero: "%s",' % p["fullLocal"])
    lines.append('    originalUrl: "%s",' % p["url"])
    lines.append('    excerpt: "%s",' % clean(p["excerpt"]))
    lines.append('    body: [')
    for b in p.get("paragraphs", []):
        t = clean(b["text"])
        if len(t) > 400:
            # split very long paragraphs on sentence boundaries near the limit
            parts = []
            rest = t
            while len(rest) > 400:
                cut = rest.rfind(". ", 250, 400)
                if cut == -1:
                    cut = 380
                parts.append(rest[: cut + 1])
                rest = rest[cut + 1:].lstrip()
            parts.append(rest)
            for part in parts:
                lines.append('      { t: "%s", text: "%s" },' % (b["t"], part))
        else:
            lines.append('      { t: "%s", text: "%s" },' % (b["t"], t))
    lines.append("    ],")
    lines.append("  },")
lines.append("];")

open(".tmp-scratch/blog_data_snippet.txt", "w", encoding="utf-8").write("\n".join(lines))
print("wrote", len(posts), "posts,", sum(len(p.get('paragraphs', [])) for p in posts), "body blocks")
