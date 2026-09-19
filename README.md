# Module 5 — Digital Techniques Mock Exam

A bilingual (English/Thai) self-study site for the EASA Part-66 CAT-B1/CAT-B2
**Module 5 (Digital Techniques)** final exam, built from a 40-question
book-referenced analysis.

Live structure, once deployed:

```
module5-mock-exam/
├── index.html          — the mock exam (interactive, scored)
├── cheat-sheet.html     — the full bilingual Q&A reference (static)
├── assets/
│   ├── style.css        — cockpit-instrument theme (amber/cyan on near-black)
│   └── quiz.js          — shuffle, scoring, and rendering logic
├── data/
│   └── questions.json   — the 40-question bank (single source of truth)
└── README.md
```

## Features

- **40 questions**, each with 4 answer choices, drawn from the original
  book-based exam analysis (B1/B2 Module 5 texts).
- **Fisher-Yates shuffle** — both question order and each question's option
  order are reshuffled every time you press *Reshuffle & Restart*, so you
  don't memorize answer positions.
- **Bilingual EN/TH** — every question, option, and explanation has a Thai
  translation. Toggle it on/off with the **TH** switch in the top bar.
- **75% pass threshold** (30/40) — matches the pass mark used across the
  other module mock exams.
- **Collapsible explanations** — after submitting, click *Show Explanation*
  on any question to see the book reference and reasoning, in both
  languages.
- **Flagged / VERIFY items** — a few questions (colour-coding on EICAS, the
  DO-178 Level A failure rate, the IFE software level, and the two
  no-choices-given memory questions) are marked `VERIFY` because the
  uploaded book text doesn't explicitly confirm the answer. Treat those as
  best-effort, not guaranteed, and check them against instructor material.

## Running it

**On GitHub Pages** (recommended — matches the other Part-66 module sites):

1. Create a new repository (or a folder inside your existing
   `devpb412022.github.io` repo), e.g. `module5-mock-exam`.
2. Copy all the files in this folder into it, preserving the folder
   structure above.
3. Commit and push.
4. If it's a project repo, enable **Settings → Pages → Deploy from branch**
   and pick `main` / root. If it lives inside `devpb412022.github.io`
   directly, it's served automatically at
   `https://devpb412022.github.io/module5-mock-exam/`.

**Locally, before pushing:** because `index.html` loads `data/questions.json`
with `fetch()`, opening the file directly by double-click will fail in some
browsers (blocked by CORS on `file://`). Serve the folder instead:

```bash
cd module5-mock-exam
python3 -m http.server 8000
# then open http://localhost:8000
```

## Updating questions

Everything the quiz shows is generated from `data/questions.json`. Each
entry looks like:

```json
{
  "id": 1,
  "en": "English question text",
  "th": "Thai question text",
  "options": [{ "en": "...", "th": "..." }, ...],
  "correct": 0,
  "analysis_en": "...",
  "analysis_th": "...",
  "reference": "B1 p.xxx; B2 p.xxx — Section name",
  "flagged": false
}
```

Add, edit, or re-order entries there — `index.html` and `cheat-sheet.html`
both read from it (the cheat sheet is a static render of the same data, so
regenerate it if you change the JSON — or edit it by hand for small fixes).

To lock in the real answer choices for Q22 and Q23 (the exam PDF gave no
options for these two), replace their `options` arrays with the actual
choices once you have them, and adjust `correct` accordingly.
