"""Append newly scraped projects to src/data/realProjects.ts.

Reads scripts/scraped_new_projects.json, derives factual metadata from
titles (client names, known Dhaka locations), and emits TS object literals
in the same shape as the existing five projects. Missing metadata renders
as absent thanks to conditional UI; only hard facts are filled in.
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "scraped_new_projects.json")
TS_PATH = os.path.join(ROOT, "src", "data", "realProjects.ts")

# Known Dhaka neighborhoods, matched case-insensitively against titles
LOCATIONS = [
    "Banani", "Baridhara", "Niketon", "Gulshan", "Dhanmondi", "Mirpur",
    "Uttara", "Bashundhara", "Mohammadpur", "Motijheel", "Tejgaon",
    "Kushtia", "Sylhet", "Chattogram", "Chittagong", "CTG",
]

# Client names appear in titles as "for X" / "X Group" / possessives
def derive_client(title: str) -> str:
    m = re.search(r"\bfor\s+((?:[A-Z][\w&.]+\s?){1,4}(?:Group|Ltd|Limited|Wellbore|Chemical|Engineering|Innerwear|Samurai|Food Hall|Food Court|Counter|KIA|KIMBALL|Pepsico|Siemens|Cisco|Bond|Aziz)?)\s*$", title)
    if m and m.group(1).strip():
        return m.group(1).strip()
    m = re.search(r"((?:[A-Z][\w&.]+\s?){1,4}(?:Group|Ltd|Limited))", title)
    if m:
        return m.group(1).strip()
    return ""


def derive_location(title: str) -> str:
    t = title
    for loc in LOCATIONS:
        if re.search(rf"\b{re.escape(loc)}\b", t, re.I):
            if loc == "CTG":
                return "Chattogram"
            return loc + ", Bangladesh" if loc in ("Kushtia", "Sylhet", "Chattogram", "Chittagong") else loc + ", Dhaka"
    return ""


def escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def img_block(img: dict, indent: str) -> str:
    return (
        f'{indent}{{\n'
        f'{indent}  "id": "{img["id"]}",\n'
        f'{indent}  "src": "{img["src"]}",\n'
        f'{indent}  "originalUrl": "{img["originalUrl"]}",\n'
        f'{indent}  "title": "{escape(img["title"])}",\n'
        f'{indent}  "room": "{escape(img["room"])}",\n'
        f'{indent}  "width": {img["width"]},\n'
        f'{indent}  "height": {img["height"]},\n'
        f'{indent}  "aspectRatio": "{img["aspectRatio"]}"\n'
        f'{indent}}}'
    )


def project_block(p: dict) -> str:
    synopsis = p["synopsis"] or f"{p['title']} — realized interior project by Imagine Interiors."
    tags = p["tags"] or [p["category"].title() + " Interior"]

    lines = []
    lines.append("  {")
    lines.append(f'    "id": "{p["id"]}",')
    lines.append(f'    "number": "{p["number"]}",')
    lines.append(f'    "title": "{escape(p["title"])}",')
    lines.append(f'    "client": "{escape(p["client"])}",')
    lines.append(f'    "location": "{escape(p["location"])}",')
    lines.append(f'    "category": "{p["category"]}",')
    lines.append(f'    "year": "{p["year"]}",')
    lines.append(f'    "area": "{escape(p["area"])}",')
    lines.append(f'    "synopsis": "{escape(synopsis)}",')
    lines.append(f'    "quote": "",')
    lines.append('    "tags": [')
    lines.append(",\n".join(f'      "{escape(t)}"' for t in tags))
    lines.append("    ],")
    lines.append(f'    "heroImage": "{p["heroImage"]}",')
    lines.append('    "allImages": [')
    lines.append(",\n".join(img_block(i, "      ") for i in p["allImages"]))
    lines.append("    ],")
    lines.append('    "structuredSpaces": []')
    lines.append("  }")
    return "\n".join(lines)


def main():
    with open(SRC, encoding="utf-8") as f:
        projects = json.load(f)

    for p in projects:
        p["client"] = derive_client(p["title"])
        p["location"] = derive_location(p["title"])

    with open(TS_PATH, encoding="utf-8") as f:
        ts = f.read()

    assert ts.rstrip().endswith("];"), "unexpected realProjects.ts tail"
    head = ts.rstrip()[:-1].rstrip()  # strip final "];"

    new_text = ",\n" + ",\n".join(project_block(p) for p in projects) + "\n];"

    with open(TS_PATH, "w", encoding="utf-8", newline="\n") as f:
        f.write(head + new_text)

    print(f"appended {len(projects)} projects -> {TS_PATH}")


if __name__ == "__main__":
    main()
