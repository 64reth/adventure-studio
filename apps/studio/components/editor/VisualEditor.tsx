"use client";
import { useEffect, useRef, useState } from "react";
import {
  Undo2,
  Redo2,
  Save,
  Trash2,
  Copy,
  AlignLeft,
  AlignStartVertical,
  Columns3,
  Group,
  Ungroup,
  ZoomIn,
  Hand,
  MousePointer2,
  Layers,
  Search,
  Lock,
  Eye,
  ChevronUp,
  ChevronDown,
  Plus,
  Grid2X2,
  CheckCircle2,
  Move,
  RotateCw,
  Maximize2,
} from "lucide-react";
import {
  PageSchema,
  type Page,
  type Mechanic,
} from "../../../../packages/core/index";
import { mechanics } from "../../../../packages/core/index";
import {
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
  presets,
} from "../../../../packages/editor/model";
import type {
  CanvasComponent,
  CanvasState,
  Editor,
  LibraryAsset,
  PrintSettings,
} from "../../../../packages/editor/schema";
import { illustration } from "../../../../packages/editor/render";
import { registry, solve } from "../../../../packages/puzzles/index";
import { compose } from "../../../../packages/composer/index";
import { LibraryAssetSchema } from "../../../../packages/editor/schema";
import { readLibrary } from "../../../../packages/editor/assets";
const activityNames: Record<Mechanic, string> = {
  maze: "Maze",
  route: "Route deduction",
  reveal: "Hidden-message colouring",
  "word-search": "Word search",
  cipher: "Symbol cipher",
};
const descriptions: Record<Mechanic, string> = {
  maze: "Find a path through connected passages.",
  route: "Use five clues to choose the matching gate.",
  reveal: "Colour selected cells to reveal a message.",
  "word-search": "Find hidden words in a verified grid.",
  cipher: "Decode an original substitution alphabet.",
};
const library = [
  ...mechanics.map((v) => ({
    kind: "puzzle" as const,
    variant: v,
    category: "Activities",
    label: activityNames[v],
  })),
  ...["knight", "dragon", "princess", "robot", "fairy", "teddy"].map((v) => ({
    kind: "character" as const,
    variant: v,
    category: "Characters",
    label: v === "teddy" ? "Teddy bear" : v,
  })),
  ...[
    "building",
    "tree",
    "bridge",
    "river",
    "mountain",
    "door",
    "window",
    "cloud",
  ].map((v) => ({
    kind: "scenery" as const,
    variant: v,
    category: "Environment",
    label: v,
  })),
  ...[
    "title",
    "story",
    "instructions",
    "clue key",
    "answer",
    "inventory",
    "page number",
  ].map((v) => ({
    kind: "text" as const,
    variant: v,
    category: "Page elements",
    label: v,
  })),
  {
    kind: "frame" as const,
    variant: "frame",
    category: "Page elements",
    label: "Border / frame",
  },
];
type Drag = {
  mode: "move" | "resize" | "pan";
  x: number;
  y: number;
  components: CanvasComponent[];
  state: CanvasState;
  scrollX: number;
  scrollY: number;
};
export default function VisualEditor({
  page,
  storageId,
  count,
  onSave,
  onDirty,
}: {
  page: Page;
  storageId: string;
  count: number;
  onSave: (page: Page) => Promise<unknown>;
  onDirty: (dirty: boolean) => void;
}) {
  const draftKey = `adventure-studio:canvas-draft:${storageId}:${page.id}`;
  const [draft, setDraft] = useState<Page>(() => {
      try {
        if (
          typeof localStorage !== "undefined" &&
          !["Approved", "Exported"].includes(page.status)
        ) {
          const raw = localStorage.getItem(draftKey);
          if (raw) {
            const cached = PageSchema.parse(JSON.parse(raw));
            if (cached.revision === page.revision) return cached;
          }
        }
      } catch {}
      return { ...page, editor: page.editor ?? initialEditor(page) };
    }),
    [selected, setSelected] = useState<string[]>([]),
    [dirty, setDirty] = useState(
      !["Approved", "Exported"].includes(page.status) &&
        (!page.editor ||
          JSON.stringify(draft.editor) !== JSON.stringify(page.editor)),
    ),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("Activities"),
    [zoom, setZoom] = useState(0.8),
    [guides, setGuides] = useState(true),
    [solution, setSolution] = useState(false),
    [printPreview, setPrintPreview] = useState(false),
    [pan, setPan] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [focusMode, setFocusMode] = useState(false),
    [tab, setTab] = useState<"properties" | "page" | "layers">("properties"),
    [assets, setAssets] = useState<LibraryAsset[]>([]),
    [difficulty, setDifficulty] = useState<Page["difficulty"]>("standard"),
    [seed, setSeed] = useState(page.seed),
    [gridSize, setGridSize] = useState(12),
    [template, setTemplate] = useState("Balanced");
  const wrapper = useRef<HTMLDivElement>(null),
    svgRef = useRef<SVGSVGElement>(null),
    drag = useRef<Drag | null>(null),
    draftRef = useRef(draft);
  draftRef.current = draft;
  const locked = ["Approved", "Exported"].includes(page.status),
    editor = draft.editor!,
    state = editor.state,
    active = state.components.find((c) => selected.includes(c.id)),
    l = visualLayout(state.print, page.number, count);
  const qa = canvasQA(draft),
    width = state.print.width * 72,
    height = state.print.height * 72;
  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);
  useEffect(() => {
    try {
      if (dirty && !locked)
        localStorage.setItem(draftKey, JSON.stringify(draft));
      else localStorage.removeItem(draftKey);
    } catch {
      setError(
        "Draft backup is full. Save the layout and download project JSON.",
      );
    }
  }, [draft, dirty, locked, draftKey]);
  useEffect(() => {
    if (!dirty) {
      setDraft({ ...page, editor: page.editor ?? initialEditor(page) });
      setSeed(page.seed);
      setDifficulty(page.difficulty);
      setGridSize(typeof page.config.size === "number" ? page.config.size : 12);
    }
  }, [page, dirty]);
  useEffect(() => {
    try {
      setAssets(LibraryAssetSchema.array().parse(readLibrary()));
    } catch (e) {
      setError(String(e));
    }
  }, [category]);
  let previewSvg = "",
    answer = "Hidden";
  try {
    previewSvg = compose(draft, { solution, count, profile: "no-bleed" });
    if (solution)
      answer =
        solve(
          registry[draft.mechanic].generate(
            { ...draft.config, difficulty: draft.difficulty },
            draft.seed,
          ),
        )[0]?.answer ?? "Invalid";
  } catch {
    previewSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/><text x="30" y="50" font-size="14">Fix the activity configuration in the inspector.</text></svg>`;
    answer = "Invalid configuration";
  }
  function commit(next: CanvasState, extra: Partial<Page> = {}) {
    if (locked) return;
    try {
      const d = draftRef.current;
      const editor = change(d.editor!, {
        ...next,
        activity: {
          mechanic: extra.mechanic ?? d.mechanic,
          seed: extra.seed ?? d.seed,
          difficulty: extra.difficulty ?? d.difficulty,
          config: extra.config ?? d.config,
        },
      });
      setDraft({ ...d, ...extra, editor });
      setDirty(true);
      setNotice("");
      setError("");
    } catch (e) {
      setError(`Edit rejected: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  function patch(p: Partial<CanvasComponent>) {
    if (!active) return;
    commit({
      ...state,
      components: state.components.map((c) =>
        selected.includes(c.id)
          ? { ...c, ...p, ...(c.kind === "puzzle" ? { rotation: 0 } : {}) }
          : c,
      ),
    });
  }
  function updatePrint(p: Partial<PrintSettings>) {
    try {
      const print = { ...state.print, ...p };
      commit(resizePage(state, print));
    } catch (e) {
      setError(String(e));
    }
  }
  function place(
    kind: CanvasComponent["kind"],
    variant: string,
    point?: { x: number; y: number },
    asset?: LibraryAsset,
  ) {
    if (locked) return;
    let c = component(kind, variant);
    let components = state.components;
    if (kind === "puzzle") {
      c = {
        ...c,
        width: template === "Compact" ? 350 : 460,
        height: template === "Compact" ? 370 : 470,
        puzzleRef: page.id,
      };
      components = components.filter((c) => c.kind !== "puzzle");
    }
    if (kind === "text") {
      c = {
        ...c,
        text:
          variant === "title"
            ? draft.title
            : variant === "story"
              ? draft.story
              : variant === "instructions"
                ? draft.instructions
                : variant === "page number"
                  ? String(page.number)
                  : variant === "clue key"
                    ? "Clue key: look carefully."
                    : variant === "inventory"
                      ? "Inventory: __________________"
                      : c.text,
      };
    }
    if (asset)
      c = {
        ...c,
        kind: "asset",
        assetId: asset.id,
        name: asset.name,
        variant: "imported",
      };
    if (point) {
      c = {
        ...c,
        ...snapPosition({ ...state, components }, c, point.x, point.y),
      };
    } else {
      let found = false;
      const sx = (l.safe.x - l.trim.x) * 72,
        sy = (l.safe.y - l.trim.y) * 72;
      for (
        let y = sy;
        y + c.height <= sy + l.safe.height * 72 && !found;
        y += 18
      )
        for (
          let x = sx;
          x + c.width <= sx + l.safe.width * 72 && !found;
          x += 18
        ) {
          if (
            !components.some(
              (o) =>
                o.visible &&
                o.kind !== "frame" &&
                x < o.x + o.width &&
                x + c.width > o.x &&
                y < o.y + o.height &&
                y + c.height > o.y,
            )
          ) {
            c = { ...c, x, y };
            found = true;
          }
        }
      if (!found) c = { ...c, x: sx, y: sy };
    }
    let extra: Partial<Page> = {};
    if (kind === "puzzle") {
      const mechanic = variant as Mechanic;
      const config =
        mechanic === "maze" || mechanic === "word-search"
          ? { size: gridSize }
          : {};
      try {
        registry[mechanic].generate({ ...config, difficulty }, seed);
        extra = { mechanic, seed, difficulty, config };
      } catch (e) {
        setError(String(e));
        return;
      }
    }
    commit(
      {
        ...state,
        components: [...components, c],
        assets:
          asset && !state.assets.some((a) => a.id === asset.id)
            ? [...state.assets, asset]
            : state.assets,
      },
      extra,
    );
    setSelected([c.id]);
    setTab("properties");
  }
  async function save() {
    try {
      setError("");
      if (locked) return;
      await onSave(draft);
      localStorage.removeItem(draftKey);
      setDirty(false);
      setNotice("Layout saved on this device.");
    } catch (e) {
      setError(String(e));
    }
  }
  function history(direction: "undo" | "redo") {
    if (locked) return;
    const d = draftRef.current;
    const editor = direction === "undo" ? undo(d.editor!) : redo(d.editor!);
    setDraft({ ...d, ...editor.state.activity, editor });
    if (editor.state.activity) {
      setSeed(editor.state.activity.seed);
      setDifficulty(editor.state.activity.difficulty);
      setGridSize(
        typeof editor.state.activity.config.size === "number"
          ? editor.state.activity.config.size
          : 12,
      );
    }
    setDirty(true);
  }
  function remove() {
    commit({
      ...state,
      components: state.components.filter((c) => !selected.includes(c.id)),
    });
    setSelected([]);
  }
  function duplicate() {
    const items = state.components
      .filter((c) => selected.includes(c.id) && c.kind !== "puzzle")
      .map((c) => ({
        ...c,
        id: crypto.randomUUID(),
        x: c.x + 15,
        y: c.y + 15,
        group: undefined,
      }));
    if (!items.length) {
      setNotice(
        "One principal activity per page. Add another page for a second puzzle.",
      );
      return;
    }
    commit({ ...state, components: [...state.components, ...items] });
    setSelected(items.map((c) => c.id));
  }
  function localPoint(clientX: number, clientY: number) {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
    return { x: p.x, y: p.y };
  }
  function start(
    event: React.PointerEvent,
    mode: Drag["mode"],
    c?: CanvasComponent,
  ) {
    if (mode !== "pan" && (locked || c?.locked)) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = localPoint(event.clientX, event.clientY);
    let ids = selected;
    if (c) {
      if (event.shiftKey) {
        ids = selected.includes(c.id)
          ? selected.filter((id) => id !== c.id)
          : [...selected, c.id];
        setSelected(ids);
        return;
      }
      if (!selected.includes(c.id)) {
        ids = c.group
          ? state.components.filter((o) => o.group === c.group).map((o) => o.id)
          : [c.id];
        setSelected(ids);
      }
    }
    drag.current = {
      mode,
      x: p.x,
      y: p.y,
      components: state.components.filter(
        (c) => ids.includes(c.id) && !c.locked,
      ),
      state: structuredClone(state),
      scrollX: wrapper.current?.scrollLeft ?? 0,
      scrollY: wrapper.current?.scrollTop ?? 0,
    };
  }
  function moving(e: React.PointerEvent) {
    const session = drag.current;
    if (!session) return;
    const p = localPoint(e.clientX, e.clientY),
      dx = p.x - session.x,
      dy = p.y - session.y;
    if (session.mode === "pan") {
      if (wrapper.current) {
        wrapper.current.scrollLeft -= e.movementX;
        wrapper.current.scrollTop -= e.movementY;
      }
      return;
    }
    const first = session.components[0];
    if (!first) return;
    const target = snapPosition(
      session.state,
      first,
      first.x + dx,
      first.y + dy,
      session.components.map((c) => c.id),
    );
    const tx = target.x - first.x,
      ty = target.y - first.y;
    const components = session.state.components.map((c) =>
      !session.components.some((s) => s.id === c.id)
        ? c
        : session.mode === "resize"
          ? {
              ...c,
              width: Math.min(1800, Math.max(20, c.width + dx)),
              height: Math.min(1800, Math.max(20, c.height + dy)),
            }
          : { ...c, x: c.x + tx, y: c.y + ty },
    );
    setDraft((d) => ({
      ...d,
      editor: { ...d.editor!, state: { ...d.editor!.state, components } },
    }));
  }
  function end() {
    const session = drag.current;
    drag.current = null;
    if (session && session.mode !== "pan") {
      setDraft((d) => {
        const result = d.editor!.state;
        return {
          ...d,
          editor: change({ ...d.editor!, state: session.state }, result),
        };
      });
      setDirty(true);
    }
  }
  function keys(e: React.KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
    const cmd = e.metaKey || e.ctrlKey;
    if (cmd && e.key.toLowerCase() === "s") {
      e.preventDefault();
      save();
    } else if (cmd && e.key.toLowerCase() === "z") {
      e.preventDefault();
      history(e.shiftKey ? "redo" : "undo");
    } else if (cmd && e.key.toLowerCase() === "y") {
      e.preventDefault();
      history("redo");
    } else if (cmd && e.key.toLowerCase() === "d") {
      e.preventDefault();
      duplicate();
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      remove();
    } else if (e.key === "Escape") {
      setSelected([]);
      setPan(false);
      setFocusMode(false);
    } else if (e.code === "Space") {
      e.preventDefault();
      setPan(true);
    } else if (e.key.startsWith("Arrow") && active) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      commit({
        ...state,
        components: state.components.map((c) =>
          selected.includes(c.id)
            ? {
                ...c,
                x:
                  c.x +
                  (e.key === "ArrowLeft"
                    ? -step
                    : e.key === "ArrowRight"
                      ? step
                      : 0),
                y:
                  c.y +
                  (e.key === "ArrowUp"
                    ? -step
                    : e.key === "ArrowDown"
                      ? step
                      : 0),
              }
            : c,
        ),
      });
    }
  }
  function fit() {
    if (wrapper.current)
      setZoom(
        Math.max(
          0.2,
          Math.min(
            (wrapper.current.clientWidth - 70) / width,
            (wrapper.current.clientHeight - 70) / height,
            1.3,
          ),
        ),
      );
  }
  function regenerate() {
    try {
      registry[draft.mechanic].generate(
        {
          ...draft.config,
          difficulty,
          ...(["maze", "word-search"].includes(draft.mechanic)
            ? { size: gridSize }
            : {}),
        },
        seed,
      );
      commit(state, {
        seed,
        difficulty,
        config: {
          ...draft.config,
          ...(["maze", "word-search"].includes(draft.mechanic)
            ? { size: gridSize }
            : {}),
        },
      });
      setNotice("Activity regenerated and independently validated.");
    } catch (e) {
      setError(String(e));
    }
  }
  const button = (
    label: string,
    icon: React.ReactNode,
    fn: () => void,
    disabled = false,
  ) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={fn}
      disabled={disabled}
    >
      {icon}
    </button>
  );
  return (
    <section
      className={`visual-studio ${focusMode ? "focus-mode" : ""}`}
      onKeyDown={keys}
      onKeyUp={(e) => {
        if (e.code === "Space") setPan(false);
      }}
      tabIndex={-1}
      aria-label="Visual Page Studio"
    >
      <div className="visual-toolbar">
        <div className="actions">
          {button(
            "Undo",
            <Undo2 size={18} />,
            () => history("undo"),
            locked || !editor.past.length,
          )}
          {button(
            "Redo",
            <Redo2 size={18} />,
            () => history("redo"),
            locked || !editor.future.length,
          )}
          <span className="toolbar-divider" />
          {button("Select tool", <MousePointer2 size={18} />, () =>
            setPan(false),
          )}
          {button("Pan tool", <Hand size={18} />, () => setPan(true))}
          {button(
            "Duplicate selection",
            <Copy size={18} />,
            duplicate,
            locked || !selected.length,
          )}
          {button(
            "Delete selection",
            <Trash2 size={18} />,
            remove,
            locked || !selected.length,
          )}
          <span className="toolbar-divider" />
          {button(
            "Align left",
            <AlignLeft size={18} />,
            () => commit(alignComponents(state, selected, "left")),
            locked || selected.length < 2,
          )}
          {button(
            "Align top",
            <AlignStartVertical size={18} />,
            () => commit(alignComponents(state, selected, "top")),
            locked || selected.length < 2,
          )}
          {button(
            "Distribute horizontally",
            <Columns3 size={18} />,
            () => commit(alignComponents(state, selected, "distribute")),
            locked || selected.length < 3,
          )}
          {button(
            "Group selection",
            <Group size={18} />,
            () => {
              const group = crypto.randomUUID();
              commit({
                ...state,
                components: state.components.map((c) =>
                  selected.includes(c.id) ? { ...c, group } : c,
                ),
              });
            },
            locked || selected.length < 2,
          )}
          {button(
            "Ungroup selection",
            <Ungroup size={18} />,
            () => patch({ group: undefined }),
            locked || !active?.group,
          )}
        </div>
        <div className="actions">
          {button("Expand workspace", <Maximize2 size={17} />, () => {
            setFocusMode(!focusMode);
            setTimeout(fit, 50);
          })}
          <button
            onClick={() => {
              const r = canvasQA(draft);
              setNotice(
                r.valid
                  ? "Validated: one solution; layout is print-safe."
                  : r.errors.join(" · "),
              );
            }}
          >
            <CheckCircle2 size={16} /> Validate layout
          </button>
          <button className="primary" onClick={save} disabled={locked}>
            <Save size={17} /> Save layout{dirty ? " •" : ""}
          </button>
        </div>
      </div>
      {locked && (
        <div className="note">
          Approved layout is locked. Reopen the page below to make changes.
        </div>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="editor-message">
          {notice}
        </p>
      )}
      <div className="visual-regions">
        <aside className="component-library">
          <div className="panel-heading">
            <h3>Components</h3>
            <span className="badge">Drag or tap +</span>
          </div>
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label="Search components"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a component…"
            />
          </label>
          <div className="library-categories">
            {[
              "Activities",
              "Characters",
              "Environment",
              "Page elements",
              "My assets",
            ].map((c) => (
              <button
                key={c}
                className={category === c ? "active" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          {category === "My assets" && (
            <button
              onClick={() => {
                const library = LibraryAssetSchema.array().parse(readLibrary());
                commit({
                  ...state,
                  assets: state.assets.map(
                    (a) =>
                      library.find((l) => l.id === a.id && l.hash === a.hash) ??
                      a,
                  ),
                });
              }}
            >
              Refresh asset reviews
            </button>
          )}
          {category === "Activities" && (
            <div className="activity-options">
              <label>
                Activity difficulty
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as Page["difficulty"])
                  }
                >
                  {["gentle", "standard", "challenging"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label>
                Activity seed
                <input value={seed} onChange={(e) => setSeed(e.target.value)} />
              </label>
              <label>
                Logical grid size
                <input
                  type="number"
                  min={6}
                  max={20}
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                />
              </label>
              <label>
                Activity layout
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                >
                  <option>Balanced</option>
                  <option>Compact</option>
                </select>
              </label>
            </div>
          )}
          <div className="component-tiles">
            {category === "My assets"
              ? assets
                  .filter((a) =>
                    a.name.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((a) => (
                    <button
                      key={a.id}
                      disabled={locked}
                      draggable={!locked}
                      onDragStart={(e) =>
                        e.dataTransfer.setData(
                          "application/adventure-component",
                          JSON.stringify({
                            kind: "asset",
                            variant: "imported",
                            assetId: a.id,
                          }),
                        )
                      }
                      onClick={() => place("asset", "imported", undefined, a)}
                      className="component-tile"
                    >
                      <span
                        className="component-thumbnail"
                        dangerouslySetInnerHTML={{ __html: a.svg }}
                      />
                      <span>{a.name}</span>
                      <small>{a.review}</small>
                    </button>
                  ))
              : library
                  .filter(
                    (c) =>
                      c.category === category &&
                      c.label.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((item) => (
                    <button
                      key={item.variant}
                      draggable={!locked}
                      disabled={locked}
                      className="component-tile"
                      aria-label={`Add ${item.label}`}
                      title={
                        item.kind === "puzzle"
                          ? descriptions[item.variant as Mechanic]
                          : `Drag ${item.label} onto the page, or click to add`
                      }
                      onDragStart={(e) =>
                        e.dataTransfer.setData(
                          "application/adventure-component",
                          JSON.stringify(item),
                        )
                      }
                      onClick={() => place(item.kind, item.variant)}
                    >
                      <span className="component-thumbnail">
                        {item.kind === "puzzle" ? (
                          <ActivityThumb kind={item.variant as Mechanic} />
                        ) : item.kind === "text" ? (
                          <span className="type-thumb">
                            {item.variant === "title" ? "Aa" : "Tt"}
                          </span>
                        ) : (
                          <svg
                            viewBox="0 0 100 100"
                            dangerouslySetInnerHTML={{
                              __html: illustration(item.variant),
                            }}
                          />
                        )}
                      </span>
                      <span className="tile-label">
                        {item.label}
                        <Plus size={13} />
                      </span>
                    </button>
                  ))}
          </div>
          <p className="small muted">
            Shift-click to select several items.
            <br />
            ⌘/Ctrl Z undo · arrows nudge
            <br />
            Space + drag to pan.
          </p>
        </aside>
        <div className="canvas-column">
          <div className="canvas-controls">
            <button onClick={fit}>Fit page</button>
            <button onClick={() => setZoom(96 / 72)}>Actual print size</button>
            <label>
              <input
                type="checkbox"
                checked={printPreview}
                onChange={(e) => setPrintPreview(e.target.checked)}
              />
              Monochrome preview
            </label>
            <label>
              <ZoomIn size={15} />
              <input
                aria-label="Canvas zoom"
                type="range"
                min={20}
                max={160}
                value={zoom * 100}
                onChange={(e) => setZoom(Number(e.target.value) / 100)}
              />
              <span>{Math.round(zoom * 100)}%</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={state.grid.visible}
                onChange={(e) =>
                  commit({
                    ...state,
                    grid: { ...state.grid, visible: e.target.checked },
                  })
                }
              />
              Grid
            </label>
            <label>
              <input
                type="checkbox"
                checked={guides}
                onChange={(e) => setGuides(e.target.checked)}
              />
              Print guides
            </label>
            <label>
              <input
                type="checkbox"
                checked={solution}
                onChange={(e) => setSolution(e.target.checked)}
              />
              Show solution
            </label>
          </div>
          <div
            ref={wrapper}
            className={`visual-canvas-scroll ${pan ? "panning" : ""}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const item = JSON.parse(
                  e.dataTransfer.getData("application/adventure-component"),
                ) as {
                  kind: CanvasComponent["kind"];
                  variant: string;
                  assetId?: string;
                };
                place(
                  item.kind,
                  item.variant,
                  localPoint(e.clientX, e.clientY),
                  assets.find((a) => a.id === item.assetId),
                );
              } catch {
                setError("Choose a component from the library.");
              }
            }}
          >
            <div
              className="visual-paper"
              style={{ width: width * zoom, height: height * zoom }}
            >
              <div
                className="composition-image"
                dangerouslySetInnerHTML={{
                  __html: previewSvg,
                }}
              />
              <svg
                ref={svgRef}
                className="canvas-interactions"
                style={{ display: printPreview ? "none" : undefined }}
                viewBox={`0 0 ${width} ${height}`}
                aria-label="Page canvas"
                onPointerMove={moving}
                onPointerUp={end}
                onPointerCancel={end}
                onPointerDown={(e) => {
                  if (e.target === e.currentTarget) {
                    if (pan) start(e, "pan");
                    else setSelected([]);
                  }
                }}
              >
                <defs>
                  <pattern
                    id={`layout-grid-${page.id}`}
                    width={(l.safe.width * 72) / state.grid.columns}
                    height={(l.safe.height * 72) / state.grid.rows}
                    patternUnits="userSpaceOnUse"
                    x={(l.safe.x - l.trim.x) * 72}
                    y={(l.safe.y - l.trim.y) * 72}
                  >
                    <path
                      d={`M0 ${(l.safe.height * 72) / state.grid.rows}V0H${(l.safe.width * 72) / state.grid.columns}`}
                      fill="none"
                      stroke="#8b86aa"
                      strokeWidth=".5"
                    />
                    <path
                      d={`M${state.grid.gap / 2} 0V${(l.safe.height * 72) / state.grid.rows}`}
                      stroke="#8b86aa"
                      strokeWidth=".25"
                      strokeDasharray="2 3"
                    />
                  </pattern>
                </defs>
                {state.grid.visible && (
                  <rect
                    data-editor-overlay="grid"
                    x={(l.safe.x - l.trim.x) * 72}
                    y={(l.safe.y - l.trim.y) * 72}
                    width={l.safe.width * 72}
                    height={l.safe.height * 72}
                    fill={`url(#layout-grid-${page.id})`}
                    pointerEvents="none"
                  />
                )}
                {guides && (
                  <rect
                    data-editor-overlay="guides"
                    x={(l.safe.x - l.trim.x) * 72}
                    y={(l.safe.y - l.trim.y) * 72}
                    width={l.safe.width * 72}
                    height={l.safe.height * 72}
                    stroke="#d17d63"
                    strokeWidth="1"
                    fill="none"
                    strokeDasharray="5 4"
                    pointerEvents="none"
                  />
                )}
                {state.components
                  .filter((c) => c.visible)
                  .map((c) => (
                    <g
                      key={c.id}
                      transform={`rotate(${c.rotation} ${c.x + c.width / 2} ${c.y + c.height / 2})`}
                    >
                      <rect
                        data-hit-component={c.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Select ${c.name}`}
                        x={c.x}
                        y={c.y}
                        width={c.width}
                        height={c.height}
                        fill="transparent"
                        stroke={
                          selected.includes(c.id) ? "#7460a5" : "transparent"
                        }
                        strokeWidth={2 / zoom}
                        onFocus={() => setSelected([c.id])}
                        onPointerDown={(e) => start(e, pan ? "pan" : "move", c)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            setSelected(
                              e.shiftKey ? [...selected, c.id] : [c.id],
                            );
                        }}
                      />
                      {selected.includes(c.id) && !locked && (
                        <rect
                          role="button"
                          tabIndex={0}
                          aria-label={`Resize ${c.name}`}
                          data-resize-handle={c.id}
                          x={c.x + c.width - 5 / zoom}
                          y={c.y + c.height - 5 / zoom}
                          width={10 / zoom}
                          height={10 / zoom}
                          fill="white"
                          stroke="#7460a5"
                          strokeWidth={1.5 / zoom}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            start(e, "resize", c);
                          }}
                        />
                      )}
                    </g>
                  ))}
              </svg>
            </div>
          </div>
          <div className="canvas-footer">
            <span>
              {state.print.width.toFixed(2)} × {state.print.height.toFixed(2)}{" "}
              in · {state.components.length} components · colouring-book-bold
            </span>
            <span className={qa.valid ? "success" : "warning"}>
              {qa.valid
                ? "Print-safe layout"
                : `${qa.errors.length} layout checks need attention`}
            </span>
          </div>
        </div>
        <aside className="properties-inspector">
          <div className="inspector-tabs">
            {(["properties", "page", "layers"] as const).map((t) => (
              <button
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
                key={t}
              >
                {t === "properties"
                  ? "Inspector"
                  : t === "page"
                    ? "Page setup"
                    : "Layers"}
              </button>
            ))}
          </div>
          {tab === "page" ? (
            <div className="inspector-fields">
              <h3>Page & print</h3>
              <label>
                Page size
                <select
                  value={state.print.preset}
                  disabled={locked}
                  onChange={(e) => {
                    const size = presets[e.target.value];
                    if (size)
                      updatePrint({
                        preset: e.target.value,
                        width: size[0],
                        height: size[1],
                      });
                    else updatePrint({ preset: "Custom" });
                  }}
                >
                  {Object.entries(presets).map(([name, [w, h]]) => (
                    <option key={name} value={name}>
                      {name} · {w.toFixed(2)} × {h.toFixed(2)} in
                    </option>
                  ))}
                  <option>Custom</option>
                </select>
              </label>
              <div className="field-pair">
                <NumberField
                  label="Trim width (in)"
                  value={state.print.width}
                  min={3}
                  max={18}
                  onChange={(v) => updatePrint({ width: v, preset: "Custom" })}
                  disabled={locked}
                />
                <NumberField
                  label="Trim height (in)"
                  value={state.print.height}
                  min={3}
                  max={18}
                  onChange={(v) => updatePrint({ height: v, preset: "Custom" })}
                  disabled={locked}
                />
              </div>
              <button
                disabled={locked}
                onClick={() =>
                  updatePrint({
                    width: state.print.height,
                    height: state.print.width,
                  })
                }
              >
                Swap orientation
              </button>
              {(
                [
                  "bleed",
                  "inside",
                  "outside",
                  "top",
                  "bottom",
                  "inset",
                  "gutter",
                  "dpi",
                ] as const
              ).map((key) => (
                <NumberField
                  key={key}
                  label={
                    key === "inset"
                      ? "Artwork inset (in)"
                      : key === "dpi"
                        ? "Resolution (DPI)"
                        : `${key[0].toUpperCase() + key.slice(1)} (in)`
                  }
                  value={state.print[key]}
                  min={key === "dpi" ? 150 : 0}
                  max={key === "dpi" ? 600 : key === "bleed" ? 0.25 : 2}
                  onChange={(v) => updatePrint({ [key]: v })}
                  disabled={locked}
                />
              ))}
              <h3>Layout grid</h3>
              <label>
                Grid preset
                <select
                  value={
                    state.grid.free
                      ? "free"
                      : state.grid.columns === 6
                        ? "6"
                        : state.grid.columns === 12
                          ? "12"
                          : "custom"
                  }
                  onChange={(e) =>
                    commit({
                      ...state,
                      grid: {
                        ...state.grid,
                        free: e.target.value === "free",
                        columns: ["6", "12"].includes(e.target.value)
                          ? Number(e.target.value)
                          : state.grid.columns,
                      },
                    })
                  }
                >
                  <option value="6">6 columns</option>
                  <option value="12">12 columns</option>
                  <option value="custom">Custom grid</option>
                  <option value="free">Free positioning</option>
                </select>
              </label>
              <NumberField
                label="Layout columns"
                value={state.grid.columns}
                min={1}
                max={48}
                onChange={(v) =>
                  commit({ ...state, grid: { ...state.grid, columns: v } })
                }
                disabled={locked}
              />
              <NumberField
                label="Layout rows"
                value={state.grid.rows}
                min={1}
                max={64}
                onChange={(v) =>
                  commit({ ...state, grid: { ...state.grid, rows: v } })
                }
                disabled={locked}
              />
              <NumberField
                label="Grid spacing (pt)"
                value={state.grid.gap}
                min={0}
                max={40}
                onChange={(v) =>
                  commit({ ...state, grid: { ...state.grid, gap: v } })
                }
                disabled={locked}
              />
              <label>
                <input
                  type="checkbox"
                  checked={state.grid.snap}
                  onChange={(e) =>
                    commit({
                      ...state,
                      grid: { ...state.grid, snap: e.target.checked },
                    })
                  }
                />
                Snap to grid
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={state.grid.edges}
                  onChange={(e) =>
                    commit({
                      ...state,
                      grid: { ...state.grid, edges: e.target.checked },
                    })
                  }
                />
                Snap to component edges
              </label>
              <p className="small muted">
                Layout grid never changes the puzzle grid. All sizes and line
                weights are in physical print units.
              </p>
            </div>
          ) : tab === "layers" ? (
            <div className="inspector-fields">
              <h3>Layer stack</h3>
              {[...state.components].reverse().map((c) => (
                <div
                  className={`layer-row ${selected.includes(c.id) ? "active" : ""}`}
                  key={c.id}
                >
                  <button onClick={() => setSelected([c.id])}>{c.name}</button>
                  {button(
                    `Toggle ${c.name} visibility`,
                    <Eye size={14} />,
                    () =>
                      commit({
                        ...state,
                        components: state.components.map((o) =>
                          o.id === c.id ? { ...o, visible: !o.visible } : o,
                        ),
                      }),
                    locked,
                  )}
                  {button(
                    `Raise ${c.name}`,
                    <ChevronUp size={14} />,
                    () => commit(reorder(state, c.id, 1)),
                    locked,
                  )}
                  {button(
                    `Lower ${c.name}`,
                    <ChevronDown size={14} />,
                    () => commit(reorder(state, c.id, -1)),
                    locked,
                  )}
                </div>
              ))}
            </div>
          ) : active ? (
            <div className="inspector-fields">
              <div className="panel-heading">
                <h3>{active.name}</h3>
                <span className="badge">
                  {active.kind === "puzzle" || active.character?.clue
                    ? "Functional"
                    : "Decorative"}
                </span>
              </div>
              <div className="field-pair">
                <NumberField
                  label="X position (pt)"
                  value={active.x}
                  onChange={(v) => patch({ x: v })}
                  disabled={locked}
                />
                <NumberField
                  label="Y position (pt)"
                  value={active.y}
                  onChange={(v) => patch({ y: v })}
                  disabled={locked}
                />
                <NumberField
                  label="Width (pt)"
                  value={active.width}
                  min={12}
                  max={1800}
                  onChange={(v) => patch({ width: v })}
                  disabled={locked}
                />
                <NumberField
                  label="Height (pt)"
                  value={active.height}
                  min={12}
                  max={1800}
                  onChange={(v) => patch({ height: v })}
                  disabled={locked}
                />
              </div>
              {active.kind !== "puzzle" && (
                <NumberField
                  label="Rotation (degrees)"
                  value={active.rotation}
                  min={-180}
                  max={180}
                  onChange={(v) => patch({ rotation: v })}
                  disabled={locked}
                />
              )}
              {active.kind === "text" && (
                <>
                  <label>
                    Text content
                    <textarea
                      aria-label="Text content"
                      value={active.text}
                      disabled={locked}
                      onChange={(e) => {
                        const text = e.target.value;
                        commit(
                          {
                            ...state,
                            components: state.components.map((c) =>
                              c.id === active.id ? { ...c, text } : c,
                            ),
                          },
                          active.variant === "title"
                            ? { title: text.slice(0, 70) || "Untitled page" }
                            : active.variant === "story"
                              ? { story: text.slice(0, 280) }
                              : active.variant === "instructions"
                                ? { instructions: text.slice(0, 300) }
                                : {},
                        );
                      }}
                    />
                  </label>
                  <label>
                    Text font
                    <select
                      value={active.font}
                      onChange={(e) =>
                        patch({
                          font: e.target.value as CanvasComponent["font"],
                        })
                      }
                    >
                      <option>OpenSans</option>
                      <option>Fredoka</option>
                      <option>Nunito</option>
                    </select>
                  </label>
                  <NumberField
                    label="Font size (pt)"
                    value={active.fontSize}
                    min={8}
                    max={100}
                    onChange={(v) => patch({ fontSize: v })}
                    disabled={locked}
                  />
                  <NumberField
                    label="Line spacing"
                    value={active.lineHeight}
                    min={1}
                    max={2.5}
                    onChange={(v) => patch({ lineHeight: v })}
                    disabled={locked}
                  />
                  <label>
                    Text alignment
                    <select
                      value={active.align}
                      onChange={(e) =>
                        patch({
                          align: e.target.value as CanvasComponent["align"],
                        })
                      }
                    >
                      <option>left</option>
                      <option>center</option>
                      <option>right</option>
                    </select>
                  </label>
                </>
              )}
              {active.kind === "puzzle" && (
                <>
                  <p className="small">{descriptions[draft.mechanic]}</p>
                  <label>
                    Activity type
                    <select
                      value={draft.mechanic}
                      disabled={locked}
                      onChange={(e) =>
                        place("puzzle", e.target.value, {
                          x: active.x,
                          y: active.y,
                        })
                      }
                    >
                      {mechanics.map((m) => (
                        <option key={m} value={m}>
                          {activityNames[m]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Puzzle seed
                    <input
                      value={seed}
                      disabled={locked}
                      onChange={(e) => setSeed(e.target.value)}
                    />
                  </label>
                  <label>
                    Puzzle difficulty
                    <select
                      value={difficulty}
                      disabled={locked}
                      onChange={(e) =>
                        setDifficulty(e.target.value as Page["difficulty"])
                      }
                    >
                      {["gentle", "standard", "challenging"].map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                  {["maze", "word-search"].includes(draft.mechanic) && (
                    <NumberField
                      label="Puzzle grid size"
                      value={gridSize}
                      min={6}
                      max={20}
                      onChange={setGridSize}
                      disabled={locked}
                    />
                  )}
                  {draft.mechanic === "maze" && (
                    <NumberField
                      label="Path line weight (pt)"
                      value={active.lineWeight}
                      min={0.75}
                      max={5}
                      onChange={(v) => patch({ lineWeight: v })}
                      disabled={locked}
                    />
                  )}
                  <button disabled={locked} onClick={regenerate}>
                    Regenerate activity
                  </button>
                  {draft.mechanic === "reveal" && (
                    <label>
                      Reveal password
                      <select
                        value={String(draft.config.answer ?? "SUN")}
                        onChange={(e) =>
                          commit(state, {
                            config: { ...draft.config, answer: e.target.value },
                          })
                        }
                      >
                        <option>SUN</option>
                        <option>KEY</option>
                      </select>
                    </label>
                  )}
                  {draft.mechanic === "cipher" && (
                    <label>
                      Cipher message
                      <input
                        aria-label="Cipher message"
                        defaultValue={String(
                          draft.config.message ?? "FOLLOW THE RIVER",
                        )}
                        onBlur={(e) => {
                          try {
                            const config = {
                              ...draft.config,
                              message: e.target.value.toUpperCase(),
                            };
                            registry.cipher.generate(config, draft.seed);
                            commit(state, { config });
                          } catch (e) {
                            setError(String(e));
                          }
                        }}
                      />
                    </label>
                  )}
                  {draft.mechanic === "word-search" && (
                    <label>
                      Word list
                      <input
                        aria-label="Word list"
                        defaultValue={
                          Array.isArray(draft.config.words)
                            ? draft.config.words.join(", ")
                            : "DRAGON, CASTLE, WIZARD, CROWN, MAGIC, TOWER"
                        }
                        onBlur={(e) => {
                          try {
                            const config = {
                              ...draft.config,
                              words: e.target.value
                                .toUpperCase()
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            };
                            registry["word-search"].generate(
                              config,
                              draft.seed,
                            );
                            commit(state, { config });
                          } catch (e) {
                            setError(String(e));
                          }
                        }}
                      />
                    </label>
                  )}
                  <p className="small">
                    Start:{" "}
                    {draft.mechanic === "maze"
                      ? "top-left entrance"
                      : "mechanic-defined"}
                    <br />
                    Finish:{" "}
                    {draft.mechanic === "maze"
                      ? "bottom-right exit"
                      : "verified answer"}
                    <br />
                    Solution: {answer}
                  </p>
                  <p className="small muted">
                    Move and resize the whole protected activity. Clues, routes
                    and symbols remain linked to authoritative data.
                  </p>
                </>
              )}
              {active.character && (
                <>
                  <label>
                    Expression
                    <input
                      value={active.character.expression}
                      onChange={(e) =>
                        patch({
                          character: {
                            ...active.character!,
                            expression: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    Story role
                    <input
                      value={active.character.role}
                      onChange={(e) =>
                        patch({
                          character: {
                            ...active.character!,
                            role: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <label>
                    Facing
                    <select
                      value={active.character.facing}
                      onChange={(e) =>
                        patch({
                          character: {
                            ...active.character!,
                            facing: e.target.value as "left" | "right",
                          },
                        })
                      }
                    >
                      <option>right</option>
                      <option>left</option>
                    </select>
                  </label>
                  <label>
                    Linked puzzle clue
                    <input
                      value={active.character.clue}
                      onChange={(e) =>
                        patch({
                          character: {
                            ...active.character!,
                            clue: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <p className="small muted">
                    Pose and expression records are integration points for Build
                    007. Placeholder artwork has one standing pose.
                  </p>
                </>
              )}
              {["scenery", "character"].includes(active.kind) && (
                <label>
                  Asset variant
                  <select
                    value={active.variant}
                    onChange={(e) =>
                      patch({ variant: e.target.value, name: e.target.value })
                    }
                  >
                    {library
                      .filter((i) => i.kind === active.kind)
                      .map((i) => (
                        <option key={i.variant} value={i.variant}>
                          {i.label}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              <label>
                <input
                  type="checkbox"
                  checked={active.locked}
                  onChange={(e) => patch({ locked: e.target.checked })}
                />
                Lock position
              </label>
              <p className="small muted">
                Changes remain editable until saved and reviewed. Invalid
                placements are highlighted below and blocked from publishing.
              </p>
            </div>
          ) : (
            <div className="empty inspector-empty">
              <Move size={32} />
              <h3>Select a component</h3>
              <p>
                Drag an activity, character or page element onto your page. Tap
                a tile to add it on a tablet.
              </p>
              <button onClick={() => setTab("page")}>Choose page size</button>
            </div>
          )}
          {qa.errors.length > 0 && (
            <details className="layout-warnings">
              <summary>{qa.errors.length} layout checks</summary>
              {qa.errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
              <button
                disabled={locked || !editor.past.length}
                onClick={() => history("undo")}
              >
                Revert last change
              </button>
            </details>
          )}
        </aside>
      </div>
    </section>
  );
}
function NumberField({
  label,
  value,
  onChange,
  min = -2000,
  max = 2000,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        aria-label={label}
        type="number"
        step="any"
        min={min}
        max={max}
        value={Math.round(value * 100) / 100}
        disabled={disabled}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v) && v >= min && v <= max) onChange(v);
        }}
      />
    </label>
  );
}
function ActivityThumb({ kind }: { kind: Mechanic }) {
  return (
    <svg viewBox="0 0 100 80" fill="white" stroke="black" strokeWidth="2">
      {kind === "maze" ? (
        <path d="M8 72V8H92V72H8M25 8V48H60V25H42M8 63H40M75 72V45H92M60 48V72" />
      ) : kind === "route" ? (
        <>
          <path d="M10 70L50 40L20 8M50 40L78 8M50 40L92 63" />
          <circle cx="50" cy="40" r="9" />
        </>
      ) : kind === "cipher" ? (
        <>
          <path d="M18 12L30 25L18 38L6 25ZM60 12L72 25L60 38L48 25ZM39 45L51 58L39 71L27 58Z" />
          <circle cx="18" cy="25" r="3" />
          <circle cx="60" cy="25" r="3" />
        </>
      ) : (
        <>
          {Array.from({ length: 20 }, (_, i) => (
            <rect
              key={i}
              x={8 + (i % 5) * 17}
              y={7 + Math.floor(i / 5) * 17}
              width="17"
              height="17"
              fill={
                kind === "reveal" && [1, 2, 6, 11, 12].includes(i)
                  ? "#30343b"
                  : "white"
              }
            />
          ))}
          {kind === "word-search" && (
            <text x="21" y="52" fontSize="25" stroke="none" fill="black">
              ABC
            </text>
          )}
        </>
      )}
    </svg>
  );
}
