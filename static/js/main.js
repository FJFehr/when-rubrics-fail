/**
 * ============================================================================
 * TEMPLATE LOGIC
 * ============================================================================
 * Fetches authors.yaml / links.yaml / citation.bib (parsing the YAML files
 * with static/js/yaml-lite.js) and renders them into the page, along with
 * the title (static/js/theme.js). The taxonomy table and content.md's
 * prose/figures are each handled by their own loader (static/js/tables.js,
 * static/js/content.js respectively) -- this file just calls them as part
 * of its init sequence below. Also drives the small bits of interactivity:
 * theme toggle, smooth-scroll nav with scroll-spy, a scroll-progress bar,
 * and copy-to-clipboard for the BibTeX block. No frameworks, no build step.
 * ============================================================================
 */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * Theme: persisted in localStorage, falls back to prefers-color-scheme.
   * The inline <script> in <head> already set the initial theme before
   * first paint to avoid a flash; this wires up the toggle button.
   * ------------------------------------------------------------------- */
  function initThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    function currentTheme() {
      return document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    }

    function reflectButton(theme) {
      const isDark = theme === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
      btn.textContent = isDark ? "☀" : "☾";
    }

    reflectButton(currentTheme());

    btn.addEventListener("click", function () {
      const next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* localStorage unavailable (private mode etc.) -- theme still
           applies for this page view, it just won't persist. */
      }
      // Re-apply THEME's colours for the new mode (static/js/theme.js) --
      // the inline custom properties set at boot would otherwise never
      // change again, since they take precedence over the stylesheet's
      // own [data-theme="dark"] rule regardless of the attribute.
      if (typeof applyTheme === "function") applyTheme(next);
      reflectButton(next);
    });
  }

  /* ---------------------------------------------------------------------
   * Title -- rendered from static/js/theme.js (THEME.title). The <head>
   * meta tags and citation.bib duplicate this as static text (crawlers
   * and BibTeX don't run JS) and must be kept in sync by hand.
   * ------------------------------------------------------------------- */
  function renderTitle() {
    if (typeof THEME === "undefined" || !THEME.title) return;
    document.title = THEME.title.full;
    const heroTitle = document.getElementById("hero-title");
    if (heroTitle) heroTitle.textContent = THEME.title.full;
    const wordmark = document.getElementById("wordmark");
    if (wordmark) wordmark.textContent = THEME.title.short;
  }

  /* ---------------------------------------------------------------------
   * Authors, affiliation, correspondence -- rendered from authors.yaml
   * (fetched by loadAuthorsAndLinks below); the <noscript> fallback stays
   * as a plain-text safety net for non-JS agents.
   * ------------------------------------------------------------------- */
  function renderAuthors(authors) {
    const list = document.getElementById("author-list");
    if (!list || !authors) return;

    list.innerHTML = "";
    authors.forEach(function (author, i) {
      const li = document.createElement("li");
      li.className = "author";

      if (author.url) {
        const a = document.createElement("a");
        a.href = author.url;
        a.textContent = author.name;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        li.appendChild(a);
      } else {
        const span = document.createElement("span");
        span.textContent = author.name;
        span.className = "author-noLink";
        li.appendChild(span);
      }

      if (author.equalContribution) {
        const sup = document.createElement("sup");
        sup.textContent = "*";
        sup.setAttribute("aria-label", "equal contribution");
        li.appendChild(sup);
      }

      if (i < authors.length - 1) {
        const sep = document.createElement("span");
        sep.className = "author-sep";
        sep.setAttribute("aria-hidden", "true");
        sep.textContent = ",";
        li.appendChild(sep);
      }

      list.appendChild(li);
    });

    const hasEqual = authors.some(function (a) {
      return a.equalContribution;
    });
    const note = document.getElementById("equal-contribution-note");
    if (note) note.hidden = !hasEqual;
  }

  // Affiliation is shown as logos only (no visible institution text), so
  // affiliation's strings become the images' accessible names instead of
  // visible text nodes.
  function renderAffiliation(affiliation) {
    if (!affiliation) return;
    const oxfordLogo = document.getElementById("oxford-logo");
    if (oxfordLogo && affiliation.institution) {
      oxfordLogo.alt = affiliation.institution;
    }

    const wrap = document.getElementById("oxai-logo-wrap");
    if (wrap) {
      wrap.hidden = !affiliation.groupName;
      if (affiliation.groupName) {
        wrap.querySelectorAll("img").forEach(function (img) {
          img.alt = affiliation.groupName;
        });
      }
    }
  }

  function renderCorrespondence(correspondence) {
    if (!correspondence) return;
    const nameEl = document.getElementById("correspondence-name");
    const emailEl = document.getElementById("correspondence-email");
    if (nameEl) {
      nameEl.textContent = correspondence.name || "[CORRESPONDING AUTHOR]";
    }
    if (emailEl) {
      if (correspondence.email) {
        emailEl.textContent = correspondence.email;
        emailEl.href = "mailto:" + correspondence.email;
      } else {
        emailEl.textContent = "[EMAIL]";
        emailEl.removeAttribute("href");
      }
    }
  }

  // Inline so it can be recoloured with `fill="currentColor"` and follow
  // the button's text colour in both themes -- an <img> couldn't do that.
  // Source: static/logos/github.svg (svgrepo.com, generic GitHub mark).
  const ICON_GITHUB =
    '<svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M12,2A10,10,0,0,0,8.84,21.5c.5.08.66-.23.66-.5V19.31C6.73,19.91,6.14,18,6.14,18A2.69,2.69,0,0,0,5,16.5c-.91-.62.07-.6.07-.6a2.1,2.1,0,0,1,1.53,1,2.15,2.15,0,0,0,2.91.83,2.16,2.16,0,0,1,.63-1.34C8,16.17,5.62,15.31,5.62,11.5a3.87,3.87,0,0,1,1-2.71,3.58,3.58,0,0,1,.1-2.64s.84-.27,2.75,1a9.63,9.63,0,0,1,5,0c1.91-1.29,2.75-1,2.75-1a3.58,3.58,0,0,1,.1,2.64,3.87,3.87,0,0,1,1,2.71c0,3.82-2.34,4.66-4.57,4.91a2.39,2.39,0,0,1,.69,1.85V21c0,.27.16.59.67.5A10,10,0,0,0,12,2Z"/>' +
    "</svg>";
  // Hugging Face's mark is multicolour, so it stays a small <img> rather
  // than an inlined/recolourable SVG. Source: static/logos/huggingface.png.
  const ICON_HUGGINGFACE =
    '<img class="btn-icon" src="static/logos/huggingface.png" alt="" width="16" height="16">';
  // arXiv's wordmark is two fixed brand colours, so (like Hugging Face) it
  // stays an <img>. It's wider than the square icons, hence the dedicated
  // class. Source: static/logos/arxiv.svg.
  const ICON_ARXIV =
    '<img class="btn-icon btn-icon-arxiv" src="static/logos/arxiv.svg" alt="">';

  /* ---------------------------------------------------------------------
   * Resource buttons -- arXiv / Code / Hugging Face / Cite. All three
   * platform buttons show only their logo (no visible caption -- the
   * label is kept for screen readers via .visually-hidden). Without a
   * URL, a button renders as an inert, non-clickable span rather than a
   * fake link; add the URL to links.yaml and it becomes a real link
   * automatically, same markup either way.
   * ------------------------------------------------------------------- */
  function renderResourceButtons(links) {
    const container = document.getElementById("resource-buttons");
    if (!container || !links) return;

    function makeButton(label, url, opts) {
      opts = opts || {};
      const icon = opts.icon || "";
      const textClass = opts.iconOnly ? "visually-hidden" : "";
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.className = "btn";
        if (!opts.internal) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        a.innerHTML = icon + '<span class="' + textClass + '">' + label + "</span>";
        return a;
      }
      const span = document.createElement("span");
      span.className = "btn btn-disabled";
      span.setAttribute("aria-disabled", "true");
      span.innerHTML = icon + '<span class="' + textClass + '">' + label + "</span>";
      return span;
    }

    container.appendChild(
      makeButton("arXiv", links.arxiv, {
        icon: ICON_ARXIV,
        iconOnly: true,
      })
    );
    container.appendChild(
      makeButton("Code", links.code, {
        icon: ICON_GITHUB,
        iconOnly: true,
      })
    );
    container.appendChild(
      makeButton("Dataset", links.dataset, {
        icon: ICON_HUGGINGFACE,
        iconOnly: true,
      })
    );

    const citeBtn = document.createElement("a");
    citeBtn.href = "#cite";
    citeBtn.className = "btn btn-cite";
    citeBtn.textContent = "Cite";
    container.appendChild(citeBtn);
  }

  /* ---------------------------------------------------------------------
   * BibTeX block + copy button. `bibtex` is the raw text fetched from
   * citation.bib (see loadCitation below) -- no parsing needed, it's
   * dropped straight into the <pre> as-is.
   * ------------------------------------------------------------------- */
  function renderBibtex(bibtex) {
    const pre = document.getElementById("bibtex-block");
    if (pre && bibtex) {
      pre.textContent = bibtex;
    }

    const copyBtn = document.getElementById("copy-bibtex-btn");
    if (!copyBtn || !bibtex) return;

    const defaultLabel = copyBtn.textContent;
    copyBtn.addEventListener("click", function () {
      copyText(bibtex)
        .then(function () {
          copyBtn.textContent = "✓ Copied";
          copyBtn.classList.add("copied");
          setTimeout(function () {
            copyBtn.textContent = defaultLabel;
            copyBtn.classList.remove("copied");
          }, 2000);
        })
        .catch(function () {
          copyBtn.textContent = "Copy failed. Select manually.";
          setTimeout(function () {
            copyBtn.textContent = defaultLabel;
          }, 2500);
        });
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Some browsers/policies expose the API but still reject the call
      // (permissions policy, embedding restrictions, etc.) -- fall back to
      // execCommand in that case too, rather than only when the API is
      // entirely absent.
      return navigator.clipboard.writeText(text).catch(function () {
        return legacyCopy(text);
      });
    }
    return legacyCopy(text);
  }

  // Fallback for browsers without (or that reject) the async Clipboard API.
  function legacyCopy(text) {
    return new Promise(function (resolve, reject) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("execCommand copy failed"));
      } catch (err) {
        reject(err);
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Keeps --header-height (see html's scroll-padding-top in index.html)
   * equal to the sticky header's actual rendered height, so a jump to any
   * #section/#heading lands just below it instead of partly hidden
   * underneath. Re-measured on resize since the header wraps to two rows
   * on narrow screens (see the .nav-inner responsive rule), which changes
   * its height.
   * ------------------------------------------------------------------- */
  function updateHeaderHeightVar() {
    const header = document.querySelector("header.site-header");
    if (!header) return;
    // getBoundingClientRect (fractional) rather than offsetHeight (rounds
    // to the nearest integer px) -- avoids a target landing a sub-pixel
    // above the header's true bottom edge. +8px is just breathing room,
    // so a jumped-to heading isn't flush against the header.
    const height = header.getBoundingClientRect().height + 8;
    document.documentElement.style.setProperty("--header-height", height + "px");
  }

  /* ---------------------------------------------------------------------
   * Smooth scroll (respecting reduced-motion), active-section nav
   * highlighting, and a thin scroll-progress bar.
   * ------------------------------------------------------------------- */
  function initScrolling() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    updateHeaderHeightVar();
    window.addEventListener("resize", updateHeaderHeightVar);

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        const id = link.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        history.pushState(null, "", "#" + id);
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });

    const navLinks = Array.from(
      document.querySelectorAll("#site-nav a[href^='#']")
    );
    const sections = navLinks
      .map(function (link) {
        return document.getElementById(link.getAttribute("href").slice(1));
      })
      .filter(Boolean);

    if (sections.length && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            const link = navLinks.find(function (l) {
              return l.getAttribute("href") === "#" + entry.target.id;
            });
            if (!link) return;
            if (entry.isIntersecting) {
              navLinks.forEach(function (l) {
                l.removeAttribute("aria-current");
              });
              link.setAttribute("aria-current", "true");
            }
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach(function (s) {
        observer.observe(s);
      });
    }

    const progressBar = document.getElementById("scroll-progress");
    if (progressBar) {
      const update = function () {
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - doc.clientHeight;
        const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
        progressBar.style.width = pct + "%";
      };
      document.addEventListener("scroll", update, { passive: true });
      update();
    }
  }

  /* ---------------------------------------------------------------------
   * Fetch + parse a YAML-lite file (see static/js/yaml-lite.js for the
   * supported subset) and hand back the parsed object.
   * ------------------------------------------------------------------- */
  function loadYaml(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error(path + " responded " + res.status);
      return res.text();
    }).then(parseYamlLite);
  }

  // authors.yaml -> author list, affiliation, correspondence.
  // links.yaml -> resource buttons (arXiv / Code / Dataset).
  function loadAuthorsAndLinks() {
    loadYaml("authors.yaml").then(function (data) {
      renderAuthors(data.authors || []);
      renderAffiliation(data.affiliation || {});
      renderCorrespondence(data.correspondence || {});
    }).catch(function (err) {
      console.error("Failed to load authors.yaml:", err);
    });

    loadYaml("links.yaml").then(function (data) {
      renderResourceButtons(data || {});
    }).catch(function (err) {
      console.error("Failed to load links.yaml:", err);
    });
  }

  // citation.bib -> BibTeX block + copy button. Plain text, no parsing.
  function loadCitation() {
    fetch("citation.bib").then(function (res) {
      if (!res.ok) throw new Error("citation.bib responded " + res.status);
      return res.text();
    }).then(renderBibtex).catch(function (err) {
      console.error("Failed to load citation.bib:", err);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initThemeToggle();
    renderTitle();
    initScrolling();
    // Async: each fetches its own file(s) and renders independently, so
    // one failing (see the .catch handlers above/in content.js/tables.js)
    // doesn't block the others.
    loadAuthorsAndLinks();
    loadCitation();
    if (typeof window.loadContent === "function") {
      window.loadContent();
    }
    if (typeof window.loadTables === "function") {
      window.loadTables();
    }
  });
})();
