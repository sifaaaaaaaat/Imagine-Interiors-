"""Fetch full article text for each blog post and store paragraphs."""
import json
import re
import html as H
import time
import urllib.request

posts = json.load(open(".tmp-scratch/blog_posts.json", encoding="utf-8"))
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0"}

for p in posts:
    try:
        req = urllib.request.Request(p["url"], headers=HEADERS)
        with urllib.request.urlopen(req, timeout=45) as r:
            h = r.read().decode("utf-8", errors="ignore")

        # main article body lives in <div class="entry-content">
        m = re.search(r'<div class="entry-content">(.*?)<footer', h, re.S)
        body = m.group(1) if m else ""
        if not body:
            i = h.find('<div class="entry-content">')
            body = h[i:i + 120000] if i > -1 else ""

        # strip scripts/styles then paragraphs, headings, and list items in order
        body = re.sub(r"<script.*?</script>|<style.*?</style>", "", body, flags=re.S)
        chunks = re.findall(r"<(h2|h3|h4|p|li)[^>]*>(.*?)</\1>", body, re.S)
        paras = []
        for tag, c in chunks:
            txt = re.sub(r"\s+", " ", H.unescape(re.sub(r"<[^>]+>", " ", c))).strip()
            txt = txt.replace("\u2019", "'").replace("\ufffd", "'").replace("\u2013", "-").replace("\u2014", "-")
            if len(txt) < 3:
                continue
            if re.match(r"^(share|related post|leave a reply|tags?|like this)", txt, re.I):
                continue
            prefix = "• " if tag == "li" else ""
            paras.append({"t": tag.upper() if tag != "li" else "LI", "text": prefix + txt})
        # trim trailing call-to-action boilerplate
        while paras and re.search(r"01712|book consultation|ready to design", paras[-1]["text"], re.I):
            paras.pop()
        p["paragraphs"] = paras
        print(p["slug"][:45], len(paras), "blocks")
        time.sleep(0.3)
    except Exception as e:
        print("FAIL", p["slug"], e)
        p["paragraphs"] = []

json.dump(posts, open(".tmp-scratch/blog_posts.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
print("done")
