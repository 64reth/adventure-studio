# ADVENTURE STUDIO — EXECUTION AUTHORISATION

The project owner has granted full development and deployment permission for Adventure Studio. This instruction supersedes earlier deployment and push restrictions in the Codex brief.

Project directory: `/Users/garethwallen/Projects/adventure-studio`
GitHub: https://github.com/64reth/adventure-studio

## Authorised actions
- Implement Builds 001–005 autonomously.
- Install necessary project dependencies; create and modify project files.
- Run local development servers, builds and tests; generate and validate puzzle assets.
- Create and manage project-specific databases, storage and Cloudflare resources.
- Commit and push completed milestones to GitHub.
- Deploy to Cloudflare using the existing authenticated CLI.
- Verify live deployments, correct defects and continue until acceptance criteria are met or a genuine external blocker is encountered.

## Deployment requirements
Use a dedicated Worker and project-specific resources. Prefer the non-conflicting staging name `adventure-studio-staging`. Deploy to staging first and verify puzzles, persistence, exports and production workflows. Do not change unrelated DNS or assume approval of a production custom domain.

## Operational boundaries
Work exclusively within Adventure Studio and its dedicated resources. Do not alter Story Book Builder or other Allen Creative Technologies applications. Never expose credentials, commit secrets, initiate paid AI generation, purchase services, force-push or destructively reset work. Preserve repository history and unrelated Cloudflare resources.

## Completion requirements
For each build, implement, test, commit and push the completed milestone. Verify the deployed application live. Report functionality and limitations, commit hashes and push status, staging URL and deployment identifier, automated tests, the five-page playable prototype and answer keys, print PDF results, and remaining configuration requirements.

Begin implementation immediately and continue autonomously through the full build plan. The first major review is the actual five-page adventure, puzzles, artwork, difficulty, layout and print output before scaling to full books. Development authorisation does not constitute human page or artwork publication approval.

---

# ADVENTURE STUDIO
## Master Design, Architecture and Autonomous Build Brief
**Version:** 1.0  
**Owner:** Allen Creative Technologies Ltd  
**Repository:** https://github.com/64reth/adventure-studio  
**Local path:** `/Users/garethwallen/Projects/adventure-studio`

---

# 0. EXECUTION DIRECTIVE

You are the lead software architect, product engineer, puzzle systems designer and QA engineer responsible for building Adventure Studio.

The owner will be away while development takes place.

Proceed autonomously through Builds 001–005, implementing as much of the complete system as can be responsibly completed and verified.

Do not stop after planning or scaffolding. Build working software.

Do not ask for routine architectural, design or implementation decisions. Make sensible choices consistent with this specification and document them.

Do not claim functionality is complete unless it has been implemented and tested.

Do not fabricate test results, generated artwork, external service connections or publishing integrations.

If external API credentials or permissions are unavailable, implement provider adapters, local deterministic alternatives and clear configuration instructions. Continue with all work that does not require those credentials.

Do not deploy to production, purchase services, submit publications, alter unrelated applications or make paid API calls without explicit authorisation.

## Initial repository procedure

1. Open `/Users/garethwallen/Projects/adventure-studio`.
2. Inspect existing files, Git status, branches, remotes and project instructions.
3. Preserve existing work and uncommitted changes.
4. Confirm the Git remote points to `https://github.com/64reth/adventure-studio`.
5. Use the existing stack if appropriate; otherwise initialise the architecture specified below.
6. Establish a working development environment.
7. Implement the builds in sequence.
8. Run relevant tests after each build.
9. Commit completed stages using descriptive commit messages.
10. Do not push unless repository instructions or existing user authorisation explicitly permit it.
11. Produce a final implementation report with completed features, verification results, limitations and next steps.

Maintain a concise project log in `docs/BUILD-LOG.md`.

---

# 1. PRODUCT VISION

Adventure Studio is a reusable production environment for creating original, commercially publishable interactive colouring and puzzle-adventure books.

The system must support:

- Adventure and chapter planning.
- Interconnected story progression.
- Original puzzle generation.
- Deterministic puzzle validation.
- Theme-independent puzzle mechanics.
- Illustrated scene construction.
- AI-assisted artwork generation.
- Accurate print page composition.
- Batch generation and approval.
- Solution and answer-key generation.
- Commercial rights and provenance records.
- Export to professional publishing formats.

The first series is:

**Explore, Colour & Solve**

The first adventure is:

**The Enchanted Kingdom**

Target readers are children aged 7–10.

The experience combines sprawling illustrated environments, colouring, observation, deduction, navigation, discovery, traditional puzzles and occasional two-player games.

Every page should feel like part of an unfolding adventure.

The application must remain suitable for future themes including space exploration, dinosaurs, underwater worlds, ancient civilisations, robots and original fantasy settings.

Theme-specific assets must not be embedded into puzzle logic.

---

# 2. NON-NEGOTIABLE DESIGN PRINCIPLES

## 2.1 Puzzle-first production

The puzzle must be designed and validated before illustration.

Never depend on an image-generation model to create an accurate maze, number grid, cipher, word search or solution.

Puzzle logic is authoritative.

AI-generated artwork is decorative and must conform to the puzzle's established geometry.

## 2.2 One principal activity per page

Each page should have one primary puzzle or activity.

Optional hidden collectibles and minor discoveries may be included, but must not overwhelm the main objective.

## 2.3 Connected adventures

Pages must share narrative continuity.

Solutions should reveal information, unlock locations, provide items or advance the story.

The system must track dependencies between pages.

## 2.4 Original commercial content

All published puzzles, artwork, character designs, narrative content and page compositions must be original.

General puzzle rules may inspire new implementations, but published puzzle instances, protected artwork, distinctive branded presentations and proprietary text must not be copied.

Maintain a provenance record for every externally generated or imported asset.

Do not imply that automated originality checks guarantee freedom from infringement.

## 2.5 Human approval

Automated generation does not equal publication approval.

Every page must pass deterministic tests and visual review.

Publication export requires an explicit approval state.

---

# 3. TECHNICAL ARCHITECTURE

Use a TypeScript-first monorepo.

Preferred stack:

- Node.js 22 or newer.
- TypeScript in strict mode.
- Next.js and React for the application.
- Tailwind CSS for styling.
- SVG for deterministic puzzle geometry.
- Vitest for unit and integration testing.
- Playwright for browser testing.
- Zod for runtime schema validation.
- Python only where a specialised solver provides a clear advantage.
- Local file-based storage initially, with a clean persistence interface.
- Optional SQLite for local project metadata.
- Optional Cloudflare R2 for future asset storage.
- PDF generation through a reliable server-side composition library.
- Image generation through a provider-independent adapter.

Do not introduce unnecessary infrastructure.

Recommended project structure:

```text
adventure-studio/
  apps/
    studio/
      app/
      components/
      features/
      styles/
  packages/
    core/
      schemas/
      models/
      validators/
    adventure/
      planner/
      progression/
      inventory/
    puzzles/
      maze/
      route-deduction/
      hidden-reveal/
      word-search/
      cipher/
      nonogram/
      sudoku/
      logic-grid/
      connect-dots/
      mini-games/
    scenes/
      geometry/
      layouts/
      landmarks/
      themes/
    artwork/
      providers/
      prompts/
      assets/
      provenance/
    composer/
      svg/
      typography/
      layout/
    print/
      profiles/
      pdf/
      preflight/
    qa/
      puzzle/
      visual/
      commercial/
    storage/
      adapters/
  content/
    themes/
    adventures/
    templates/
  tests/
    fixtures/
    golden/
    integration/
    e2e/
  docs/
    architecture/
    decisions/
    build-reports/
  artifacts/
  scripts/
```

Adapt the structure if a simpler architecture is more maintainable.

Maintain clear package boundaries.

Puzzle engines must be usable without React, browser APIs or image-generation services.

---

# 4. CORE DOMAIN MODEL

Implement strongly typed, versioned schemas for:

### Adventure

- ID
- Title
- Series
- Theme
- Premise
- Target age
- Difficulty range
- Chapters
- Pages
- Characters
- Locations
- Inventory items
- Progression rules
- Production status
- Version

### Chapter

- ID
- Adventure ID
- Title
- Narrative objective
- Location
- Ordered pages
- Required entry conditions
- Completion rewards

### Page

- ID
- Chapter ID
- Page number
- Title
- Story text
- Instructions
- Puzzle type
- Puzzle configuration
- Scene configuration
- Required clues
- Rewards
- Dependencies
- Layout template
- Illustration assets
- Solution reference
- Validation results
- Approval status

### Puzzle

- ID
- Mechanic ID
- Generator version
- Seed
- Difficulty
- Input configuration
- Generated puzzle data
- Solution data
- Hints
- Validation status
- Visual geometry

### Scene

- Perspective
- Canvas bounds
- Playable regions
- Landmarks
- Obstacles
- Routes
- Clue positions
- Character placements
- Decorative regions
- Protected geometry
- Illustration references

### Asset

- ID
- Type
- Provider
- Source
- Prompt or creation record
- Model/version where available
- Creation timestamp
- Licence metadata
- Rights review
- Content hash
- File reference

Use explicit schema versions and migrations.

Never store the authoritative puzzle solution only inside a raster image.

---

# 5. PRINT PRODUCTION SPECIFICATION

## Target publication

- Trim size: 8.5 × 11 inches.
- Orientation: portrait.
- Working full-bleed canvas: 8.625 × 11.25 inches.
- Preferred print resolution: 300 DPI.
- Interior artwork: black ink on white.
- Colouring areas: predominantly white.
- Decorative shading: minimal.
- Illustration style: bold, detailed, clean line art.

The owner has specified a 0.385-inch border around the interior artwork.

Implement this as a configurable design inset with a documented coordinate reference.

Do not confuse the full-bleed PDF dimensions with the trimmed page dimensions.

For KDP, full-bleed pages extend beyond the top, bottom and outside trim edges, not symmetrically around all four edges.

## Required print profiles

### Profile A: No bleed

- PDF page size: 8.5 × 11 inches.
- Artwork positioned inside the trim area.
- No objects extend beyond trim boundaries.

### Profile B: KDP bleed

- PDF page size: 8.625 × 11.25 inches.
- Correct inside/outside alignment for odd and even pages.
- Trim-safe positioning.
- Correct bleed and gutter calculations.

Use the official KDP requirements as the source of truth:

https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6

https://kdp.amazon.com/en_US/help/topic/G201857950

The software must calculate the applicable minimum gutter from the final page count.

Do not assume that a 0.385-inch visible border is automatically sufficient for every book length.

## Print outputs

Generate:

1. Individual page PDFs.
2. Combined interior PDF.
3. PNG previews.
4. Editable SVG compositions.
5. Answer-key PDF.
6. Print preflight report.
7. Page manifest.

Ensure embedded fonts, correct physical dimensions, sufficient raster resolution and compliant line thickness.

For the target audience, use larger text than the printer's technical minimum.

Avoid important artwork or puzzle clues near the binding.

---

# 6. PUZZLE ENGINE

Build an extensible registry of puzzle mechanics.

Each mechanic must expose a common interface:

```ts
interface PuzzleGenerator<
  TConfig,
  TPuzzle,
  TSolution
> {
  id: string;
  version: string;

  generate(
    config: TConfig,
    seed: string
  ): TPuzzle;

  solve(
    puzzle: TPuzzle
  ): TSolution[];

  validate(
    puzzle: TPuzzle,
    solution: TSolution
  ): ValidationResult;

  renderBlueprint(
    puzzle: TPuzzle
  ): SceneBlueprint;
}
```

The exact interface may be refined, but retain deterministic generation, independent solving and validation.

## Initial production mechanics

Implement these five first:

### 6.1 Maze traversal

- Connected graph generation.
- Start and destination.
- Branching routes.
- Obstacles.
- Dead ends.
- Configurable difficulty.
- Valid path verification.
- Optional multiple-route objectives.

### 6.2 Route deduction

- Multiple possible routes.
- Hidden environmental clues.
- Hazard conditions.
- Route elimination.
- Unique intended solution by default.
- Explicit support for alternative valid routes when designed.

### 6.3 Hidden-message colouring

- Generate the answer shape first.
- Convert it to a grid or region mask.
- Assign symbols or numerical conditions.
- Fill surrounding regions with camouflage.
- Ensure the revealed message is legible.
- Generate a coloured solution preview.

### 6.4 Word search

- Configurable grid dimensions.
- Horizontal, vertical and optional diagonal words.
- Age-appropriate vocabulary.
- Deterministic placement.
- Accidental answer detection.
- Verified word coordinates.
- Optional hidden-message extraction.

### 6.5 Symbol cipher

- Deterministic substitution mapping.
- Complete and partial cipher keys.
- Age-appropriate message lengths.
- Valid decoding.
- Configurable hints.
- Narrative reward.

## Secondary mechanics

Add through the same registry architecture:

- Nonograms.
- 4×4 Sudoku.
- Logic grids.
- Connect the dots.
- Spot the difference.
- Matching.
- Pattern completion.
- Number paths.
- Mini crosswords.
- Bridge-building puzzles.
- Loop-drawing puzzles.
- Noughts and crosses.
- Dots and boxes.
- Cooperative two-player puzzles.
- Creative construction activities.

Do not claim all secondary mechanics are production-ready unless fully implemented and tested.

## Difficulty model

Difficulty should account for:

- Number of candidate solutions.
- Required clues.
- Decoys.
- Reasoning steps.
- Working memory.
- Reading complexity.
- Visual density.
- Previous-page dependencies.

Do not equate difficulty solely with smaller objects or more clutter.

---

# 7. ADVENTURE PROGRESSION ENGINE

Create a directed graph representing page and chapter progression.

Support:

- Required discoveries.
- Optional collectibles.
- Inventory items.
- Page unlocks.
- Branching routes.
- Return visits.
- Chapter completion.
- Multiple endings where explicitly designed.

Validate that:

- Every required item is obtainable.
- No mandatory dependency is circular.
- The adventure is completable.
- Optional discoveries do not accidentally block the main story.
- Clues are introduced before being required.
- Branches reconnect correctly where intended.

Include a graph-based progression visualisation in the editor.

---

# 8. SCENE BUILDER

The scene builder translates puzzle geometry into illustrated environments.

Supported perspectives:

1. Top-down.
2. Isometric / three-quarter.
3. Panoramic.

Top-down is the default for route and maze puzzles.

## Scene layers

Separate the scene into:

1. Terrain.
2. Paths and playable geometry.
3. Architecture.
4. Environmental objects.
5. Characters.
6. Puzzle clues.
7. Decorative details.
8. Text and labels.

Protect authoritative geometry.

An illustration model must not change the actual puzzle routes, grid coordinates, symbols or answer locations.

Use SVG for exact paths, borders, symbols and interactive elements.

Allow individual layers to be hidden, regenerated or replaced.

## Scene constraints

- Clear start and destination.
- Visible path boundaries.
- Sufficient colouring regions.
- No accidental path intersections.
- No decorative objects obscuring clues.
- No ambiguous passages.
- No hidden clues placed under labels.
- Adequate contrast for black-and-white printing.

---

# 9. ARTWORK PIPELINE

Implement a provider-independent image-generation interface.

The initial system must function without paid image-generation access.

Use deterministic placeholder art, original SVG scenery and manually supplied artwork when no provider is configured.

## Provider interface

Support:

- Prompt construction.
- Theme style guides.
- Reference asset inputs where supported.
- Image generation.
- Image variation.
- Regeneration.
- Provider metadata.
- Asset versioning.
- Cost and usage logging where available.

Do not hard-code API keys.

Do not assume that every image provider supports identical features.

## Art direction

The first theme uses:

- Medieval fantasy environments.
- Castles and fortified towns.
- Dragons, knights, princesses, princes, wizards and ogres.
- Forests, bridges, rivers, caves and ruins.
- Detailed black-and-white ink illustrations.
- Strong outer contours.
- Clean enclosed colouring areas.
- Minimal grey shading.
- Consistent architectural and character designs.

Avoid imitating a particular living illustrator or copying recognisable branded characters.

## Asset approval

Every asset requires:

- Source record.
- Commercial-use assessment.
- Visual review.
- Approval state.
- Content hash.

No unapproved asset may enter a final publication export.

---

# 10. PAGE COMPOSER

Create a template-based composition engine.

Page templates should support:

- Main illustrated scene.
- Page title.
- Short story text.
- Clear objective.
- Puzzle instructions.
- Colour key.
- Clue checklist.
- Answer area.
- Inventory update.
- Page number.

Do not force every page into the same exact arrangement.

Allow puzzle-specific layouts while preserving series consistency.

## Design system

Use:

- Large readable typography.
- Consistent heading hierarchy.
- Simple page furniture.
- Clear instructions.
- Generous colouring spaces.
- Strong black outlines.
- Minimal decorative text.
- No slogans or unnecessary filler.

Provide a WYSIWYG page preview with:

- Zoom.
- Pan.
- Layer visibility.
- Trim and bleed guides.
- Gutter guides.
- Solution overlay.
- Print preview.

Support individual page regeneration without changing approved neighbouring pages.

---

# 11. QUALITY ASSURANCE

Every generated page must pass a structured QA process.

## Puzzle validation

- Valid solution.
- Correct clue count.
- No contradictory instructions.
- Intended solution uniqueness where required.
- No unintended route shortcuts.
- No missing symbols.
- Correct answer key.

## Visual validation

- Correct page geometry.
- Readable instructions.
- Clues visible at print size.
- Adequate colouring spaces.
- Correct artwork alignment.
- No critical objects in unsafe margins.

## Narrative validation

- Story continuity.
- Correct inventory dependencies.
- Valid chapter progression.
- No inaccessible mandatory content.

## Commercial review

- Asset provenance present.
- Appropriate commercial-use permissions.
- No obvious third-party branding.
- No knowingly copied puzzle instances.
- Trademark-review status recorded.

Automated tests must not claim to provide definitive legal clearance.

## QA status model

Use:

- Draft
- Generated
- Validation Failed
- Needs Review
- Approved
- Exported

Prevent publication export when mandatory checks fail or pages lack approval.

Provide an explicit reviewer override only for documented non-critical warnings.

---

# 12. USER INTERFACE

Build a polished desktop-first application that also works on tablets.

## Main navigation

### Dashboard

- Recent projects.
- Active adventures.
- Generation status.
- Pending approvals.
- Failed validations.
- Export history.

### Adventures

- Create adventure.
- Edit premise and theme.
- Manage chapters.
- View progression graph.
- Manage characters and inventory.

### Puzzle Lab

- Browse mechanics.
- Configure difficulty.
- Generate puzzles.
- Inspect solutions.
- Regenerate using seeds.
- Run validation.

### Scene Studio

- Select perspective.
- Place landmarks.
- View protected geometry.
- Manage illustration layers.
- Assign artwork.

### Page Studio

- Compose pages.
- Edit text.
- Preview print layout.
- Inspect solution overlays.
- Approve pages.

### Production Queue

- Generate pages in batches.
- Track jobs.
- Retry failures.
- Cancel pending jobs.
- Inspect generation history.

### Publishing

- Assemble books.
- Generate answer keys.
- Run print preflight.
- Export PDF and assets.
- Produce Story Book Builder import packages.

### Settings

- Print profiles.
- Art providers.
- Theme packs.
- Storage configuration.
- Generation budgets.
- Licence records.

Use a restrained professional visual style with strong usability.

Avoid excessive animation, tiny controls and decorative slogans.

---

# 13. BATCH PRODUCTION

Implement a resumable production queue.

Each job must have:

- Unique ID.
- Input manifest.
- Seed.
- Status.
- Attempts.
- Error details.
- Output references.
- Cost record where applicable.

Support:

- Generate one page.
- Generate a chapter.
- Generate a selected batch.
- Pause.
- Resume.
- Cancel.
- Retry failures.
- Regenerate one asset.
- Preserve approved pages.

Generation must be idempotent where possible.

Do not regenerate approved artwork simply because another page changes.

Use content hashes to detect unchanged assets.

Require explicit authorisation before initiating paid provider requests.

Provide configurable budget limits and prevent automatic spending beyond them.

---

# 14. FIRST ADVENTURE CONTENT

Create a sample adventure:

**Explore, Colour & Solve: The Enchanted Kingdom**

Premise:

A mysterious disappearance threatens the kingdom. Two young adventurers discover that the last dragon has vanished, and the magical protection surrounding the royal castle is failing.

The player must investigate castles, forests, underground passages and mountain strongholds to uncover the truth.

Avoid a simplistic rescue narrative in which princesses are always passive characters. Characters should have distinct roles, skills and motivations.

## Initial five-page prototype

### Page 1 — The Royal Courtyard

Mechanic: Search & Colour / Route Deduction.

The player searches a sprawling castle courtyard for five hidden royal symbols.

Correctly identified symbols reveal which gate leads toward the princess's tower.

Output:

- Original top-down castle illustration.
- Five exact clue placements.
- Multiple plausible routes.
- Verified intended route.
- Answer key.

### Page 2 — The Castle Labyrinth

Mechanic: Maze Traversal.

The player follows the discovered entrance into a network of passages.

Several routes contain obstacles and dead ends.

Output:

- Connected maze.
- Correct entrance.
- Destination.
- Verified route.
- Illustrated castle environment.

### Page 3 — The Wizard's Window

Mechanic: Hidden-Message Colouring.

The player colours selected stained-glass regions according to a symbol key.

The completed pattern reveals a password.

Output:

- Deterministic reveal mask.
- Colouring instructions.
- Original stained-glass illustration.
- Legible revealed answer.
- Solution preview.

### Page 4 — The Royal Library

Mechanic: Word Search.

The player searches for magical objects and words hidden in a grid integrated into a library scene.

The puzzle reveals the location of a missing key.

Output:

- Verified word grid.
- Word list.
- Hidden message or reward.
- Original library illustration.
- Answer key.

### Page 5 — The Dragon's Chamber

Mechanic: Cipher / Combination Puzzle.

The player combines discoveries from earlier pages to open the chamber.

The result reveals a new chapter objective.

Output:

- Valid combination puzzle.
- Explicit clue dependencies.
- Unique intended solution.
- Dragon chamber illustration.
- Chapter completion reward.

Each page must be playable without the user needing to guess the designer's intended answer.

Produce both player pages and solution pages.

---

# 15. AUTOMATED TESTING

Use Vitest for deterministic engine tests.

Use Playwright for browser workflows.

Required tests include:

### Generation

- Same seed produces same puzzle.
- Different seeds produce valid variations.
- Invalid configurations are rejected.
- Generated puzzles have valid solutions.

### Puzzle correctness

- Maze paths are connected.
- Route deductions satisfy constraints.
- Hidden reveals match intended masks.
- Word-search coordinates are correct.
- Ciphers decode correctly.
- Solution counts meet requirements.

### Progression

- All mandatory pages are reachable.
- Required items can be obtained.
- No invalid circular dependencies.
- Branches preserve completion.

### Print

- Exact page dimensions.
- Correct trim and bleed.
- Correct odd/even gutter handling.
- No content outside approved bounds.
- Fonts embedded where required.
- PDF pages render correctly.

### Application

- Create and edit adventure.
- Generate puzzle.
- Preview page.
- Approve page.
- Batch generation.
- Resume failed jobs.
- Export book.
- Reload saved project.

Maintain regression fixtures for the five prototype pages.

Use visual snapshots where appropriate.

---

# 16. STORY BOOK BUILDER INTEGRATION

Adventure Studio must remain independently usable.

Do not modify Story Book Builder during the initial builds.

Create an export package containing:

```text
book-export/
  manifest.json
  interior.pdf
  answers.pdf
  pages/
    page-001.pdf
    page-001.svg
    page-001.png
  solutions/
  assets/
  provenance.json
  validation-report.json
```

Define a versioned manifest.

Document how Story Book Builder could import the package.

Do not claim direct integration is complete until the target application's interface has been inspected and an end-to-end import has been verified.

---

# 17. BUILD MILESTONES

## BUILD 001 — Foundation

Deliver:

- Working application.
- Monorepo structure.
- Core schemas.
- Adventure CRUD.
- Page templates.
- Print profile calculations.
- Puzzle registry interface.
- Initial dashboard.
- Unit tests.
- Architecture documentation.

Acceptance:

The application starts locally, creates and saves an adventure, and renders a correctly dimensioned blank page.

Commit:

`feat: establish Adventure Studio foundation`

## BUILD 002 — Puzzle Engine

Deliver:

- Five primary puzzle generators.
- Independent solvers.
- Deterministic seeds.
- Puzzle Lab.
- Solution previews.
- Automated validation.
- Regression fixtures.

Acceptance:

Generate and validate multiple examples of each primary mechanic without image-generation services.

Commit:

`feat: implement deterministic puzzle engines`

## BUILD 003 — Scene and Artwork Pipeline

Deliver:

- Scene geometry model.
- Top-down layout engine.
- Protected puzzle layers.
- Theme packs.
- Artwork provider interface.
- Local fallback artwork.
- Asset provenance.
- Page composer.

Acceptance:

Produce a complete illustrated puzzle page using deterministic puzzle geometry and local artwork.

Commit:

`feat: add scene composition and artwork pipeline`

## BUILD 004 — Five-Page Prototype

Deliver:

- Five consecutive adventure pages.
- Five distinct puzzle mechanics.
- Verified solutions.
- Consistent artwork.
- Answer-key pages.
- Individual page exports.
- Combined prototype PDF.
- Visual QA report.

Acceptance:

All five puzzles are playable, their answers are correct, and the exported pages satisfy the selected print profile.

Commit:

`feat: deliver Enchanted Kingdom playable prototype`

## BUILD 005 — Production Workflow

Deliver:

- Batch production queue.
- Page approval workflow.
- Chapter progression editor.
- Export manifests.
- Print preflight.
- Book assembly.
- Generation logs.
- Recovery and retry handling.
- Story Book Builder handoff format.

Acceptance:

A user can configure a multi-page adventure, generate available puzzle types, review pages, approve them and export a complete print package.

Commit:

`feat: complete Adventure Studio production workflow`

---

# 18. DOCUMENTATION REQUIREMENTS

Maintain:

- `README.md`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/PUZZLE-ENGINE.md`
- `docs/PRINT-SPECIFICATION.md`
- `docs/ART-PIPELINE.md`
- `docs/COMMERCIAL-IP-POLICY.md`
- `docs/STORY-BOOK-BUILDER-INTEGRATION.md`
- `docs/BUILD-LOG.md`
- `docs/TEST-REPORT.md`
- `docs/KNOWN-LIMITATIONS.md`

Document actual implementation details rather than aspirational features.

Include local setup instructions and required environment variables.

---

# 19. ENGINEERING RULES

- Strict TypeScript.
- No unnecessary `any`.
- Runtime validation at system boundaries.
- Deterministic puzzle generation.
- Explicit error handling.
- No secrets committed.
- No hidden external API spending.
- No destructive repository operations.
- No unrelated project changes.
- No fabricated functionality.
- No silent validation bypasses.
- No automatic publication.
- No production deployment without approval.

Use accessible UI components.

Keep the application responsive and usable on ordinary laptops.

Optimise for maintainability and repeatable production rather than unnecessary architectural complexity.

---

# 20. AUTONOMOUS WORK EXPECTATIONS

Continue through all five builds where feasible.

If blocked by unavailable credentials or external services:

1. Record the limitation.
2. Implement the interface and local fallback.
3. Test everything that can be tested locally.
4. Continue with independent work.

Do not repeatedly request confirmation for routine implementation decisions.

Commit completed milestones only after their tests pass.

If a milestone is incomplete, document its status accurately rather than committing it as complete.

At the end, report:

- Implemented builds.
- Application start command.
- Local preview URL, if running.
- Tests passed and failed.
- Generated prototype assets.
- Export locations.
- Git commits.
- Remaining limitations.
- External credentials needed.
- Suggested next development milestone.

## FINAL PRODUCT STANDARD

Adventure Studio should produce original puzzle-adventure pages that are:

**Enjoyable to explore, rewarding to colour, logically satisfying to solve, and technically reliable enough for commercial publishing.**

The puzzle must work before the illustration is considered finished.

Begin implementation now.
