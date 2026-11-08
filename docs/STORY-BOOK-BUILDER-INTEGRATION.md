# Story Book Builder handoff v1
ZIP contains `manifest.json`, `interior.pdf`, `answers.pdf`, `pages/page-NNN.pdf`, editable `pages/page-NNN.svg`, 300 DPI `pages/page-NNN.png`, `solutions/`, `assets/`, `provenance.json`, `validation-report.json`, `answer-keys.json`, and `adventure.json`.

Manifest schemaVersion 1 identifies the adventure/revision, profile, page count and review/publication mode. It lists exact byte counts and SHA-256 hashes for each payload file (excluding the self-referential manifest). Browser/CLI finalization includes PNG files and deduplicates asset references.

A future importer should verify hashes, reject review packages for publication, map pages in numeric order, retain provenance and QA, and use the physical PDF dimensions. Story Book Builder was not modified or inspected; no direct import is claimed or verified.
