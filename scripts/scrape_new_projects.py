"""Scrape imagineinteriors.design portfolio.

Fetches the portfolio listing, skips the 5 projects already added locally,
visits each remaining project page, extracts the project's own gallery
(full-size lightbox anchors, excluding related-post thumbnails and icons),
downloads images into public/projects/<id>/, reads pixel dimensions, and
writes scripts/scraped_new_projects.json.
"""

import html as H
import json
import os
import re
import struct
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = "https://imagineinteriors.design"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public", "projects")
OUT_JSON = os.path.join(ROOT, "scripts", "scraped_new_projects.json")

EXISTING_SLUGS = {
    "homes-interior-design-mrs-sen-banani",
    "residential-interior-design-dream-home-tasnim-uttara-4",
    "residential-interior-design-tolarbag-mirpur-dhaka",
    "home-interior-design-3",
    "duplex-interior-design-kushtia",
}

CATEGORY_LABELS = {
    "office-interior-design": "COMMERCIAL",
    "home-interior-design": "RESIDENTIAL",
    "hotel-interior-design": "HOSPITALITY",
    "restaurant-interior-design": "HOSPITALITY",
}

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}


def fetch(url: str, binary: bool = False, retries: int = 3):
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=45) as r:
                data = r.read()
            return data if binary else data.decode("utf-8", errors="ignore")
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"failed {url}: {last}")


def strip_tags(s: str) -> str:
    return H.unescape(re.sub(r"<[^>]+>", "", s)).replace("\s+", " ").strip()


def clean_text(s: str) -> str:
    s = H.unescape(s or "")
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"\s*(Call( now)?[^.]*01712\s*664168[^.]*\.?)\s*", " ", s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip(" .|")
    return s


def parse_listing(html_text: str):
    """Return ordered [{slug, title, category}] from the Divi portfolio grid."""
    items = []
    seen = set()
    pattern = re.compile(
        r'<div[^>]*class="[^"]*et_pb_portfolio_item[^"]*"[^>]*>.*?'
        r'<a[^>]+href="(https://imagineinteriors\.design/project/([^"/]+)/)".*?'
        r'(?:<h2[^>]*>\s*<a[^>]*>(.*?)</a>|<h2[^>]*>(.*?)</h2>).*?'
        r'</div>',
        re.S,
    )
    for m in pattern.finditer(html_text):
        url, slug, t1, t2 = m.group(1), m.group(2), m.group(3), m.group(4)
        if slug in seen:
            continue
        seen.add(slug)
        title = clean_text(strip_tags(t1 or t2 or ""))
        cat_m = re.search(r"project_category-([a-z-]+)", m.group(0))
        cat = cat_m.group(1) if cat_m else "home-interior-design"
        items.append({"slug": slug, "title": title, "category": cat})
    return items


def extract_gallery(html_text: str, title_pos: int):
    """Own gallery = unique full-size lightbox anchors after the page title."""
    region = html_text[title_pos:]
    anchors = re.findall(
        r'href="(https://imagineinteriors\.design/wp-content/uploads/[^"]+\.(?:jpg|jpeg|png|webp))"',
        region,
    )
    seen, out = set(), []
    for a in anchors:
        if re.search(r"-\d+x\d+\.(?:jpg|jpeg|png|webp)$", a):
            continue  # cropped thumbnail
        if re.search(r"star\.png|logo|favicon|icon", a, re.I):
            continue
        if a not in seen:
            seen.add(a)
            out.append(a)
    return out


def jpeg_size(data: bytes):
    if data[:2] != b"\xff\xd8":
        return None
    i = 2
    n = len(data)
    while i < n - 9:
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
            i += 2
            continue
        seg_len = struct.unpack(">H", data[i + 2 : i + 4])[0]
        if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
            h, w = struct.unpack(">HH", data[i + 5 : i + 9])
            return w, h
        i += 2 + seg_len
    return None


def png_size(data: bytes):
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    w, h = struct.unpack(">II", data[16:24])
    return w, h


def webp_size(data: bytes):
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    fmt = data[12:16]
    try:
        if fmt == b"VP8 ":
            w = struct.unpack("<H", data[26:28])[0] & 0x3FFF
            h = struct.unpack("<H", data[28:30])[0] & 0x3FFF
            return w, h
        if fmt == b"VP8L":
            b = data[21:25]
            w = 1 + (((b[1] & 0x3F) << 8) | b[0])
            h = 1 + (((b[3] & 0xF) << 10) | (b[2] << 2) | ((b[1] & 0xC0) >> 6))
            return w, h
        if fmt == b"VP8X":
            w = 1 + int.from_bytes(data[24:27], "little")
            h = 1 + int.from_bytes(data[27:30], "little")
            return w, h
    except Exception:  # noqa: BLE001
        return None
    return None


def image_size(data: bytes, url: str):
    for fn in (jpeg_size, png_size, webp_size):
        dims = fn(data)
        if dims:
            return dims
    print(f"  ! unknown dims: {url}", file=sys.stderr)
    return None


def download(url: str, dest: str):
    data = fetch(url, binary=True)
    with open(dest, "wb") as f:
        f.write(data)
    return data


def main():
    print("fetching portfolio listing...")
    listing = fetch(f"{BASE}/portfolio/")
    items = parse_listing(listing)
    print(f"{len(items)} portfolio items found")

    todo = [it for it in items if it["slug"] not in EXISTING_SLUGS]
    skipped = [it["slug"] for it in items if it["slug"] in EXISTING_SLUGS]
    print(f"{len(todo)} to add, {len(skipped)} already present: {skipped}")

    results = []
    os.makedirs(PUBLIC, exist_ok=True)

    for idx, it in enumerate(todo):
        slug = it["slug"]
        url = f"{BASE}/project/{slug}/"
        print(f"\n[{idx + 1}/{len(todo)}] {slug}")
        try:
            page = fetch(url)
        except Exception as e:  # noqa: BLE001
            print(f"  ! page fetch failed: {e}", file=sys.stderr)
            continue

        h1 = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S)
        title = clean_text(strip_tags(h1.group(1))) if h1 else it["title"]

        desc_m = re.search(r'<meta name="description" content="([^"]*)"', page)
        synopsis = clean_text(desc_m.group(1)) if desc_m else ""

        title_pos = h1.start() if h1 else 0
        gallery = extract_gallery(page, title_pos)
        if not gallery:
            print("  ! no gallery images found, skipping", file=sys.stderr)
            continue

        cat_key = it["category"]
        category = CATEGORY_LABELS.get(cat_key, "RESIDENTIAL")

        out_dir = os.path.join(PUBLIC, slug)
        os.makedirs(out_dir, exist_ok=True)

        def grab(i_url):
            name = i_url.rsplit("/", 1)[-1]
            base, ext = os.path.splitext(name)
            fname = f"{base}{ext.lower()}"
            dest = os.path.join(out_dir, fname)
            if os.path.exists(dest) and os.path.getsize(dest) > 0:
                with open(dest, "rb") as f:
                    return fname, f.read()
            return fname, download(i_url, dest)

        with ThreadPoolExecutor(max_workers=6) as ex:
            downloaded = list(ex.map(grab, gallery))

        images = []
        for i, (orig_name, data) in enumerate(downloaded, 1):
            dims = image_size(data, gallery[i - 1])
            w, h = dims if dims else (1600, 1067)
            local_src = f"/projects/{slug}/{orig_name}"
            images.append({
                "id": f"{slug}-{i:02d}",
                "src": local_src,
                "originalUrl": gallery[i - 1],
                "title": f"{title} — View {i:02d}",
                "room": "Interior View",
                "width": w,
                "height": h,
                "aspectRatio": f"{w}/{h}",
            })

        years = {m.group(1) for m in re.finditer(r"/uploads/(\d{4})/", " ".join(gallery))}
        year = str(min(years)) if years else ""

        results.append({
            "id": slug,
            "sourceUrl": url,
            "number": f"{idx + 6:02d}",  # existing projects are 01–05
            "title": title,
            "client": "",
            "location": "",
            "category": category,
            "categoryLabel": cat_key,
            "year": year,
            "area": "",
            "synopsis": synopsis,
            "quote": "",
            "tags": [],
            "heroImage": images[0]["src"],
            "allImages": images,
        })
        print(f"  {len(images)} images, {sum(os.path.getsize(os.path.join(out_dir, f)) for f in os.listdir(out_dir)) // 1024} KB, year {year}")

        time.sleep(0.4)

    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nwrote {OUT_JSON} with {len(results)} projects, "
          f"{sum(len(r['allImages']) for r in results)} images total")


if __name__ == "__main__":
    main()
