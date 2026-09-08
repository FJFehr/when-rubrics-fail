/**
 * ============================================================================
 * THEME CONFIGURATION
 * ============================================================================
 * The single file to edit to re-title or re-skin this template for a new
 * paper/project: title, fonts, font sizes, layout, and the light/dark
 * colour palette. Loaded before everything else (see index.html's <head>)
 * and applied via applyTheme() below, which maps these values onto the CSS
 * custom properties declared under "THEME TOKENS" in index.html's <style>
 * block -- every rule in that stylesheet reads colours/fonts/sizes only
 * from those variables, so changing a value here re-skins the whole page.
 *
 * applyTheme(mode) is called twice: once from the pre-paint THEME BOOTSTRAP
 * script in index.html's <head> (so colours are correct before first
 * paint, same as the light/dark attribute itself), and again from the
 * theme-toggle handler in static/js/main.js (so toggling actually
 * recolours the page -- without this second call the values set at boot
 * would never change again, since an inline style wins over the
 * stylesheet's own [data-theme="dark"] rule regardless of the attribute).
 *
 * The static :root / [data-theme="dark"] blocks in index.html's <style>
 * block are left untouched as fallback defaults for the case where
 * JavaScript is disabled (already a heavily degraded experience for this
 * page -- see the <noscript> banner). THEME below is the real source of
 * truth whenever JS runs.
 * ============================================================================
 */

const THEME = {
  // Paper title. `full` is used for the hero <h1> and the browser tab
  // title; `short` is the nav-bar wordmark -- keep it brief. The SEO/
  // OpenGraph/Twitter/Highwire <meta> tags in index.html's <head>, and the
  // BibTeX title in citation.bib, must stay static HTML/data (crawlers and
  // BibTeX don't run JS) -- update those by hand to match if you change
  // this. See the top-of-file comment in index.html.
  title: {
    full: "When Rubrics Fail: Hallucinations Reveal Blind Spots in Medical AI Evaluation",
    short: "When Rubrics Fail",
  },

  fonts: {
    serif: 'ui-serif, Georgia, "Iowan Old Style", "Times New Roman", serif',
    sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace',
  },

  fontSizes: {
    heroTitle: "clamp(1.7rem, 3.4vw, 2.5rem)", // the <h1>
    body: "17px",
    bodyMobile: "16px", // <= 480px
  },

  layout: {
    contentWidth: "900px",
    // Shared width for body paragraphs and their figures, so a figure
    // never reads wider than the text around it (both are centred at
    // this width inside the wider contentWidth page wrap).
    proseWidth: "700px",
    radius: "10px",
    radiusPill: "999px",
  },

  // Light/dark colour palettes. `primary`/`secondary`/`accent` are each a
  // {dark, mid, light, text} tone quad used throughout the page (callouts,
  // stats, taxonomy rows, links): "dark" = borders/large bold text, "mid" =
  // fill tone, "light" = background tint, "text" = a darkened/lightened
  // variant used for small body text so it clears WCAG AA (4.5:1) contrast.
  // `primary.text` also colours links and focus rings. Defaults below are
  // the paper's own figure palette (OXAI___Medical/main.tex): primary =
  // green, secondary = purple, accent = orange.
  colors: {
    light: {
      background: "#F5F0E6",
      surface: "#FBF7EF",
      text: "#2A2521",
      textMuted: "#6E6759",
      border: "#DED4C0",
      rule: "#C9BC9E",
      linkHover: "#16350F",
      primary: { dark: "#328132", mid: "#61CA53", light: "#DCF5DC", text: "#256025" },
      secondary: { dark: "#75639B", mid: "#B7A9D6", light: "#EEEAF5", text: "#5F5085" },
      accent: { dark: "#D98A45", mid: "#F1C38F", light: "#FBF1E6", text: "#8C4E1C" },
    },
    dark: {
      background: "#1E1A16",
      surface: "#28231E",
      text: "#EDE6D8",
      textMuted: "#A79C8A",
      border: "#3A332B",
      rule: "#453D33",
      linkHover: "#86B77B",
      // Dark mode reuses the paper's brighter "mid" tones for both borders
      // and text (they already clear AA on the dark background), and swaps
      // the pastel "light" tints for desaturated dark equivalents rather
      // than the literal light-theme hex values, which would be jarring.
      primary: { dark: "#61CA53", mid: "#61CA53", light: "#26301F", text: "#6E9C64" },
      secondary: { dark: "#B7A9D6", mid: "#B7A9D6", light: "#2A2733", text: "#C6BADF" },
      accent: { dark: "#D98A45", mid: "#F1C38F", light: "#332822", text: "#E2A468" },
    },
  },
};

// Applies THEME's fonts/layout/colours for `mode` ("light" or "dark") as
// inline CSS custom properties on <html> -- these map 1:1 onto the
// variable names declared under "THEME TOKENS" in index.html's <style>
// block. See the file header above for when this is called.
function applyTheme(mode) {
  const root = document.documentElement.style;
  const c = THEME.colors[mode] || THEME.colors.light;
  const set = function (name, value) {
    root.setProperty(name, value);
  };

  set("--color-bg", c.background);
  set("--color-surface", c.surface);
  set("--color-text", c.text);
  set("--color-text-muted", c.textMuted);
  set("--color-border", c.border);
  set("--color-rule", c.rule);
  set("--color-link", c.primary.text);
  set("--color-link-hover", c.linkHover);
  set("--color-focus", c.primary.text);

  set("--green-dark", c.primary.dark);
  set("--green-mid", c.primary.mid);
  set("--green-light", c.primary.light);
  set("--green-text", c.primary.text);
  set("--purple-dark", c.secondary.dark);
  set("--purple-mid", c.secondary.mid);
  set("--purple-light", c.secondary.light);
  set("--purple-text", c.secondary.text);
  set("--orange-dark", c.accent.dark);
  set("--orange-mid", c.accent.mid);
  set("--orange-light", c.accent.light);
  set("--orange-text", c.accent.text);

  set("--font-serif", THEME.fonts.serif);
  set("--font-sans", THEME.fonts.sans);
  set("--font-mono", THEME.fonts.mono);
  set("--font-size-hero-title", THEME.fontSizes.heroTitle);
  set("--font-size-body", THEME.fontSizes.body);
  set("--font-size-body-mobile", THEME.fontSizes.bodyMobile);

  set("--content-width", THEME.layout.contentWidth);
  set("--prose-width", THEME.layout.proseWidth);
  set("--radius", THEME.layout.radius);
  set("--radius-pill", THEME.layout.radiusPill);
}
