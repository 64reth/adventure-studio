import type { Page } from "../core/index";
import { registry, validate } from "../puzzles/index";
import { wrapText } from "./typography";
import { safeSvg } from "./assets";
import { gutter, type PrintProfile } from "../print/index";
import {
  CanvasStateSchema,
  type CanvasComponent,
  type CanvasState,
  type Editor,
  type PrintSettings,
} from "./schema";
export const presets: Record<string, [number, number]> = {
  Letter: [8.5, 11],
  A4: [210 / 25.4, 297 / 25.4],
  A5: [148 / 25.4, 210 / 25.4],
  Square: [8.5, 8.5],
  Pocket: [6, 9],
};
export const defaultPrint: PrintSettings = {
  preset: "Letter",
  width: 8.5,
  height: 11,
  bleed: 0,
  inside: 0.385,
  outside: 0.385,
  top: 0.385,
  bottom: 0.385,
  inset: 0.385,
  gutter: 0.375,
  dpi: 300,
};
export const colouringBookBold = {
  id: "colouring-book-bold",
  primary: 2.25,
  secondary: 1.5,
  fine: 0.8,
  units: "pt",
} as const;
export function visualLayout(
  print: PrintSettings,
  number = 1,
  count = 5,
  profile?: PrintProfile,
) {
  const bleed =
    profile === "kdp-bleed"
      ? print.bleed || 0.125
      : profile === "no-bleed"
        ? 0
        : print.bleed;
  const odd = number % 2 === 1;
  const inside = Math.max(
    print.inside,
    print.gutter,
    print.inset,
    gutter(count),
  );
  const outside = Math.max(print.outside, print.inset);
  const top = Math.max(print.top, print.inset),
    bottom = Math.max(print.bottom, print.inset);
  const trim = {
    x: odd ? 0 : bleed,
    y: bleed,
    width: print.width,
    height: print.height,
  };
  return {
    width: print.width + bleed,
    height: print.height + 2 * bleed,
    trim,
    gutter: inside,
    safe: {
      x: trim.x + (odd ? inside : outside),
      y: trim.y + top,
      width: print.width - inside - outside,
      height: print.height - top - bottom,
    },
  };
}
export function component(
  kind: CanvasComponent["kind"],
  variant: string,
  x = 40,
  y = 40,
): CanvasComponent {
  return {
    id: crypto.randomUUID(),
    kind,
    name: variant,
    x,
    y,
    width: kind === "puzzle" ? 460 : kind === "text" ? 280 : 90,
    height: kind === "puzzle" ? 470 : kind === "text" ? 50 : 90,
    lineWeight: 1.5,
    rotation: 0,
    visible: true,
    locked: false,
    variant,
    text:
      variant === "title"
        ? "Your adventure"
        : variant === "instructions"
          ? "Find your way through the puzzle."
          : variant === "answer"
            ? "Answer: __________________"
            : "Your story begins here.",
    font: "OpenSans",
    fontSize: variant === "title" ? 24 : 13,
    align: "left",
    lineHeight: 1.4,
    ...(kind === "character"
      ? {
          character: {
            characterId: crypto.randomUUID(),
            assetRef: "",
            poseRef: "standing",
            expression: "happy",
            facing: "right" as const,
            role: "adventurer",
            clue: "",
          },
        }
      : {}),
  };
}
export function initialEditor(page: Page, blank = false): Editor {
  const comps: CanvasComponent[] = blank
    ? []
    : [
        {
          ...component("text", "title", 28, 33),
          text: page.title,
          width: 556,
          height: 40,
        },
        {
          ...component("text", "story", 28, 78),
          text: page.story,
          width: 556,
          height: 55,
        },
        {
          ...component("text", "instructions", 28, 137),
          text: page.instructions,
          width: 556,
          height: 60,
        },
        {
          ...component("puzzle", page.mechanic, 34, 203),
          width: 544,
          height: 536,
          puzzleRef: page.id,
        },
        {
          ...component("text", "page number", 540, 742),
          text: String(page.number),
          width: 35,
          height: 18,
          fontSize: 10,
        },
      ];
  return {
    schemaVersion: 1,
    state: {
      print: { ...defaultPrint },
      grid: {
        columns: 12,
        rows: 16,
        gap: 8,
        visible: true,
        snap: true,
        edges: true,
        free: false,
      },
      components: comps,
      assets: [],
      activity: {
        mechanic: page.mechanic,
        seed: page.seed,
        difficulty: page.difficulty,
        config: page.config,
      },
      style: "colouring-book-bold",
    },
    past: [],
    future: [],
  };
}
export function change(editor: Editor, state: CanvasState): Editor {
  const parsed = CanvasStateSchema.parse(state);
  parsed.assets = parsed.assets.filter((a) =>
    parsed.components.some((c) => c.assetId === a.id),
  );
  if (JSON.stringify(parsed) === JSON.stringify(editor.state)) return editor;
  const past = [...editor.past, structuredClone(editor.state)].slice(-30);
  while (past.length && JSON.stringify(past).length > 600000) past.shift();
  return { ...editor, state: parsed, past, future: [] };
}
export function undo(editor: Editor): Editor {
  const previous = editor.past.at(-1);
  return previous
    ? {
        ...editor,
        state: previous,
        past: editor.past.slice(0, -1),
        future: [editor.state, ...editor.future].slice(0, 30),
      }
    : editor;
}
export function redo(editor: Editor): Editor {
  const next = editor.future[0];
  return next
    ? {
        ...editor,
        state: next,
        past: [...editor.past, editor.state].slice(-30),
        future: editor.future.slice(1),
      }
    : editor;
}
export function resizePage(
  state: CanvasState,
  print: PrintSettings,
): CanvasState {
  const sx = print.width / state.print.width,
    sy = print.height / state.print.height;
  return {
    ...state,
    print,
    components: state.components.map((c) => ({
      ...c,
      x: c.x * sx,
      y: c.y * sy,
      width: c.width * sx,
      height: c.height * sy,
    })),
  };
}
export function snapPosition(
  state: CanvasState,
  c: CanvasComponent,
  x: number,
  y: number,
  ignore: string[] = [],
) {
  if (state.grid.free) return { x, y };
  const l = visualLayout(state.print),
    g = state.grid;
  const cellX = (l.safe.width * 72) / g.columns,
    cellY = (l.safe.height * 72) / g.rows;
  let X = x,
    Y = y;
  if (g.snap) {
    X =
      (l.safe.x - l.trim.x) * 72 +
      Math.round((x - (l.safe.x - l.trim.x) * 72) / cellX) * cellX;
    Y =
      (l.safe.y - l.trim.y) * 72 +
      Math.round((y - (l.safe.y - l.trim.y) * 72) / cellY) * cellY;
  }
  if (g.edges) {
    for (const other of state.components.filter(
      (o) => o.id !== c.id && !ignore.includes(o.id) && o.visible,
    )) {
      for (const edge of [other.x, other.x + other.width])
        for (const offset of [0, c.width])
          if (Math.abs(x + offset - edge) < 5) X = edge - offset;
      for (const edge of [other.y, other.y + other.height])
        for (const offset of [0, c.height])
          if (Math.abs(y + offset - edge) < 5) Y = edge - offset;
    }
  }
  return { x: Math.round(X * 10) / 10, y: Math.round(Y * 10) / 10 };
}
export function rotateBounds(c: CanvasComponent) {
  const r = (c.rotation * Math.PI) / 180,
    w = Math.abs(c.width * Math.cos(r)) + Math.abs(c.height * Math.sin(r)),
    h = Math.abs(c.width * Math.sin(r)) + Math.abs(c.height * Math.cos(r));
  return {
    x: c.x + (c.width - w) / 2,
    y: c.y + (c.height - h) / 2,
    width: w,
    height: h,
  };
}
export function canvasQA(page: Page, state = page.editor?.state) {
  const errors: string[] = [],
    warnings: string[] = [];
  if (!state) return { valid: true, errors, warnings };
  const l = visualLayout(state.print, page.number, Math.max(page.number, 5));
  const safe = {
    x: (l.safe.x - l.trim.x) * 72,
    y: (l.safe.y - l.trim.y) * 72,
    width: l.safe.width * 72,
    height: l.safe.height * 72,
  };
  if (safe.width <= 0 || safe.height <= 0)
    errors.push("Margins leave no printable area");
  if (
    state.activity &&
    (state.activity.mechanic !== page.mechanic ||
      state.activity.seed !== page.seed ||
      JSON.stringify(state.activity.config) !== JSON.stringify(page.config))
  )
    errors.push("Saved activity configuration differs from puzzle data");
  for (const asset of state.assets) {
    try {
      safeSvg(asset.svg);
    } catch (e) {
      errors.push(String(e));
    }
  }
  const puzzles = state.components.filter(
    (c) => c.kind === "puzzle" && c.visible,
  );
  if (puzzles.length !== 1)
    errors.push("Place exactly one visible principal activity");
  for (const c of state.components.filter((c) => c.visible)) {
    const box = rotateBounds(c);
    if (
      box.x < safe.x - 0.1 ||
      box.y < safe.y - 0.1 ||
      box.x + box.width > safe.x + safe.width + 0.1 ||
      box.y + box.height > safe.y + safe.height + 0.1
    )
      errors.push(`${c.name}: outside safe print margins`);
    if (
      c.kind === "text" &&
      wrapText(c.text, c.width, c.fontSize, c.font).length *
        c.fontSize *
        c.lineHeight >
        c.height + 1
    )
      errors.push(`${c.name}: text exceeds its component height`);
    if (c.kind === "puzzle") {
      if (c.puzzleRef !== page.id)
        errors.push("Activity reference does not match this page");
      if (c.rotation)
        errors.push("Rotate decorative components; keep puzzles upright");
      if (c.width < 220 || c.height < 230)
        errors.push("Activity is too small for readable print");
    }
    if (c.kind === "asset" && !state.assets.some((a) => a.id === c.assetId))
      errors.push(`${c.name}: missing asset`);
  }
  for (const p of puzzles)
    for (const c of state.components.filter(
      (c) => c.visible && c.id !== p.id && c.kind !== "frame",
    )) {
      const a = rotateBounds(c);
      if (
        a.x < p.x + p.width &&
        a.x + a.width > p.x &&
        a.y < p.y + p.height &&
        a.y + a.height > p.y
      )
        errors.push(`${c.name}: overlaps protected activity`);
    }
  try {
    errors.push(
      ...validate(
        registry[page.mechanic].generate(
          { ...page.config, difficulty: page.difficulty },
          page.seed,
        ),
      ).errors,
    );
  } catch (e) {
    errors.push(String(e));
  }
  return { valid: !errors.length, errors, warnings };
}
export function reorder(state: CanvasState, id: string, direction: number) {
  const components = [...state.components],
    i = components.findIndex((c) => c.id === id),
    j = Math.max(0, Math.min(components.length - 1, i + direction));
  if (i < 0) return state;
  const [c] = components.splice(i, 1);
  components.splice(j, 0, c);
  return { ...state, components };
}
export function alignComponents(
  state: CanvasState,
  ids: string[],
  mode: "left" | "top" | "center" | "distribute",
) {
  const selected = state.components.filter((c) => ids.includes(c.id));
  if (!selected.length) return state;
  const minX = Math.min(...selected.map((c) => c.x)),
    minY = Math.min(...selected.map((c) => c.y)),
    maxX = Math.max(...selected.map((c) => c.x + c.width));
  const sorted = [...selected].sort((a, b) => a.x - b.x);
  const gap =
    selected.length > 1
      ? (maxX - minX - selected.reduce((n, c) => n + c.width, 0)) /
        (selected.length - 1)
      : 0;
  let x = minX;
  const distributed = new Map(
    sorted.map((c) => {
      const start = x;
      x += c.width + gap;
      return [c.id, start];
    }),
  );
  return {
    ...state,
    components: state.components.map((c) =>
      !ids.includes(c.id)
        ? c
        : {
            ...c,
            ...(mode === "left"
              ? { x: minX }
              : mode === "top"
                ? { y: minY }
                : mode === "center"
                  ? { x: (minX + maxX - c.width) / 2 }
                  : { x: distributed.get(c.id)! }),
          },
    ),
  };
}
