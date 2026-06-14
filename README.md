# Arch Portfolio

A professional architectural portfolio builder for architecture students and
graduates. Enter your info, skills, CV, and projects (with plans, elevations,
sections, renders), get an AI review of your work, then preview and export a
polished multi-page PDF — all stored locally in your browser.

Built with **React (Vite) · Tailwind CSS · React Router · Zustand · jsPDF + html2canvas**.

## Getting started

Requires **Node.js 18+**.

```bash
npm install
cp .env.example .env     # then add your GEMINI_API_KEY
npm run dev:all          # runs the Vite client + the Gemini API server together
```

Open the URL Vite prints (default http://localhost:5173). The client proxies
`/api/*` to the backend on port 3001.

You can also run the two processes separately:

```bash
npm run dev        # client only (http://localhost:5173)
npm run server     # Gemini API backend only (http://localhost:3001)
```

Production (single origin — the server serves the built client + the API):

```bash
npm run build      # build the client into dist/
npm run server     # serves dist/ and /api on PORT (default 3001)
```

## Running on Replit

1. Upload all files (or import this folder).
2. In the Shell: `npm install`.
3. Add **GEMINI_API_KEY** in the Secrets panel (and optionally `GEMINI_MODEL`, `PORT`).
4. Run `npm run dev:all` (client + API). Open the web preview.

## Features

- **Student Info / About Me** — profile fields, photo upload, bio & philosophy.
- **Skills** — categorized skills with proficiency sliders.
- **CV / Résumé** — education, experience, awards, publications, volunteer work.
- **Projects** (core) — unlimited projects, each with Overview, Concept, Plans,
  Elevations, Sections and Shots. Every drawing sub-section accepts **images or
  PDFs**, and all lists are add/remove-able.
- **AI Review** — attach design images (or load them from a project) plus an
  optional description; Gemini analyzes them together and returns strengths,
  improvements, design concepts and presentation notes.
- **Portfolio Review** — a holistic Gemini evaluation of the whole portfolio,
  including representative project images.
- **Portfolio Builder** — reorder / show-hide sections, pick a font pair and
  color theme, live preview.
- **Export PDF** — high-resolution A4 multi-page PDF.
- **Book Preview** — flipbook viewer with keyboard nav and fullscreen.
- **Style Panel** — floating ⚙ button (bottom-right) to change fonts, colors,
  size and dark/light mode live across the whole app.

All data persists automatically in the browser's `localStorage`.

## Google Gemini integration

Gemini runs through a small **Node/Express backend** so the API key stays
server-side and is never shipped to the browser.

- **Server** — [server/index.js](server/index.js) exposes `POST /api/gemini`
  (and `GET /api/gemini/health`). [server/geminiService.js](server/geminiService.js)
  loads `GEMINI_API_KEY` from `.env` via **dotenv** and calls the Gemini REST API
  (`generativelanguage.googleapis.com`) with `fetch`. The key is **never hardcoded**.
  Default model is `gemini-2.5-flash` with "thinking" disabled for fast, complete
  JSON. (Note: `gemini-2.0-flash` has no free-tier quota on some projects.)
- **Client** — [src/utils/gemini.js](src/utils/gemini.js) calls `/api/gemini`
  (no key in the browser). It powers the **AI Review** and **Portfolio Review**
  pages, which do multimodal (image + text) analysis. Pass images with
  `generateText(prompt, { images: [dataUrl, …] })`.
- **Wiring** — in dev, Vite proxies `/api` → `http://localhost:3001`
  (see `vite.config.js`). In production the server also serves the built client.

Setup:

1. `cp .env.example .env` and set your key (get one at
   https://aistudio.google.com/apikey):
   ```
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-2.0-flash   # optional
   PORT=3001                       # optional
   ```
   On **Replit**, add `GEMINI_API_KEY` as a Secret instead of a file.
2. Run `npm run dev:all` (client + API).

Server usage:

```js
import { generateContent } from './server/geminiService.js'
const text = await generateContent({ prompt: 'Critique this design', images })
```

> `.env` is git-ignored so the key is never committed. Because the key lives only
> on the server, it is not exposed in the client bundle.

## Project structure

```
server/         Express backend (Gemini API key stays here)
  index.js        /api/gemini + /api/gemini/health, serves dist/ in prod
  geminiService.js dotenv + @google/generative-ai, reads GEMINI_API_KEY
src/
  components/   Sidebar, StylePanel, ImageUploader, MediaUploader, PDFUploader,
                SkillSlider, ProjectCard, MediaSection, PortfolioPages, FlipBook…
  pages/        StudentInfo, AboutMe, Skills, CV, Projects, AIReview,
                PortfolioReview, PortfolioBuilder, ExportPDF, BookPreview
  pages/project/ ProjectDetail + Overview/Concept/Plans/Elevations/Sections/Shots
  store/        usePortfolioStore.js (Zustand + persist)
  utils/        localStorage.js, themes.js, exportPDF.js, gemini.js (calls /api),
                portfolioImages.js
  styles/       globals.css
.env            GEMINI_API_KEY (git-ignored)
```
