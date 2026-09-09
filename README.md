# When Rubrics Fail — project page

A single-page academic project site for the preprint *"When Rubrics Fail:
Hallucinations Reveal Blind Spots in Medical AI Evaluation"* (Farrow, Li,
Johnson, Wang, Torr, Bolton, Fehr — University of Oxford).

Plain HTML/CSS/vanilla JS, no build step, deployable as-is on GitHub Pages.
Built as a reusable template: `index.html` is the layout/styling shell, and
everything you'd actually want to edit — prose, figures, authors, links,
citation, taxonomy rows — lives in separate content files that get loaded
into it at page load. No compiling: edit a content file, save, refresh.

## File structure

```
index.html                  Layout, CSS (theme tokens + styling), static
                             SEO / OpenGraph / Twitter / Google Scholar
                             (Highwire) meta tags, and empty containers
                             marked data-md="slot-name" / data-md-img=
                             "slot-name" that content.md gets loaded into.
content.md                  ALL of the page's prose (TL;DR, findings,
                             method, taxonomy intro, implications, etc.)
                             and the four figures' image paths/alt text/
                             placement. EDIT THIS for wording or figure
                             changes.
authors.yaml                 Author names + links, affiliation, and the
                             corresponding-author placeholder. EDIT THIS
                             for author changes.
links.yaml                   arXiv / Code / Dataset links and the OG
                             image path. EDIT THIS for link changes.
citation.bib                 The BibTeX citation, as a real .bib file.
                             EDIT THIS for citation changes.
static/js/theme.js           Title, fonts, font sizes, layout, and the
                             light/dark colour palette. EDIT THIS to
                             re-title or re-skin the page.
taxonomy.md                  The 13 taxonomy table rows, as a standard
                             Markdown table. EDIT THIS for taxonomy
                             changes — add/remove rows or columns freely.
static/js/content.js        Fetches content.md, does the (small, custom)
                             Markdown-to-HTML conversion, and fills in
                             every data-md / data-md-img element. Template
                             logic — shouldn't need editing for a content
                             update.
static/js/tables.js          Generic engine: fetches any Markdown table
                             file referenced by a `data-md-table="..."`
                             attribute (taxonomy.md today) and renders it
                             as a styled <table>. Not specific to the
                             taxonomy table — see "How to add a table"
                             below. Template logic.
static/js/yaml-lite.js       Parses authors.yaml / links.yaml (a small,
                             restricted YAML subset — see below). Template
                             logic.
static/js/main.js           Fetches authors.yaml / links.yaml / citation.bib
                             and renders them (plus the title from theme.js)
                             into the page; theme toggle; smooth-scroll nav
                             with scroll-spy; scroll progress bar; copy-to-
                             clipboard for BibTeX. Template logic.
static/images/               Figures exported from the paper's own source
                             assets, plus the generated OG preview image.
static/logos/                oxford.svg, oxai_logo_final(_black).png,
                             github.svg, huggingface.png, arxiv.svg — see
                             static/logos/README.md for provenance.
OXAI___Medical/               The paper's LaTeX source (main.tex, taxonomy.tex,
                             references.bib) and original figure/logo assets,
                             included for reference and as the source of
                             truth if a figure needs re-exporting. Not part
                             of the rendered page itself.
```

The engine (`index.html`'s structure/CSS and every `static/js/*.js` file)
is what stays fixed and reusable for a different paper — reusing this
template means editing `content.md`/`authors.yaml`/`links.yaml`/
`citation.bib` (content) and `static/js/theme.js` (style), never the
engine files.

Note: there's no "Paper (PDF)" button by design — the four resource
buttons are exactly arXiv / Code / Dataset / Cite. The page's section
order is Hero, Overview (TL;DR, the pull figure, and Key Takeaways — one
"Overview" nav link and no separate "Problem" section), Method (folds in
the Taxonomy table as a subsection), Results, Beyond Fixed Rubrics,
Citation, then a minimal footer (`footer-note` in content.md + a "Back to
top" link).

## How to edit the page's text

Edit **`content.md`**. It's a series of blocks, each preceded by an
invisible `<!-- slot: name -->` marker:

```
<!-- slot: tldr -->
**TL;DR.** Rubric-based grading is now the leading way to evaluate medical AI. ...
```

Each block fills one spot on the page — the file's own header comment
explains the convention and lists what lives where instead (authors,
resource links, BibTeX, taxonomy rows — see below). content.md is
otherwise plain, standard Markdown: headings, `**bold**`, `*italic*`,
`` `code` ``, numbered/bulleted lists, and `![alt](src)` images all mean
exactly what they mean in any Markdown file.

**Figures** are edited in the same file. A block ending in `-image` (e.g.
`<!-- slot: problem-image -->`) holds a standard `![alt](src)` Markdown
image instead of prose — point it at a file under `static/images/` (drop
the new image there first) and update the alt text to describe it. Add an
optional
second line, `position: left` / `right` / `center`, to choose where the
figure sits: `center` (the default, today's layout) keeps it centred;
`left`/`right` floats it with body text wrapping alongside (falls back to
centred below ~600px, where there's no room to wrap).

Don't rename a `<!-- slot: name -->` unless you also rename the matching
`data-md="slot-name"` (or `data-md-img="slot-name"`) attribute in
`index.html` — that's how `static/js/content.js` knows which element on the
page each block belongs to.

## How to reorder the page's sections

`content.md` also decides the order the sections appear in. A second kind
of marker, `<!-- section: name -->`, sits before each top-level section:

```
<!-- section: results -->

<!-- slot: results-title -->
## Results
...
```

To move a section, cut its `<!-- section: ... -->` marker **plus
everything under it** (up to the next `<!-- section: ... -->` marker) and
paste it somewhere else in the file. Save, refresh, and the page follows
— no other file to touch.

Two things stay put: the hero (title/authors/resource links) is always
first and the footer is always last. Everything between them is ordered
by `content.md`.

Each `section:` name matches a `data-section-group="name"` attribute on
one or more `<section>` tags in `index.html`. One name can cover several
sections — `overview` covers three (TL;DR, the pull figure, Key
Takeaways), which is why they always move together as one block. To make
a new section reorderable, give its `<section>` tag a
`data-section-group` and add a matching `section:` marker. If a section
on the page has no marker in `content.md` it keeps its default position
(and logs a console warning), so a missed marker never makes content
disappear.

## How to edit metadata

**Authors, affiliation, correspondence** — edit `authors.yaml`. Each
author entry has a `url` field; leave it `null` until you have a real
personal/Scholar link (the page renders unlinked authors as plain text
rather than fabricate a destination). The `affiliation.groupName` field is
for the exact OxAI / research-group line, which isn't stated in the paper
itself — fill it in once you have the wording you want, or set it to
`null` to hide that line entirely.

**Resource links, OG image** — edit `links.yaml`. Each resource link
(`arxiv`, `code`, `dataset`) renders as a working button when set. `code`
and `dataset` show a disabled "coming soon" button when `null`; `arxiv`
shows only its logo (no caption), disabled, when `null` — see
`renderResourceButtons` in `static/js/main.js` if you want that behaviour
back once an arXiv ID exists. The Code and Dataset buttons carry their
platform's logo (GitHub / Hugging Face, from `static/logos/`) — edit the
icon markup in `static/js/main.js` (`ICON_GITHUB`, `ICON_HUGGINGFACE`,
`ICON_ARXIV`) if you swap logos.

**Citation (BibTeX)** — edit `citation.bib`, a real, standalone `.bib`
file (also independently downloadable/reusable by other tools). It's
fetched as plain text and dropped straight into the page's citation block
— no parsing, so anything valid there renders as-is. It's currently a
clearly-marked placeholder — replace it once the paper has a venue/year/ID.

`authors.yaml` and `links.yaml` are parsed by `static/js/yaml-lite.js`, a
small hand-rolled parser supporting a **restricted YAML subset** (not full
YAML): 2-space indentation per level; `#` outside quotes starts a comment;
`key: value` (the separator is a colon followed by a space, so a bare
colon inside a value, e.g. a URL, is safe); scalars are `null`/`~`/empty →
null, `true`/`false` → boolean, quoted or bare text → string; a `key:`
with no inline value starts a nested map or a `- ` list on the following
more-indented lines. No flow style (`[a, b]`), no multiline block scalars
(`|`/`>`), no anchors/aliases. Match the existing files' style and you
won't hit these limits.

**Taxonomy table** — edit `taxonomy.md`, a standard Markdown table (see
"How to add a table" below). Add, remove, or reorder rows/columns freely;
the page picks up whatever columns are there.

## How to add a table

Any table on the page — the taxonomy table today, or a new one you add —
is rendered by the generic `static/js/tables.js` from a plain Markdown
file, the same way `content.js` renders `content.md`. To add a new table
anywhere:

1. Write a standard GitHub-Flavored-Markdown table in its own `.md` file
   (a header row, a `---` separator row, then one row per line):

   ```
   | Column A | Column B |
   | --- | --- |
   | First | *emphasised* |
   | Second | ~~superseded~~ replaced |
   ```

   Any Markdown renderer, including GitHub's own preview, displays this as
   a normal table. Supported cell formatting: `**bold**`, `*italic*`,
   `~~strikethrough~~`, `` `code` `` — escape a literal `|` inside a cell
   as `\|`.
2. In `index.html`, add an empty `<table data-md-table="your-file.md"></table>`
   wherever you want it (wrap it in `<div class="table-scroll">...</div>`
   too, for horizontal-scroll on narrow screens, like the taxonomy table).
3. That's it — `tables.js` fetches the file, builds the `<thead>`/`<tbody>`,
   and applies the page's table styling (zebra striping, a bold first
   column, coloured emphasis) automatically. No JavaScript to write, no
   column count or structure to declare anywhere.

**SEO and citation meta tags** — these live directly in `index.html`'s
`<head>`, not in content.md or the data files, because citation indexers
(Google Scholar) and most social-card scrapers don't execute JavaScript.
If you update the title (`static/js/theme.js`), authors (`authors.yaml`),
or add a DOI/arXiv ID/publication date, update both the `<meta>` tags in
`index.html` **and** those files so the visible page and the metadata stay
in sync. Every open TODO is marked with an HTML comment — search
`index.html` for `TODO` to find them all (canonical URL, absolute OG image
URL, `citation_pdf_url` once arXiv is live, `citation_publication_date`,
DOI). The `<h1>` paper title and the nav wordmark are rendered by
`main.js` from `static/js/theme.js` (`THEME.title`) — but are *also*
duplicated in the meta tags above and in `citation.bib`'s `title` field,
for the same "crawlers/BibTeX don't run JS" reason, so those still need
updating by hand.

**Title, fonts, sizes, colour palette (light/dark)** — edit
`static/js/theme.js`, the one file to change to re-title or re-skin this
template. It holds `title.full`/`.short`, `fonts.serif`/`.sans`/`.mono`,
`fontSizes.heroTitle`/`.body`/`.bodyMobile`, `layout.*`, and
`colors.light`/`.dark` — each with `background`/`surface`/`text`/etc. and
three highlight triads, `primary`/`secondary`/`accent` (today's paper
palette: green/purple/orange respectively), each a `{dark, mid, light,
text}` tone quad: dark = borders/large text, mid = fill tone, light =
background tint, `text` = a WCAG-AA-safe variant for small body text.
`applyTheme()` in that same file maps these onto the CSS custom properties
declared under `THEME TOKENS` in `index.html`'s `<style>` block — those
literal values are left in place only as a fallback for the (already
heavily degraded) no-JS case; `theme.js` is what actually re-skins the
page.

## How to replace figures

Prefer editing `content.md` (see above) — it points each `<img>` at its
file and holds the alt text, so most figure swaps need no HTML changes.

The current figures were exported from the paper's own source assets in
`OXAI___Medical/figures/` (the paper's LaTeX project, included in this repo
for reference):

- `figure-1-blind-spot.png` ← `figures/Problem/OXAI - Medical-Problem_v3.pdf`
- `figure-3-pipeline.png` ← `figures/Pipeline/OXAI - Medical-Pipeline (6).pdf`
- `figure-4-cross-benchmark.png` ← `figures/healthbench/results/Cross-Dataset-Comparison.png`
- `figure-6-error-types.png` ← `figures/healthbench/results/HB-Bars.png`

If a figure changes upstream, re-export from the updated source in
`OXAI___Medical/figures/` (for a PDF source: `pdftoppm -png -r 400 <file>.pdf
<out>` then downscale to ~1800px wide), drop the new file in
`static/images/`, and update the matching `src:`/`alt:` lines in
`content.md`.

`static/images/og-image.png` is a generated placeholder (title + authors on
the site's own palette). Regenerate or replace it the same way; keep it at
1200×630 for social card previews.

## How to preview locally

No build step — but `content.md`, `authors.yaml`, `links.yaml`, and
`citation.bib` are all loaded via `fetch()`, which browsers block on the
`file://` scheme, so open the page over `http://`, not by double-clicking
`index.html`:

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static file server works equally well (`npx serve`, etc.).

## How to deploy via GitHub Pages

1. Push this repository to GitHub.
2. In the repo's **Settings → Pages**, set **Source** to "Deploy from a
   branch", pick the branch (e.g. `main`) and the root (`/`) folder.
3. GitHub Pages serves `index.html` at
   `https://<user>.github.io/<repo>/` (or your custom domain).
4. Once you have the deployed URL, fill in the `TODO`-marked canonical /
   `og:url` / `citation_abstract_html_url` values in `index.html`'s
   `<head>`.
