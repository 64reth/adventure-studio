# Build 006 verification — 8 November 2026

- Strict TypeScript: passed.
- Vitest: 37 tests across six files passed. Includes legacy-schema/approved-page compatibility, page-size presets/custom dimensions, proportional layout changes, grid/edge snapping, resize/history/layer operations, logical activity undo/redo, bounds/overlap protection, imported SVG rejection, independent rights gates, PNG physical resolution and existing puzzle/storage/print/progression/queue regressions. Existing tests still generate 150 seed-validated primary puzzles.
- Local Playwright: nine workflows passed. Covers adventure CRUD/reload; five-mechanic Puzzle Lab; legacy scene layers; real PDF/PNG review export; queue completion/reload; explicit migration/page approval/publication export; a complete blank A4 page built through drag/drop, actual resize handles, scenery, text/font editing, undo/redo, save/reload/validation/approval/export; asset import/rights review/reuse; and unsaved draft recovery with keyboard operations and monochrome preview.
- Production Worker build: passed. Existing upstream sourcemap/dynamic-import warnings remain; no compile errors.
- Real PDFs: Build 006 A4 player/answer pages rendered and checked with PyMuPDF. Exact 595.2756 × 841.8898 pt media boxes; embedded Fredoka Medium, Nunito Medium and Open Sans; all text and drawings within page bounds. See artifacts/build-006/pdf-verification.json. Legacy print tests still pass.
- Desktop/focus/tablet inspection: 1600×1100 and 820×1180 captures produced no browser errors or document overflow. Screenshots live under docs/screenshots/build-006-*.png.
- Dependency installation audit: zero vulnerabilities.
- Live Build 006 staging verification: pending release; recorded after deployment.

Reproduce: npm ci; npm run typecheck; npm test; npm run build; npm run e2e. Visual print fixture: node --import tsx scripts/export-visual-prototype.ts. Actual PDF checks: scripts/verify-visual-pdfs.py with PyMuPDF. Screenshots: node scripts/capture-build-006.mjs (optional STAGING_URL). Live browser suite: STAGING_URL=https://adventure-studio-staging.garetha81.workers.dev npm run e2e.

Test approval records exist only in isolated browser fixtures; they are not owner artwork/publication approval. Build 005 results and commit history remain in docs/build-reports/FINAL-REPORT.md.
