# Sanjeevani AI
### Voice-first, multilingual polypharmacy safety companion
**PHARMINNO QUEST 2026 — Karpagam Academy of Higher Education**

## The problem
Millions of Indians — especially elderly and chronic-disease patients — take
medicines prescribed by multiple doctors with no single check for dangerous
drug interactions, wrong dosing, or duplicate therapy. Existing digital
health apps are built for literate, English-speaking, single-language users,
which leaves out exactly the people most at risk.

## The solution
Sanjeevani AI lets a patient or caregiver add every medicine they're taking
(by typing or by scanning the strip), cross-checks the full list against a
curated clinical drug-interaction database, and explains any risk in plain
language — with voice support — in **English, Hindi, and Tamil**. It also
builds an icon-based daily schedule for low-literacy users and gives
pharmacists/caregivers a one-screen summary for counselling.

## Running it
No install, no build step, no server required.

1. Open `index.html` directly in any modern browser (Chrome, Edge, Firefox,
   Safari) — double-click it or drag it into a browser tab.
2. Pick a language, enter a patient name, and start adding medicines.
3. Try adding **Ramipril** and **Spironolactone** together to see a real
   "severe" interaction alert, or try the fuzzy search with a typo like
   "amlong" or "dolo".

Optional: serving it over a local server (e.g. `python3 -m http.server`)
also works and additionally enables the offline service worker cache.

## What's implemented
- **Fuzzy medicine search** (Levenshtein-based) — tolerant of typos, OCR
  noise, and partial names; matches generic names, common Indian brand
  names, and Hindi/Tamil names.
- **On-device OCR strip scan** via Tesseract.js (loaded from CDN when
  online) — snap/upload a photo of a medicine strip and it's matched
  automatically; degrades gracefully to manual search if offline.
- **Interaction rule engine** — 16 curated, real drug-pair interactions
  (e.g. Warfarin+Aspirin, Ramipril+Spironolactone, Sildenafil+Isosorbide)
  across three severity levels, each with a plain-language explanation and
  recommendation, in three languages.
- **Icon-based daily schedule** — groups medicines into morning / afternoon
  / night with before/after-food tags, designed to be readable without
  fluent literacy.
- **Voice reminders** — uses the browser's built-in Web Speech API
  (`speechSynthesis`), no external API or cost.
- **Pharmacist / caregiver dashboard** — a printable one-screen summary of
  all medicines and flagged interactions for counselling.
- **Offline-first** — a service worker caches the app shell after first
  load; all clinical data ships as plain JS (`data/drugs.js`,
  `data/interactions.js`), so the app works with zero connectivity and no
  backend.

## Project structure
```
index.html              Main app shell (all screens)
css/style.css            Styling (brand palette matches the pitch deck)
js/app.js                 App logic, screen routing, rendering
js/i18n.js                 English / Hindi / Tamil UI strings
js/interactionEngine.js     Fuzzy search + interaction rule engine
data/drugs.js               30-drug catalog (generic, brands, hi/ta names)
data/interactions.js         16 curated drug-pair interaction rules
manifest.json              PWA manifest
sw.js                        Offline service worker
```

## Important note
This is a hackathon prototype. The drug and interaction data is a small,
hand-curated demo set for illustration — **not** a complete or clinically
validated database, and the app is not a substitute for a pharmacist or
doctor. A production version would need a licensed pharmacist to maintain
and expand the interaction database against authoritative references.

## Team
[Your Team Name] — PHARMINNO QUEST 2026
