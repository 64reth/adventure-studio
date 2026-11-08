# Print specification
Coordinates are inches from the trim rectangle. No bleed: 8.5 × 11 inches (612 × 792 points). KDP bleed: 8.625 × 11.25 inches (621 × 810 points). Top/bottom and outside bleed extend 0.125 inches; odd pages have inside on the left, even pages on the right. The design inset is 0.385 inches from trim, increased at the binding where required.

Minimum gutter in inches: up to 150 pages 0.375; 151–300 0.5; 301–500 0.625; 501–700 0.75; 701–828 0.875. Use the final page count. Printer limits for the final trim/paper combination still require review.

Sources checked 2026-11-08: [KDP trim, bleed and margins](https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6), [paperback submission](https://kdp.amazon.com/en_US/help/topic/G201857950).

PDFKit composes editable SVG geometry with embedded OFL Open Sans. SVG root inch units are converted to point units before SVG-to-PDFKit to avoid a 4/3 scale error. Review PDFs carry an explicit review footer. PDF verification uses PyMuPDF to inspect every real page, fonts and bounding boxes and render all player and answer pages. PNG previews are 300 DPI; vectors retain resolution independence. Fonts ship with their licence.

The five-page sample is a review prototype, not a complete KDP manuscript. Human artwork, difficulty and printed proof review remain mandatory.

Build 006 visual pages add Letter, A4, A5, 8.5-inch square, 6×9 and custom trim (3–18 inches per dimension), orientation exchange, 0–0.25-inch bleed, independent inside/outside/top/bottom margins, configurable inset/gutter and 150–600 DPI previews. Saved visual settings control their PDF media/trim/bleed boxes, including mixed-size adventures. Existing legacy profiles and their exports are preserved. The default remains 8.5×11 trim, 0.385 inset, with optional 8.625×11.25 bleed canvas.

The example at artifacts/build-006 is an A4 mixed-font, monochrome visual composition. Its PDF inspection checks dimensions, all three embedded fonts and text/drawing bounds. Individual pages retain vector puzzle geometry. Page-layout grids and editor chrome never appear in outputs. User approval and physical print proofing remain required; a print-safe canvas is not an assurance that every custom trim is accepted by a particular printer.
