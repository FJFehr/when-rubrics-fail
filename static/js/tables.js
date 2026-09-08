/**
 * ============================================================================
 * TABLE LOADER — a generic engine for turning a standard Markdown table
 * into a styled <table> on the page. Not specific to the taxonomy table:
 * any table anywhere on the page (now or later) can use this by pointing
 * an empty <table data-md-table="path/to/file.md"> at a Markdown file of
 * its own. This runs in the browser at page load, same as content.js.
 * ============================================================================
 *
 * The source file is a standard GitHub-Flavored-Markdown table:
 *
 *   | Clinical Error | Description | Example |
 *   | --- | --- | --- |
 *   | Evidence fabrication | The model cites ... | A recent medical study ... |
 *
 * Any Markdown renderer (including GitHub's own preview) displays this as
 * a normal table -- nothing here is a custom format. A leading HTML
 * comment (like content.md's own header) is fine; it's stripped before
 * parsing. Cell formatting: **bold**, *italic*, ~~strikethrough~~, `code`
 * -- the same inline subset content.js uses. A literal "|" inside a cell
 * must be escaped as "\|".
 *
 * Styling: every table this loader renders gets the .md-table look
 * (zebra striping, a bold/serif first column, `em`/`s` emphasis coloured
 * to match the rest of the page) from the CSS in index.html -- add
 * class="md-table" is not required, the loader adds it automatically.
 */

(function () {
  "use strict";

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Inline formatting only -- same subset as content.js's mdInline, plus
  // ~~strikethrough~~ (tables need it for the taxonomy's "superseded
  // value" examples; content.md hasn't needed it so far).
  function mdInline(text) {
    let s = escapeHtml(text);
    s = s.replace(/~~(.+?)~~/g, "<s>$1</s>");
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    s = s.replace(/`(.+?)`/g, "<code>$1</code>");
    return s;
  }

  // Splits one "| a | b |" row into ["a", "b"], honouring "\|" as a
  // literal pipe rather than a column break.
  function splitRow(line) {
    let s = line.trim();
    if (s.startsWith("|")) s = s.slice(1);
    if (s.endsWith("|")) s = s.slice(0, -1);
    const cells = [];
    let current = "";
    for (let i = 0; i < s.length; i++) {
      if (s[i] === "\\" && s[i + 1] === "|") {
        current += "|";
        i++;
        continue;
      }
      if (s[i] === "|") {
        cells.push(current.trim());
        current = "";
        continue;
      }
      current += s[i];
    }
    cells.push(current.trim());
    return cells;
  }

  // header row, then a "---" separator row, then one data row per line.
  function parseMarkdownTable(raw) {
    const withoutComments = raw.replace(/<!--[\s\S]*?-->/g, "");
    const lines = withoutComments
      .split("\n")
      .map(function (l) {
        return l.trim();
      })
      .filter(function (l) {
        return l.length > 0;
      });
    if (lines.length < 2) return null;

    const headers = splitRow(lines[0]);
    const separator = splitRow(lines[1]);
    const looksLikeSeparator = separator.every(function (c) {
      return /^:?-{1,}:?$/.test(c);
    });
    if (!looksLikeSeparator) return null;

    const rows = lines.slice(2).map(splitRow);
    return { headers: headers, rows: rows };
  }

  function renderTable(el, markdown) {
    const parsed = parseMarkdownTable(markdown);
    if (!parsed) {
      console.error(
        "tables.js: " + (el.getAttribute("data-md-table") || "") +
        " doesn't look like a Markdown table (header row + \"---\" row + data rows)."
      );
      return;
    }

    el.classList.add("md-table");
    el.innerHTML = "";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    parsed.headers.forEach(function (h) {
      const th = document.createElement("th");
      th.scope = "col";
      th.innerHTML = mdInline(h);
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    el.appendChild(thead);

    const tbody = document.createElement("tbody");
    parsed.rows.forEach(function (cells) {
      const tr = document.createElement("tr");
      cells.forEach(function (cell, i) {
        const td = document.createElement("td");
        // First column reads as the row's label/term (bold, compact) --
        // a reasonable default for most tables; override with your own
        // CSS on a specific table if a given one doesn't fit that shape.
        if (i === 0) td.className = "md-table-key";
        td.innerHTML = mdInline(cell);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    el.appendChild(tbody);
  }

  function loadTables() {
    const tables = Array.from(document.querySelectorAll("[data-md-table]"));
    return Promise.all(
      tables.map(function (el) {
        const src = el.getAttribute("data-md-table");
        return fetch(src)
          .then(function (res) {
            if (!res.ok) throw new Error(src + " responded " + res.status);
            return res.text();
          })
          .then(function (text) {
            renderTable(el, text);
          })
          .catch(function (err) {
            console.error("Failed to load table " + src + ":", err);
            el.innerHTML =
              '<tbody><tr><td>Table failed to load. If you\'re previewing ' +
              "locally, serve this folder over http:// (not file://) -- " +
              "see README.md.</td></tr></tbody>";
          });
      })
    );
  }

  // Exposed for main.js to call as part of its init sequence.
  window.loadTables = loadTables;
})();
