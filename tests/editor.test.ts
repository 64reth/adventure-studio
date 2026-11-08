import { test, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { prototype, makePage } from "../packages/adventure/index";
import { AdventureSchema } from "../packages/core/index";
import {
  presets,
  defaultPrint,
  initialEditor,
  component,
  change,
  undo,
  redo,
  resizePage,
  visualLayout,
  snapPosition,
  canvasQA,
  reorder,
  alignComponents,
} from "../packages/editor/model";
import { compose } from "../packages/composer/index";
import { safeSvg } from "../packages/editor/assets";
import { exportPackage, preflight } from "../packages/print/export";
test("legacy schema loads without mutating approved pages", () => {
  const a = prototype();
  a.pages[0].status = "Approved";
  const before = compose(a.pages[0]);
  const parsed = AdventureSchema.parse(JSON.parse(JSON.stringify(a)));
  expect(parsed.pages[0].editor).toBeUndefined();
  expect(compose(parsed.pages[0])).toBe(before);
});
test("presets, custom dimensions and proportional page resizing", () => {
  for (const [name, [width, height]] of Object.entries(presets)) {
    const l = visualLayout({ ...defaultPrint, preset: name, width, height });
    expect(l.width).toBe(width);
    expect(l.height).toBe(height);
  }
  const page = prototype().pages[0],
    state = initialEditor(page).state,
    next = resizePage(state, {
      ...defaultPrint,
      preset: "Custom",
      width: 10,
      height: 8,
    });
  expect(next.components[0].x).toBeCloseTo((state.components[0].x * 10) / 8.5);
  expect(next.components[0].y).toBeCloseTo((state.components[0].y * 8) / 11);
  const odd = visualLayout({ ...defaultPrint, bleed: 0.125 }, 1),
    even = visualLayout({ ...defaultPrint, bleed: 0.125 }, 2);
  expect(odd.width).toBe(8.625);
  expect(even.trim.x).toBe(0.125);
});
test("layout snap is independent of logical puzzle grid; layers, history and groups persist", () => {
  const p = prototype().pages[1],
    e = initialEditor(p),
    puzzle = e.state.components.find((c) => c.kind === "puzzle")!;
  const before = compose({ ...p, editor: e });
  const point = snapPosition(e.state, puzzle, 102, 242);
  expect(point.x).not.toBe(102);
  const moved = change(e, {
    ...e.state,
    components: e.state.components.map((c) =>
      c.id === puzzle.id ? { ...c, ...point, width: 400, height: 450 } : c,
    ),
  });
  expect(moved.state.activity?.config).toEqual(p.config);
  expect(undo(moved).state).toEqual(e.state);
  expect(redo(undo(moved)).state).toEqual(moved.state);
  expect(compose({ ...p, editor: moved })).not.toEqual(before);
  expect(reorder(e.state, puzzle.id, 1).components.at(-1)?.id).toBe(puzzle.id);
  const aligned = alignComponents(
    e.state,
    e.state.components.slice(0, 2).map((c) => c.id),
    "left",
  );
  expect(aligned.components[0].x).toBe(aligned.components[1].x);
});
test("protected activity bounds, overlap, references and missing assets fail validation", () => {
  const p = prototype().pages[1];
  p.editor = initialEditor(p);
  expect(canvasQA(p).valid).toBe(true);
  p.editor.state.components[3].x = -30;
  expect(canvasQA(p).valid).toBe(false);
  p.editor = initialEditor(p);
  p.editor.state.components.push(component("scenery", "tree", 100, 300));
  expect(canvasQA(p).errors.join()).toContain("overlaps");
});
test("SVG importer rejects scripts, links, colours and unsafe nodes", () => {
  expect(
    safeSvg(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="black" d="M0 0H10V10Z"/></svg>',
    ),
  ).toContain('fill="black"');
  for (const body of [
    "<script>alert(1)</script>",
    '<image href="https://example.com/x"/>',
    '<rect fill="red"/>',
    "<foreignObject/>",
    '<path onload="alert(1)"/>',
  ])
    expect(() => safeSvg(`<svg>${body}</svg>`)).toThrow();
});
test("visual output excludes editor overlays and UI colours; custom PDF uses saved dimensions and fonts", async () => {
  const a = prototype();
  a.pages = [makePage("maze", 1, "visual")];
  const p = a.pages[0];
  p.editor = initialEditor(p, true);
  p.editor.state.print = {
    ...defaultPrint,
    preset: "Custom",
    width: 9,
    height: 10,
    bleed: 0.125,
  };
  const puzzle = {
    ...component("puzzle", "maze", 80, 180),
    puzzleRef: p.id,
    width: 460,
    height: 470,
  };
  const title = {
    ...component("text", "title", 40, 50),
    font: "Fredoka" as const,
    text: "A fresh adventure",
    height: 70,
  };
  p.editor.state.components = [title, puzzle];
  const svg = compose(p);
  expect(svg).toContain('width="9.125in"');
  expect(svg).not.toMatch(/selection|data-editor-overlay|#a7dcc8|layout-grid/);
  expect(preflight(a, "review", "no-bleed").valid).toBe(true);
  const font = new Uint8Array(
      await readFile("apps/studio/public/fonts/OpenSans-Regular.ttf"),
    ),
    fredoka = new Uint8Array(
      await readFile("apps/studio/public/fonts/fredoka/Fredoka-Print.ttf"),
    );
  const zip = await exportPackage(a, font, {
    mode: "review",
    profile: "no-bleed",
    fonts: { Fredoka: fredoka },
  });
  const pdf = (await zip.file("interior.pdf")!.async("nodebuffer")).toString();
  expect(pdf).toContain("/MediaBox [0 0 657 738]");
  expect(pdf).toContain("/FontFile2");
});

test("logical activity configuration travels with canvas undo and redo", () => {
  const p = prototype().pages[1],
    e = initialEditor(p);
  const newer = change(e, {
    ...e.state,
    activity: {
      mechanic: "word-search",
      seed: "new-seed",
      difficulty: "gentle",
      config: { size: 10 },
    },
  });
  expect(undo(newer).state.activity?.mechanic).toBe("maze");
  expect(redo(undo(newer)).state.activity?.seed).toBe("new-seed");
});
test("imported asset approval is checked independently from page approval", () => {
  const a = prototype();
  a.pages = [makePage("maze", 1, "asset-check")];
  const p = a.pages[0];
  p.editor = initialEditor(p, true);
  p.editor.state.components = [
    {
      ...component("puzzle", "maze", 70, 200),
      puzzleRef: p.id,
      width: 450,
      height: 470,
    },
    { ...component("asset", "imported", 40, 40), assetId: "asset" },
  ];
  p.editor.state.assets = [
    {
      id: "asset",
      familyId: "family",
      name: "Original icon",
      category: "Decorative",
      tags: [],
      favourite: false,
      version: 1,
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="30" fill="white" stroke="black"/></svg>',
      source: "test fixture",
      licence: "Original fixture",
      hash: "not-used-in-preflight",
      createdAt: new Date().toISOString(),
      review: "Needs Review",
      reviewNote: "",
    },
  ];
  p.status = "Approved";
  p.reviewNote = "Page fixture";
  expect(preflight(a, "publication", "no-bleed").errors.join()).toContain(
    "imported asset rights approval required",
  );
});

test("PNG previews carry their selected physical resolution", async () => {
  const { setPngDpi } = await import("../packages/print/png");
  const sharp = (await import("sharp")).default;
  const png = await sharp({
    create: { width: 10, height: 10, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  const output = setPngDpi(png, 300);
  expect((await sharp(output).metadata()).density).toBe(300);
});
