# Build 006 verification — 8 November 2026

- Strict TypeScript: passed.
- Vitest: 40 tests across seven files passed. Includes legacy-schema/approved-page compatibility, page-size presets/custom dimensions, proportional layout changes, grid/edge snapping, resize/history/layer operations, logical activity undo/redo, bounds/overlap protection, imported SVG rejection, independent rights gates, PNG physical resolution, bounded export retries and existing puzzle/storage/print/progression/queue regressions. Existing tests still generate 150 seed-validated primary puzzles.
- Local Playwright: eleven workflows passed. Covers adventure CRUD/reload; five-mechanic Puzzle Lab; legacy scene layers; real PDF/PNG review export; queue completion/reload; explicit migration/page approval/publication export; a complete blank A4 page built through drag/drop, actual resize handles, scenery, text/font editing, undo/redo, save/reload/validation/approval/export; asset import/rights review/reuse; and unsaved draft recovery with keyboard operations and monochrome preview.
- Production Worker build: passed. Existing upstream sourcemap/dynamic-import warnings remain; no compile errors.
- Real PDFs: Build 006 A4 player/answer pages rendered and checked with PyMuPDF. Exact 595.2756 × 841.8898 pt media boxes; embedded Fredoka Medium, Nunito Medium and Open Sans; all text and drawings within page bounds. See artifacts/build-006/pdf-verification.json. Legacy print tests still pass.
- Desktop/focus/tablet inspection: 1600×1100 and 820×1180 captures produced no browser errors or document overflow. Screenshots live under docs/screenshots/build-006-*.png.
- Dependency installation audit: zero vulnerabilities.
- Live Build 006 staging: all eleven workflows passed on final version 56b622ed-9775-4ba0-884b-d9c8c89acfbd, including forced-capacity browser rendering and confirmation that validation failures cannot trigger fallback. Final live A4 PDFs embed all three fonts and pass dimension/text/path bounds checks; PNG is 2480×3508 at 300 DPI and editor overlays are absent. See artifacts/build-006/live-verification.json.

The export client retries network/5xx capacity failures once after 1.5 seconds; 4xx validation/approval failures are never retried or bypassed. Repeated platform errors show a clear retry/smaller-package message instead of a JSON parsing error.

Reproduce: npm ci; npm run typecheck; npm test; npm run build; npm run e2e. Visual print fixture: node --import tsx scripts/export-visual-prototype.ts. Actual PDF checks: scripts/verify-visual-pdfs.py with PyMuPDF. Screenshots: node scripts/capture-build-006.mjs (optional STAGING_URL). Live browser suite: STAGING_URL=https://adventure-studio-staging.garetha81.workers.dev npm run e2e.

Test approval records exist only in isolated browser fixtures; they are not owner artwork/publication approval. Build 005 results and commit history remain in docs/build-reports/FINAL-REPORT.md.

The shared export pipeline now accepts either the Node/Worker PDFKit engine or the lazy-loaded browser PDFKit engine. After transient retries, Worker/network capacity failures use local rendering with identical schema, puzzle, layout, provenance and approval validation. A forced-503 browser test verifies the three-font A4 package; a forced-400 test verifies that validation errors cannot invoke fallback. Real browser-generated PDFs also passed dimension, embedded-font and bounds inspection.
