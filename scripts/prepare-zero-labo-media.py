#!/usr/bin/env python3
"""Install a built ZERO Labo preview beneath this GitHub Pages project.

Input is the existing prototype's ``dist`` directory.  Its original absolute
paths assume the domain root; GitHub Pages serves this repository beneath
``/zero-commercial-lp-test/``, so only site-local URLs are rebased.  Morisawa's
licensed CSS continues to load from morisawafonts.net.
"""

import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
import sys


REPO = Path(__file__).resolve().parents[1]
DEST = REPO / "zero-labo-media"
BASE = "/zero-commercial-lp-test/zero-labo-media"
MARKER = ".zero-labo-preview.json"
SITE_ROOTS = (
    "assets/", "about/", "articles/", "chapters/", "chapter-designs/",
    "glossary/", "news/", "resource-designs/", "resources/",
    "support-designs/", "content.json", "#",
)

# Quoted root URLs also occur within HTML fragments assembled by app.js.
ROOT_URL = re.compile(r'''(?P<quote>["'`])/(?P<path>[^"'`\s<>)]*)''')
ROOT_ATTR = re.compile(r'''(?P<attr>\b(?:href|src|action|poster)=)(?P<quote>["'])/(?P=quote)''')
NEWS_PATH_REGEX = r"url.pathname.match(/^\/news\/page\/(\d+)\/$/)"
REBASED_NEWS_PATH_REGEX = (
    r"url.pathname.match(/^\/zero-commercial-lp-test\/zero-labo-media"
    r"\/news\/page\/(\d+)\/$/)"
)


def should_rebase(path):
    if not path:
        return False  # JS also concatenates '/' and emits XML closing tags.
    if path.startswith("/"):
        return False  # protocol-relative URL
    return path.startswith(SITE_ROOTS) or re.match(r"[a-z][\w.-]*\.(?:css|js)(?:[?#].*)?$", path)


def rebase_text(text):
    def replace(match):
        path = match.group("path")
        return match.group(0) if not should_rebase(path) else match.group("quote") + BASE + "/" + path
    text = ROOT_URL.sub(replace, text)
    return ROOT_ATTR.sub(lambda match: match.group("attr") + match.group("quote") + BASE + "/" + match.group("quote"), text)


class SiteReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.noindex = False

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "meta" and attributes.get("name", "").lower() == "robots":
            self.noindex = "noindex" in attributes.get("content", "").lower()
        for key in ("href", "src", "action", "poster", "srcset"):
            value = attributes.get(key)
            if value:
                self.references.append((tag, key, value))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="built prototype dist directory")
    parser.add_argument("--replace", action="store_true", help="replace this script's previous output")
    args = parser.parse_args()
    source = args.source.resolve()
    if not source.is_dir() or not (source / "index.html").is_file():
        parser.error("source must be a built ZERO Labo dist directory")
    if DEST.exists():
        if not args.replace or not (DEST / MARKER).is_file():
            parser.error("destination exists; --replace only replaces a prior generated preview")
        shutil.rmtree(DEST)
    shutil.copytree(source, DEST)
    # Image-generation notes are source material, not assets used by the site.
    for note in (DEST / "assets").iterdir():
        if note.suffix in {".md", ".txt"}:
            note.unlink()
    count = 0
    for path in DEST.rglob("*"):
        if not path.is_file() or path.suffix not in {".html", ".js", ".css", ".json"}:
            continue
        original = path.read_text(encoding="utf-8")
        converted = rebase_text(original)
        if path.name == "app.js":
            home = "const siteHome=isSubpage?'/':'';"
            if converted.count(home) != 1:
                raise RuntimeError("app.js home path changed; review rebasing")
            converted = converted.replace(home, "const siteHome=isSubpage?'" + BASE + "/':'';")
        if path.name == "news-model.js":
            if converted.count(NEWS_PATH_REGEX) != 1:
                raise RuntimeError("news-model.js path parser changed; review rebasing")
            converted = converted.replace(NEWS_PATH_REGEX, REBASED_NEWS_PATH_REGEX)
        if path.suffix == ".html":
            if converted.count("</head>") != 1:
                raise RuntimeError("missing unique head close in " + str(path))
            converted = converted.replace(
                "</head>",
                '<link rel="icon" type="image/png" href="' + BASE
                + '/assets/zero-logo-original.png"></head>',
            )
        if converted != original:
            path.write_text(converted, encoding="utf-8")
            count += 1
    pages = sorted(DEST.rglob("*.html"))
    if len(pages) != 24:
        raise RuntimeError("expected 24 HTML pages, found " + str(len(pages)))
    for page in pages:
        html = page.read_text(encoding="utf-8")
        parsed = SiteReferences()
        parsed.feed(html)
        if not parsed.noindex:
            raise RuntimeError("missing noindex on " + str(page))
        for tag, key, value in parsed.references:
            if value.startswith("/") and not value.startswith((BASE + "/", "//")):
                raise RuntimeError("unrebased " + tag + " " + key + "=" + value + " in " + str(page))
            if page != DEST / "index.html" and not value.startswith(("/", "#", "http:", "https:", "mailto:", "tel:", "data:")):
                raise RuntimeError("relative subpage " + tag + " " + key + "=" + value + " in " + str(page))
    (DEST / MARKER).write_text(json.dumps({
        "site": "ZERO Labo LP specialist media preview",
        "sourceRevision": "Revision 035 plus 2026-10-22 display refresh",
        "pages": len(pages),
        "basePath": BASE + "/",
        "font": "Morisawa Shin Go R/B via the existing LP kit CSS",
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Prepared", len(pages), "pages,", count, "text files rebased at", DEST)


if __name__ == "__main__":
    main()
