"""Inject BLOG_POSTS snippet into src/data/siteData.ts at the marker."""
import re

snippet = open(".tmp-scratch/blog_data_snippet.txt", encoding="utf-8").read().strip()
snippet = snippet.replace(
    "export const BLOG_POSTS: BlogPost[] = [",
    "export const BLOG_POSTS: BlogPost[] = [",
)

path = "src/data/siteData.ts"
ts = open(path, encoding="utf-8").read()

# add body to the interface
ts = ts.replace(
    "  excerpt: string;\n}",
    "  excerpt: string;\n  body: BlogBodyBlock[];\n}",
)

assert "// __BLOG_POSTS__" in ts, "marker missing"
ts = ts.replace("// __BLOG_POSTS__", snippet)

open(path, "w", encoding="utf-8", newline="\n").write(ts)
print("injected", ts.count("slug:"), "posts")
