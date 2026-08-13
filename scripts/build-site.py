"""Bygger den statiska sajten som publiceras pa GitHub Pages.

Kallan ar markdownfilerna i `store/`, sa policytexten finns pa ett stalle och
kan inte glida isar mellan repot och den publicerade sidan.

Sidan ar avsiktligt helt fristaende: inga typsnitt, skript eller bilder fran
andra varddatorer. En integritetspolicy som laddar in tredjepartsresurser vore
en motsagelse, och Play tittar pa sidan.

    pip install markdown && python3 scripts/build-site.py
"""
import pathlib
import shutil

import markdown

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "site"

# Samma palett som appen (src/theme/tokens.ts).
STYLE = """
:root {
  --paper: #F7F4EE;
  --ink: #1C1A17;
  --muted: #6B6459;
  --faint: #A39A8C;
  --border: #D9D1C2;
  --sand: #E3CE96;
  --sage: #A9BFA2;
  --blue: #8AA4BE;
  --plum: #8E7796;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  padding: 3rem 1.5rem 5rem;
  background: var(--paper);
  color: var(--ink);
  font: 17px/1.65 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
main { max-width: 41rem; margin: 0 auto; }
h1, h2, h3 { font-family: ui-serif, Georgia, "Times New Roman", serif; line-height: 1.2; }
h1 { font-size: 2.6rem; margin: 0 0 .5rem; letter-spacing: -0.01em; }
h2 { font-size: 1.35rem; margin: 2.5rem 0 .6rem; }
p, li { color: #322E28; }
a { color: var(--ink); text-decoration-color: var(--faint); text-underline-offset: 3px; }
a:hover { text-decoration-color: var(--ink); }
code { background: #EDE7DC; padding: .1em .35em; border-radius: 4px; font-size: .9em; }
hr { border: none; border-top: 1px solid var(--border); margin: 2.5rem 0; }
.tiles { display: flex; gap: 6px; margin: 0 0 1.75rem; }
.tiles span { width: 34px; height: 8px; border-radius: 4px; }
.lead { color: var(--muted); font-size: 1.1rem; margin-top: 0; }
footer {
  max-width: 41rem; margin: 4rem auto 0; padding-top: 1.5rem;
  border-top: 1px solid var(--border); color: var(--faint); font-size: .9rem;
}
@media (prefers-color-scheme: dark) {
  :root { --paper: #171613; --ink: #F2EEE6; --muted: #A69E90; --border: #34302A; }
  body { background: var(--paper); color: var(--ink); }
  p, li { color: #DAD4C8; }
  code { background: #262320; }
}
"""

TILES = (
    '<div class="tiles" aria-hidden="true">'
    '<span style="background:var(--sand)"></span>'
    '<span style="background:var(--sage)"></span>'
    '<span style="background:var(--blue)"></span>'
    '<span style="background:var(--plum)"></span>'
    "</div>"
)


def page(title: str, body: str) -> str:
    return f"""<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>{STYLE}</style>
</head>
<body>
<main>
{TILES}
{body}
</main>
<footer>
  Fyrtal · <a href="/">Start</a> ·
  <a href="/integritetspolicy.html">Integritetspolicy</a> ·
  <a href="https://github.com/AndersRoseen/fyrtal">Källkod</a>
</footer>
</body>
</html>
"""


def render(path: pathlib.Path) -> str:
    return markdown.markdown(
        path.read_text(encoding="utf8"), extensions=["extra", "sane_lists"]
    )


INDEX = """
<h1>Fyrtal</h1>
<p class="lead">Ett dagligt svenskt ordpussel. Sortera 16 ord i fyra grupper om fyra.</p>
<p>
  Varje dag får du 16 ord. De hör ihop fyra och fyra, och din uppgift är att
  hitta alla fyra grupperna. Du har fyra försök.
</p>
<p>
  Ingen inloggning, inga konton, inga annonser. Allt spelet sparar ligger kvar
  på din egen telefon &ndash; se <a href="/integritetspolicy.html">integritetspolicyn</a>.
</p>
<h2>Källkod</h2>
<p>
  Fyrtal är öppen källkod:
  <a href="https://github.com/AndersRoseen/fyrtal">github.com/AndersRoseen/fyrtal</a>
</p>
"""


def main() -> None:
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    (OUT / "index.html").write_text(page("Fyrtal", INDEX), encoding="utf8")
    (OUT / "integritetspolicy.html").write_text(
        page("Integritetspolicy – Fyrtal", render(ROOT / "store" / "privacy-policy.md")),
        encoding="utf8",
    )

    # Jekyll skulle annars svalja filer och mappar som borjar med understreck.
    (OUT / ".nojekyll").write_text("", encoding="utf8")

    for item in sorted(OUT.iterdir()):
        print(f"site/{item.name}")


if __name__ == "__main__":
    main()
