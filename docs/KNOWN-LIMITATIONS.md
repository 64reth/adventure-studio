# Known limitations
- The five-page prototype is ready for owner review; artwork is sparse original procedural SVG, not final commercial illustration. No human playtesting, page approval or legal clearance is claimed.
- Only five primary mechanics are implemented. Difficulty primarily changes maze dimensions. Route deduction is a four-gate clue-code activity. Library OAK key is an explicit reward, not hidden-message extraction. Alternate valid maze/route objectives and secondary mechanics are not implemented.
- The final cipher records earlier discoveries and depends on them in the progression graph; rune decoding itself uses a full substitution key.
- Top-down SVG composition is implemented. Isometric/panoramic scene editing, free landmark placement, imported artwork management and advanced layout templates are not implemented.
- Browser storage is persistent per device/origin, with JSON backup/import. It is not a shared cloud database or cross-device sync. Queue processing requires an open browser tab; interrupted jobs can resume. Concurrent-tab conflict handling is basic revision detection, not collaboration.
- Default chapter is a five-page sequence. Page dependencies, clues, rewards and chapter titles can be edited; elaborate multiple-ending/return-visit tooling is not implemented.
- Five pages are below KDP minimum manuscript length. A physical proof and final book-count preflight are required before publishing. Exports are capped at 40 pages per package to bound Worker work.
- Paid provider calls are disabled; no external AI provider or Story Book Builder connection is configured. Additional spending authorisation is required before paid artwork generation.
- The installed cf CLI declares Node 24.22+ (or 22.23+) while the host currently runs 24.11.1. Commands and builds are tested here; upgrade Node for a supported toolchain baseline.
