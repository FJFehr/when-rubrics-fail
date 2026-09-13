/**
 * ============================================================================
 * CONTENT LOADER — the "compiler" for this template. Fetches content.md,
 * converts it from Markdown to HTML, and fills in every element carrying
 * data-md="slot-name" / data-md-img="slot-name". This runs in the browser
 * at page load: there's no separate build command, no CLI step, nothing
 * to run before you deploy. Editing content.md and reloading the page
 * *is* the compile step.
 * ============================================================================
 *
 * content.md is plain, standard Markdown throughout -- headings, **bold**,
 * *italic*, `code`, numbered/bulleted lists, and ![alt](src) images all
 * mean exactly what they mean in any Markdown file. The only thing that
 * isn't standard prose is an invisible marker before each block:
 *
 *   <!-- slot: tldr -->
 *   **TL;DR.** Rubric-based grading is now the leading way ...
 *
 * HTML comments are valid, ordinary Markdown -- any renderer (GitHub's
 * preview included) just hides them, so the file reads as normal prose
 * with normal headings, not a custom format. The comment is only there so
 * this script knows which element on the page a block belongs to; block
 * text runs from one `<!-- slot: ... -->` to the next (or end of file).
 *
 * How a slot is rendered depends on the tag of the element carrying
 * data-md:
 *   - h1/h2/h3: a leading "#"/"##"/"###" on the block (if present) is
 *     stripped -- the heading level is already set by the target tag --
 *     and the rest is inline-formatted straight into the heading.
 *   - ol/ul: parsed as a list; only the <li> items are used (the real
 *     <ol>/<ul> is already in index.html).
 *   - everything else (div, figcaption, p): one or more <p> paragraphs.
 *
 * data-md-img="slot-name" on an <img> expects standard Markdown image
 * syntax, `![alt text](static/images/whatever.png)`, and sets that
 * image's src/alt accordingly. The <img>'s existing src/alt in
 * index.html stay in place as a fallback if content.md fails to load.
 *
 * An image slot may add an optional second line, `position: left` /
 * `right` / `center`, to control where the figure sits (default: center,
 * today's behaviour -- floats the figure with body text wrapping beside
 * it for left/right). See README.md.
 *
 * An image slot may also add an optional `dark: static/images/whatever.png`
 * line -- a second image shown instead of the first when the dark theme is
 * active, e.g. for a diagram exported twice (light/dark line-art) with a
 * transparent background. Reuses the ".theme-only-light"/".theme-only-dark"
 * CSS toggle (see index.html) already used for the OxAI logo: give the
 * default <img data-md-img="slot-name"> a class="theme-only-light" and add
 * a second <img data-md-img-dark="slot-name" class="theme-only-dark"> next
 * to it in the same <figure> -- content.js finds it by that shared slot
 * name and points it at the "dark:" path, with the same alt text. A slot
 * with no "dark:" line, or no matching data-md-img-dark element, behaves
 * exactly as before.
 *
 * A second, page-level marker -- `<!-- section: name -->` -- controls the
 * order of the page's top-level sections themselves. It's recognised the
 * same way as a slot marker (so it also correctly ends the previous
 * slot's text) but carries no content of its own: it just records where
 * "name" sits relative to the other section markers. Moving a
 * "<!-- section: name -->" line (together with everything under it, up
 * to the next section marker) to a new position in content.md moves the
 * matching part of the rendered page to match. See README.md.
 */

(function () {
  "use strict";

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Bold/italic/code -- assumes its input is already HTML-escaped.
  function mdEmphasis(s) {
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    s = s.replace(/`(.+?)`/g, "<code>$1</code>");
    return s;
  }

  // Inline formatting only -- used for headings and inside each paragraph.
  function mdInline(text) {
    let s = escapeHtml(text);
    // Links: [label](url) -- label can itself carry **bold**/*italic*/`code`.
    s = s.replace(/\[(.+?)\]\((.+?)\)/g, function (_, label, url) {
      return '<a href="' + url + '" target="_blank" rel="noopener">' + mdEmphasis(label) + "</a>";
    });
    s = mdEmphasis(s);
    return s;
  }

  // Strips a leading Markdown heading marker ("#", "##", ...), if any --
  // used for slots that land in an <h1>/<h2>/<h3>, where the heading
  // level is already set by the target element itself.
  function stripHeadingMarker(text) {
    return text.replace(/^#{1,6}\s+/, "");
  }

  // Paragraphs (blank-line separated) or, if every line looks like
  // "1. ..." / "- ...", a list. Returns one or more <p>/<li> elements as
  // an HTML string; the caller decides what wraps them.
  function mdBlock(raw) {
    const trimmed = (raw || "").trim();
    if (!trimmed) return "";

    const lines = trimmed
      .split("\n")
      .map(function (l) {
        return l.trim();
      })
      .filter(Boolean);
    const isOrderedList =
      lines.length > 0 &&
      lines.every(function (l) {
        return /^\d+\.\s+/.test(l);
      });
    const isBulletList =
      !isOrderedList &&
      lines.length > 0 &&
      lines.every(function (l) {
        return /^[-*]\s+/.test(l);
      });
    if (isOrderedList || isBulletList) {
      const tag = isOrderedList ? "ol" : "ul";
      const itemRe = isOrderedList ? /^\d+\.\s+/ : /^[-*]\s+/;
      return (
        "<" + tag + ">" +
        lines
          .map(function (l) {
            return "<li>" + mdInline(l.replace(itemRe, "")) + "</li>";
          })
          .join("") +
        "</" + tag + ">"
      );
    }

    const paras = trimmed
      .split(/\n\s*\n/)
      .map(function (p) {
        return p.trim();
      })
      .filter(Boolean);
    return paras
      .map(function (p) {
        return "<p>" + mdInline(p.replace(/\s+/g, " ")) + "</p>";
      })
      .join("");
  }

  // Splits content.md into { "slot-name": "raw markdown", ... } on the
  // invisible "<!-- slot: name -->" markers, plus the ordered list of
  // "<!-- section: name -->" markers (see reorderSections below). No
  // closing marker needed -- each block runs to the next marker (slot OR
  // section -- a section marker still ends the previous slot's text,
  // it just doesn't start a slot of its own) or end of file.
  function parseContentMd(text) {
    const slots = {};
    const sectionOrder = [];
    const re = /<!--\s*(slot|section):\s*([a-zA-Z0-9_-]+)\s*-->/g;
    const markers = [];
    let match;
    while ((match = re.exec(text)) !== null) {
      // matchStart: where this marker's own "<!--" begins (used as the
      // previous block's end boundary). contentStart: right after this
      // marker's "-->", where this block's own text begins.
      markers.push({
        kind: match[1],
        name: match[2],
        matchStart: match.index,
        contentStart: match.index + match[0].length,
      });
    }
    markers.forEach(function (marker, i) {
      if (marker.kind === "section") {
        sectionOrder.push(marker.name);
        return;
      }
      const end = i + 1 < markers.length ? markers[i + 1].matchStart : text.length;
      slots[marker.name] = text.slice(marker.contentStart, end);
    });
    return { slots: slots, sectionOrder: sectionOrder };
  }

  // Extracts the first Markdown image, ![alt](src), from a block, plus two
  // optional lines: "position: left|right|center" (default "center") and
  // "dark: static/images/whatever.png" (a dark-theme replacement image;
  // undefined if absent).
  function parseImage(raw) {
    const m = /!\[([^\]]*)\]\(([^)]+)\)/.exec(raw || "");
    if (!m) return null;
    const posMatch = /^position:\s*(left|right|center)\s*$/m.exec(raw || "");
    const darkMatch = /^dark:\s*(\S+)\s*$/m.exec(raw || "");
    return {
      alt: m[1].trim(),
      src: m[2].trim(),
      position: posMatch ? posMatch[1] : "center",
      dark: darkMatch ? darkMatch[1].trim() : undefined,
    };
  }

  function applySlots(slots) {
    document.querySelectorAll("[data-md]").forEach(function (el) {
      const key = el.getAttribute("data-md");
      const raw = slots[key];
      if (raw === undefined) {
        console.warn('content.md: missing "<!-- slot: ' + key + ' -->" block');
        return;
      }
      const tag = el.tagName;
      if (tag === "H1" || tag === "H2" || tag === "H3") {
        el.innerHTML = mdInline(stripHeadingMarker(raw.trim()));
      } else if (tag === "OL" || tag === "UL") {
        // The real <ol>/<ul> is already in the page -- take just the
        // <li> items out of mdBlock's output rather than nesting a list.
        el.innerHTML = mdBlock(raw).replace(/^<(ol|ul)>/, "").replace(/<\/(ol|ul)>$/, "");
      } else {
        el.innerHTML = mdBlock(raw);
      }
    });

    document.querySelectorAll("[data-md-img]").forEach(function (el) {
      const key = el.getAttribute("data-md-img");
      const raw = slots[key];
      if (raw === undefined) {
        console.warn('content.md: missing "<!-- slot: ' + key + ' -->" block');
        return;
      }
      const img = parseImage(raw);
      if (!img) {
        console.warn('content.md: "' + key + '" has no ![alt](src) image');
        return;
      }
      el.src = img.src;
      el.alt = img.alt;

      // "position: left"/"right" floats the figure with text wrapping
      // beside it; "center" (the default) removes both modifier classes,
      // restoring today's centred, non-floated layout.
      const figure = el.closest("figure");
      if (figure) {
        figure.classList.remove("fig-left", "fig-right");
        if (img.position === "left" || img.position === "right") {
          figure.classList.add("fig-" + img.position);
        }
      }

      // Optional "dark:" line -- points a sibling <img data-md-img-dark=
      // "same-key"> (the ".theme-only-dark" half of the pair, see
      // index.html) at the dark-theme replacement image. Same alt text as
      // the light image; nothing to do if this slot has no "dark:" line or
      // no matching element exists on the page.
      if (img.dark) {
        const darkEl = document.querySelector('[data-md-img-dark="' + key + '"]');
        if (darkEl) {
          darkEl.src = img.dark;
          darkEl.alt = img.alt;
        }
      }
    });
  }

  // Moves the page's top-level <section data-section-group="name">
  // elements (inside <main>) into the order "order" lists -- i.e. the
  // order "<!-- section: name -->" markers appeared in content.md. Some
  // names (e.g. "overview") mark more than one <section> -- content.md's
  // Overview block reads as one continuous flow on the page even though
  // it's three <section>s under the hood -- they move together, keeping
  // their own relative order. The hero (no data-section-group) and the
  // footer (outside <main>) are never touched, so they always stay first
  // and last respectively.
  //
  // A group on the page that content.md never mentions keeps its default
  // position (appended after every explicitly-ordered group, in its
  // original document order) rather than disappearing; an unrecognised
  // name in content.md, or a repeated one, is ignored. Both cases warn to
  // the console so a typo/missed marker is easy to spot.
  function reorderSections(order) {
    const main = document.getElementById("main");
    if (!main) return;

    const domGroups = [];
    main.querySelectorAll("[data-section-group]").forEach(function (el) {
      const name = el.getAttribute("data-section-group");
      if (domGroups.indexOf(name) === -1) domGroups.push(name);
    });

    const seen = {};
    const finalOrder = [];
    order.forEach(function (name) {
      if (seen[name]) return;
      if (domGroups.indexOf(name) === -1) {
        console.warn(
          'content.md: "<!-- section: ' + name + ' -->" doesn\'t match any data-section-group on the page -- ignored'
        );
        return;
      }
      seen[name] = true;
      finalOrder.push(name);
    });
    domGroups.forEach(function (name) {
      if (seen[name]) return;
      console.warn(
        'content.md: no "<!-- section: ' + name + ' -->" marker -- "' + name + '" keeps its default position'
      );
      finalOrder.push(name);
    });

    finalOrder.forEach(function (name) {
      main.querySelectorAll('[data-section-group="' + name + '"]').forEach(function (el) {
        main.appendChild(el);
      });
    });
  }

  function loadContent() {
    return fetch("content.md")
      .then(function (res) {
        if (!res.ok) throw new Error("content.md responded " + res.status);
        return res.text();
      })
      .then(function (text) {
        const parsed = parseContentMd(text);
        applySlots(parsed.slots);
        reorderSections(parsed.sectionOrder);
      })
      .catch(function (err) {
        console.error("Failed to load content.md:", err);
        document.querySelectorAll("[data-md]").forEach(function (el) {
          el.textContent =
            "Content failed to load. If you're previewing locally, " +
            "serve this folder over http:// (not file://) -- see README.md.";
        });
      });
  }

  // Exposed for main.js to call as part of its init sequence.
  window.loadContent = loadContent;
})();
