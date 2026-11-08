# Adventure Studio
Puzzle-first production workspace for Explore, Colour & Solve.

Node 24.22+ recommended (Cloudflare CLI requirement). Install with `npm ci`; run `npm run dev` at http://127.0.0.1:3000. `npm test`, `npm run typecheck`, `npm run build`, `npm run e2e` verify the project. Cloudflare staging deployment: `npm run deploy` with authenticated cf CLI. No paid art provider is enabled.

See docs/CODEX-BRIEF.md and docs/EXECUTION-AUTHORISATION.md for scope and authorisation. Human review is required before publication.

Open Publishing to download a review package or the static five-page prototype/answer PDFs. Publication export requires explicit per-page review notes and page/art approval. The original SVG art is deliberately marked as a prototype pending owner review.

`npm run prototype` regenerates both print-profile packages under `artifacts/enchanted-kingdom/` and publishes sample PDFs into `apps/studio/public/prototype/`. `scripts/verify-pdfs.py` checks and renders the actual PDFs with PyMuPDF. See docs/TEST-REPORT.md, docs/VISUAL-QA.md and docs/KNOWN-LIMITATIONS.md for verified scope.
