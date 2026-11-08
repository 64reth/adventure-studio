import metrics from "./font-widths.json";
import type { CanvasComponent } from "./schema";
export function wrapText(
  text: string,
  width: number,
  size: number,
  font: CanvasComponent["font"],
) {
  const table: Record<string, number> = metrics[font],
    measure = (s: string) =>
      [...s].reduce((n, c) => n + (table[c] ?? 1) * size, 0);
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (!word) continue;
    const candidate = line ? line + " " + word : word;
    if (measure(candidate) <= width) {
      line = candidate;
      continue;
    }
    if (line) {
      lines.push(line);
      line = "";
    }
    for (const c of word) {
      if (measure(line + c) > width && line) {
        lines.push(line);
        line = "";
      }
      line += c;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}
