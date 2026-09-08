# static/logos/

- `oxford.svg` — University of Oxford mark, pulled from `fjfehr.github.io`'s
  own timeline component (`content/timeline/logos/oxford.svg`), where it's
  already used the same way (affiliation credit on an academic page).
- `oxai_logo_final_black.png` / `oxai_logo_final.png` — Oxford Artificial
  Intelligence Society (OxAI) mark, black-on-transparent and
  white-on-transparent variants, supplied directly. `index.html` swaps
  between them by theme (`.theme-only-light` / `.theme-only-dark`) so the
  mark stays legible in both. `oxai_logo_text_black.png` (the full
  logo+wordmark lockup) is kept here for reference but isn't used on the
  page — the affiliation row shows marks only, no text.
- `github.svg` — generic GitHub mark (svgrepo.com), inlined with
  `fill="currentColor"` in `static/js/main.js` so it follows the Code
  button's text colour in both themes.
- `huggingface.png` — Hugging Face logo, copied from
  `OXAI___Medical/figures/hg-logo.png`. Used on the "Dataset" button.
- `arxiv.svg` — official arXiv wordmark, supplied directly. Used on the
  arXiv button, which shows the logo only (no visible "arXiv" caption —
  the label is kept for screen readers via `.visually-hidden` in
  `index.html`).

If you'd rather not bundle a given logo, remove the file and drop the
corresponding icon reference in `index.html` (Oxford/OxAI, in the hero's
`.affiliation-block`) or `static/js/main.js` (`ICON_GITHUB`,
`ICON_HUGGINGFACE`, `ICON_ARXIV` in `renderResourceButtons`).
