import { wrapText } from "./typography";
import type { Page } from "../core/index";
import type { CanvasComponent } from "./schema";
import { visualLayout, colouringBookBold } from "./model";
import { puzzleSvg, esc, wrapLines } from "../composer/legacy";
import { registry, solve } from "../puzzles/index";
import { safeSvg } from "./assets";
import type { PrintProfile } from "../print/index";
export function illustration(variant: string) {
  const stroke = `stroke="black" stroke-width="${colouringBookBold.primary}" stroke-linecap="round" stroke-linejoin="round" fill="white" vector-effect="non-scaling-stroke"`;
  const shapes: Record<string, string> = {
    tree: '<path d="M45 67V92H55V67M50 6C20 0 10 28 23 40C-1 66 24 85 50 70C74 87 105 62 78 40C91 16 72 0 50 6Z"/><path d="M50 70V40M50 58L35 47M50 49L66 36"/>',
    building:
      '<path d="M14 90V34L50 7L86 34V90ZM5 35H95M41 90V65Q50 51 59 65V90M25 42H37V56H25ZM64 42H76V56H64Z"/>',
    bridge:
      '<path d="M5 53Q50 1 95 53V85H74V68Q50 37 26 68V85H5ZM5 53V35M95 53V35M22 39V21M78 39V21M40 29V12M60 29V12"/>',
    river:
      '<path d="M25 3Q80 24 35 49Q10 72 72 97M52 3Q107 24 62 49Q37 72 99 97M17 28L29 30M54 72L66 75"/>',
    mountain:
      '<path d="M2 92L40 7L65 57L77 34L99 92ZM24 43L39 50L48 38M61 69L75 75L84 65"/>',
    door: '<path d="M15 95V35Q50-15 85 35V95ZM24 95V37Q50 0 76 37V95"/><circle cx="65" cy="62" r="3"/>',
    window:
      '<path d="M12 92V32Q50-14 88 32V92ZM22 82V35Q50 0 78 35V82ZM50 12V82M22 52H78"/>',
    cloud:
      '<path d="M23 72C-10 68 0 36 24 39C20 9 66 0 73 34C100 22 113 66 82 72Z"/>',
    knight:
      '<path d="M34 47V23Q50 7 66 23V47L50 57ZM29 98V60L50 53L72 60V98M37 70V96M62 70V96M27 60L12 85M74 60L87 85M33 32H67M42 34V43M55 34V43"/>',
    princess:
      '<path d="M32 24L27 5L42 14L50 1L58 14L73 5L68 24M31 30Q50 13 69 30V52Q50 72 31 52ZM38 63L17 98H83L62 63M18 80L8 61M82 80L92 61"/>',
    robot:
      '<rect x="23" y="16" width="54" height="42" rx="9"/><path d="M50 16V5M27 98V65H73V98M15 65V87M85 65V87M40 58V65M60 58V65M35 44H65"/><circle cx="38" cy="32" r="4"/><circle cx="62" cy="32" r="4"/>',
    fairy:
      '<path d="M38 50Q-10 8 6 78L38 66M62 50Q110 8 94 78L62 66M36 31Q50 8 64 31V48Q50 64 36 48ZM40 62L23 94H77L60 62M44 94V100M57 94V100"/>',
    teddy:
      '<circle cx="25" cy="21" r="13"/><circle cx="75" cy="21" r="13"/><ellipse cx="50" cy="38" rx="32" ry="29"/><ellipse cx="50" cy="78" rx="27" ry="22"/><circle cx="38" cy="33" r="3" fill="black"/><circle cx="62" cy="33" r="3" fill="black"/><ellipse cx="50" cy="47" rx="13" ry="10"/><path d="M45 44H55L50 50ZM28 65L9 75M72 65L91 75"/>',
    dragon:
      '<path d="M20 70Q-5 15 25 35L38 51L43 24L55 37Q82 14 88 43L98 56L79 69Q81 96 54 96L36 84Q8 106 3 82ZM39 50L13 6L6 50M65 33L67 10L79 24M55 78L53 95M70 75L74 95"/><circle cx="77" cy="44" r="3" fill="black"/>',
    frame:
      '<rect x="4" y="4" width="92" height="92" rx="6" fill="none"/><rect x="10" y="10" width="80" height="80" rx="3" fill="none"/>',
  };
  return `<g ${stroke}>${shapes[variant] ?? shapes.cloud}</g>`;
}
function physicalStrokes(svg: string, scale: number) {
  return svg
    .replace(/ vector-effect="non-scaling-stroke"/g, "")
    .replace(
      /stroke-width="([0-9.]+)"/g,
      (_, value: string) =>
        `stroke-width="${Number(value) / Math.max(0.01, scale)}"`,
    );
}
export function componentMarkup(
  c: CanvasComponent,
  page: Page,
  solution = false,
) {
  if (!c.visible) return "";
  let content = "";
  if (c.kind === "puzzle") {
    const p = registry[page.mechanic].generate(
      { ...page.config, difficulty: page.difficulty },
      page.seed,
    );
    content = `<svg width="${c.width}" height="${c.height}" viewBox="0 0 550 580" preserveAspectRatio="none">${physicalStrokes(
      puzzleSvg(p, solution)
        .replace('stroke-width="1.5"', `stroke-width="${c.lineWeight}"`)
        .replace(/#(?:111|555|666|777)/g, "black")
        .replace("#d5a33d", "#777"),
      Math.min(c.width / 550, c.height / 580),
    )}${solution ? `<text x="15" y="575" font-size="14" font-family="Open Sans">ANSWER: ${esc(solve(p)[0]?.answer ?? "INVALID")}</text>` : ""}</svg>`;
  } else if (c.kind === "text") {
    const anchor =
        c.align === "center" ? "middle" : c.align === "right" ? "end" : "start",
      x =
        c.align === "center" ? c.width / 2 : c.align === "right" ? c.width : 0;
    const lines = wrapText(c.text, c.width, c.fontSize, c.font);
    content = lines
      .map(
        (row, i) =>
          `<text x="${x}" y="${c.fontSize + i * c.fontSize * c.lineHeight}" text-anchor="${anchor}" font-family="${c.font === "OpenSans" ? "Open Sans" : c.font}" font-size="${c.fontSize}" font-weight="${c.font === "OpenSans" ? 400 : 500}" fill="black">${esc(row)}</text>`,
      )
      .join("");
  } else if (c.kind === "asset") {
    const asset = page.editor?.state.assets.find((a) => a.id === c.assetId);
    if (asset) {
      const svg = safeSvg(asset.svg).replace(
        /<svg\b([^>]*)>/,
        (_, attrs: string) =>
          `<svg ${attrs.replace(/\s(?:width|height)="[^"]*"/g, "")} width="${c.width}" height="${c.height}">`,
      );
      content = svg;
    }
  } else
    content = `<svg width="${c.width}" height="${c.height}" viewBox="0 0 100 100" preserveAspectRatio="none"><g ${c.character?.facing === "left" ? 'transform="translate(100 0) scale(-1 1)"' : ""}>${physicalStrokes(illustration(c.kind === "frame" ? "frame" : c.variant), Math.min(c.width / 100, c.height / 100))}</g></svg>`;
  return `<g data-component="${esc(c.id)}" data-kind="${c.kind}" transform="translate(${c.x} ${c.y}) rotate(${c.rotation} ${c.width / 2} ${c.height / 2})">${content}</g>`;
}
export function renderVisual(
  page: Page,
  options: {
    solution?: boolean;
    profile?: PrintProfile;
    count?: number;
    guides?: boolean;
    artwork?: boolean;
  } = {},
) {
  if (!page.editor) throw new Error("Missing visual layout");
  const state = page.editor.state,
    l = visualLayout(
      state.print,
      page.number,
      options.count ?? Math.max(5, page.number),
      options.profile,
    );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${l.width}in" height="${l.height}in" viewBox="0 0 ${l.width * 72} ${l.height * 72}" role="img" aria-label="${esc(page.title)}"><rect width="100%" height="100%" fill="white"/><g transform="translate(${l.trim.x * 72} ${l.trim.y * 72})">${state.components
    .filter(
      (c) => options.artwork !== false || ["text", "puzzle"].includes(c.kind),
    )
    .map((c) => componentMarkup(c, page, options.solution))
    .join("")}</g></svg>`;
}
