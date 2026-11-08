# ADVENTURE STUDIO — BUILD 006
## Visual Page Studio & Interface Redesign

**Project:** `/Users/garethwallen/Projects/adventure-studio`  
**Repository:** https://github.com/64reth/adventure-studio  
**Current baseline:** `1d13db2`  
**Deployment:** https://adventure-studio-staging.garetha81.workers.dev/

## 0. Execution authorisation

You have full authorisation to implement, test, commit, push and deploy this build within the Adventure Studio project scope.

Proceed autonomously. Do not stop after planning or scaffolding.

Inspect the current application and architecture before making changes. Preserve all existing functionality, including the five puzzle engines, project persistence, approval workflow, batch generation, print profiles and PDF exports.

Do not modify unrelated applications, Cloudflare resources or repositories.

Do not make paid API calls without separate spending authorisation.

Commit and push the completed build, deploy to the existing staging application and verify the live implementation.

---

# 1. Primary objective

Transform Adventure Studio into a visual, drag-and-drop creative production environment.

The central workspace should be **Page Studio**, where users can compose illustrated puzzle pages using reusable components, configurable grids, predefined activities and editable layouts.

At the same time, redesign the application with a playful, welcoming visual identity.

The desired aesthetic combines:

- The approachable, rounded typography and polished creativity of kawaii-inspired design tools.
- The whimsical, hand-drawn, bold-outlined feel of contemporary fantasy cartoons.
- Soft pastel colours, friendly shapes and expressive illustrated interface elements.
- The usability and layout flexibility of a professional visual editor.

Use these references as broad inspiration only. Create an original design system. Do not copy Canva's interface, proprietary assets, or the distinctive characters, lettering and protected visual expression of *Adventure Time*.

The result should feel joyful and imaginative without sacrificing professional usability.

---

# 2. Global UI redesign

## Typography

Use a rounded, friendly typeface suitable for a creative application.

Investigate commercially licensed or open-source alternatives such as:

- Fredoka — preferred for headings.
- Nunito — preferred for body text and controls.
- Baloo 2 — optional for selected playful display elements.

Verify font licences and bundle fonts locally where appropriate.

Use consistent type scales with large, readable labels.

Avoid thin, condensed or overly formal corporate typography.

## Colour palette

Use a light, cheerful palette.

Suggested design tokens:

| Role | Colour |
|---|---|
| Main background | `#FFF9F0` |
| Surface | `#FFFFFF` |
| Primary accent | `#A7DCC8` |
| Secondary accent | `#F8C9D8` |
| Highlight | `#FFE49A` |
| Lavender | `#D8C8F2` |
| Text | `#28323A` |
| Strong outline | `#30343B` |

These are starting values, not mandatory exact colours.

Use soft pastel backgrounds, strong readable text and restrained colour combinations.

Ensure accessibility and adequate contrast.

## Visual language

- Rounded cards and panels.
- Friendly, substantial buttons.
- Bold outlines used selectively.
- Soft shadows.
- Simple illustrated icons.
- Clear hover, focus and selection states.
- Subtle transitions.
- Playful empty states.
- No unnecessary slogans or decorative filler text.

Avoid excessive gradients, visual noise and animations that interfere with editing.

The application should remain responsive and efficient on ordinary laptops.

## Navigation

Redesign the existing navigation into a consistent application shell.

Suggested sections:

- Dashboard
- Adventures
- Page Studio
- Puzzle Lab
- Assets
- Production
- Publishing
- Settings

Keep navigation accessible while working on a page.

Use Lucide icons where appropriate.

---

# 3. Page Studio — primary workspace

Build a proper visual editor with three main regions.

## Left panel — Component Library

Provide draggable components grouped into categories:

**Activities**
- Maze
- Route deduction
- Hidden-message colouring
- Word search
- Cipher
- Other registered puzzle mechanics

**Characters**
- Character instances
- Character placeholders
- Reusable character assets

**Environment**
- Buildings
- Trees
- Bridges
- Rivers
- Mountains
- Doors
- Windows
- Decorative scenery

**Page elements**
- Title
- Story text
- Instructions
- Clue key
- Answer area
- Inventory indicator
- Page number
- Borders and frames

The library should be searchable and organised by category.

Components must have visible previews.

## Centre — Page Canvas

Provide a large editable canvas.

Required features:

- Drag and drop from the component library.
- Select components.
- Move components.
- Resize using handles.
- Rotate where supported.
- Duplicate.
- Delete.
- Align.
- Distribute.
- Group and ungroup where practical.
- Reorder layers.
- Undo and redo.
- Zoom and pan.
- Fit page to viewport.
- Show/hide layout grid.
- Show/hide print guides.
- Snap to grid.
- Snap to component edges.
- Keyboard shortcuts.
- Multi-selection where practical.

Use a reliable canvas or SVG editor architecture.

Prefer preserving SVG/vector output rather than rasterising the entire page.

## Right panel — Properties Inspector

Show contextual properties for the selected component.

For example, selecting a maze should expose:

- Difficulty.
- Seed.
- Grid size.
- Start and finish.
- Number of branches.
- Path thickness.
- Clue placement.
- Regenerate action.
- Validation status.

Selecting text should expose:

- Content.
- Font.
- Size.
- Alignment.
- Line spacing.
- Position.
- Width.
- Height.

Selecting scenery should expose:

- Position.
- Size.
- Rotation.
- Layer.
- Visibility.
- Asset variant.

All property changes should update the canvas immediately.

---

# 4. Configurable page sizes

Replace hard-coded page dimensions with configurable print profiles.

Include presets:

- 8.5 × 11 inches.
- A4 portrait.
- A5 portrait.
- 8.5 × 8.5 inches.
- 6 × 9 inches.
- Custom width and height.

Support portrait and landscape where appropriate.

Page settings must include:

- Trim dimensions.
- Bleed.
- Inside margin.
- Outside margin.
- Top and bottom margins.
- Illustration border inset.
- Gutter.
- Resolution.

Preserve the existing 8.5 × 11-inch trim and 8.625 × 11.25-inch bleed profile as the default for Explore, Colour & Solve.

Do not confuse the working bleed canvas with the finished trim size.

The existing 0.385-inch artwork inset must remain configurable.

Changing page size should preserve component positions proportionally where possible, with warnings for any components that no longer fit safely.

Ensure PDF exports use the actual selected page profile.

---

# 5. Grid layout system

Implement two independent grid systems.

## Page layout grid

Used for placing and aligning page components.

Support:

- 6-column grid.
- 12-column grid.
- Custom rows and columns.
- Free positioning.
- Snap-to-grid toggle.
- Adjustable spacing.
- Optional rulers and guides.

The grid is an editor overlay and must not appear in published artwork unless explicitly requested.

## Puzzle grid

Used internally by grid-based puzzles.

Examples include word searches, nonograms and number puzzles.

Puzzle grids must remain independent of the page layout grid.

Resizing or moving a puzzle component must not invalidate its internal solution.

Changing the puzzle's logical grid must trigger regeneration and validation.

---

# 6. Selectable activity format

Provide a clear activity selector using the existing puzzle registry.

When creating a page, the user should be able to:

1. Select an activity type.
2. Configure its difficulty.
3. Choose a layout.
4. Generate a valid puzzle.
5. Preview the solution.
6. Place the puzzle on the canvas.
7. Adjust its presentation.
8. Validate the completed page.

Activity selection must not require editing JSON or source code.

Each activity should have a preview, short description and configurable options.

Support changing an activity before approval without losing unrelated page content.

---

# 7. Functional versus decorative components

Introduce explicit component types.

## Decorative

Examples:

- Trees.
- Clouds.
- Buildings.
- Characters without puzzle interactions.
- Borders.
- Background objects.

These may be positioned freely within the page's safe area.

## Functional

Examples:

- Maze paths.
- Route junctions.
- Puzzle clues.
- Word-search grids.
- Cipher symbols.
- Interactive bridges.
- Start and destination markers.

Functional components must retain references to their authoritative puzzle data.

Moving or editing a functional component must trigger relevant validation.

Prevent edits that silently break puzzle correctness.

Provide clear warnings and an option to revert invalid changes.

The puzzle engine remains authoritative.

---

# 8. Monochrome colouring-book style

This is a permanent output requirement for Explore, Colour & Solve.

All printable illustrations and puzzle artwork must default to:

- White backgrounds.
- Black outlines.
- Thick, clean contours.
- Clear enclosed colouring areas.
- Minimal grey shading.
- No gradients.
- No pre-coloured characters.
- No photorealistic textures.
- No excessive crosshatching.

Use a shared style profile named `colouring-book-bold`.

The profile must be reusable across themes.

Suggested line categories:

- Primary contours.
- Secondary details.
- Fine interior details.

Define line weights in physical print units, not only screen pixels.

Preview artwork at actual print scale to ensure details remain colourable.

The application interface may use pastel colours, but those colours must not accidentally appear in the print export.

Provide a monochrome print-preview mode.

---

# 9. Asset Library foundations

Create an asset-management interface for reusable visual components.

Asset categories:

- Characters.
- Environments.
- Buildings.
- Props.
- Decorative elements.
- Puzzle components.
- Frames.
- Text templates.

Support:

- Import SVG and suitable raster images.
- Asset previews.
- Tags.
- Search.
- Categories.
- Favourites.
- Reuse across pages.
- Asset versioning.
- Provenance metadata.
- Approval state.

Preserve the existing commercial rights checks.

Do not allow unapproved third-party assets into final publishing exports.

Prepare the architecture for Build 007 Character Studio and Build 008 Theme & Scene Studio.

Do not hard-code the asset library to medieval fantasy.

---

# 10. Character placeholders and modular integration

Build the Page Studio integration points needed for a future Character Studio.

Support a generic character component containing:

- Character ID.
- Asset reference.
- Pose reference.
- Expression.
- Scale.
- Position.
- Facing direction.
- Story role.
- Optional linked puzzle clue.

Provide simple original monochrome placeholder characters for:

- Knight.
- Dragon.
- Princess.
- Robot.
- Fairy.
- Teddy bear.

These are placeholders, not a requirement to build the complete character-generation system in Build 006.

The full modular character editor, anatomy system, character bibles and pose libraries belong to Build 007.

---

# 11. Editor persistence and compatibility

Extend existing project persistence to save:

- Page dimensions.
- Grid settings.
- Canvas components.
- Positions.
- Sizes.
- Rotations.
- Layer order.
- Text edits.
- Asset references.
- Selected puzzle configuration.
- Undo/redo history as appropriate.

Use versioned schemas and migration logic.

Existing Adventure Studio projects must continue loading.

Do not lose previously generated puzzles or approved pages.

Preserve current device-local storage until a separate persistent-storage migration is designed.

---

# 12. Export compatibility

The visual editor must integrate with the existing print pipeline.

Required outputs:

- Editable SVG.
- PNG preview.
- Individual page PDF.
- Combined book PDF.
- Answer keys.
- Existing export manifests.

The exported page must match the approved editor composition.

Selection outlines, grid overlays, resize handles and editing guides must never appear in final print files.

Maintain accurate print dimensions, margins and embedded fonts.

---

# 13. Quality assurance

Add automated tests for:

- Page-size presets.
- Custom dimensions.
- Grid snapping.
- Drag-and-drop placement.
- Component resizing.
- Layer ordering.
- Undo and redo.
- Save and reload.
- Functional puzzle validation after edits.
- Monochrome export.
- Print dimensions.
- Existing puzzle-engine regressions.
- Existing approval and batch workflows.

Add browser tests covering a complete editor workflow:

1. Open an adventure.
2. Create a page.
3. Select an activity.
4. Generate a puzzle.
5. Drag the puzzle onto the canvas.
6. Add scenery and text.
7. Resize and reposition components.
8. Save.
9. Reload.
10. Validate.
11. Approve.
12. Export.

Verify desktop and tablet layouts.

Ensure touch-friendly controls and keyboard accessibility.

---

# 14. Deployment and delivery

Implement the build autonomously.

Run:

- Type checks.
- Unit tests.
- Production build.
- Browser tests.
- PDF export tests.
- Live staging verification.

Commit using:

`feat: build visual Page Studio and playful UI`

Push to GitHub and deploy to the existing Adventure Studio staging application.

Preserve all existing application data where possible.

Do not modify other Cloudflare applications or DNS records.

Update project documentation, including:

- Architecture.
- Page Studio.
- Design system.
- Component model.
- Asset library.
- Print specifications.
- Build log.
- Test report.
- Known limitations.

Provide a final report containing:

- Completed features.
- Screenshots of the redesigned interface.
- Tests and verification results.
- Commit hash.
- Deployment identifier.
- Live staging URL.
- Remaining limitations.

## Acceptance criteria

Build 006 is complete when a user can open Adventure Studio, choose a page size, select a puzzle type, place and edit components on a grid-based canvas, save the layout, reload it, validate the puzzle and export the finished monochrome page.

The redesigned application must feel playful and approachable while retaining the precision needed for commercial puzzle-book production.

**Proceed with implementation, testing, Git push and staging deployment.**