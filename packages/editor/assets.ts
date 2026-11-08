import { DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { LibraryAssetSchema, type LibraryAsset } from "./schema";
const tags = new Set([
  "svg",
  "g",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
]);
const attrs = new Set([
  "xmlns",
  "viewBox",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "width",
  "height",
  "d",
  "points",
  "transform",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "fill-rule",
  "vector-effect",
]);
export function safeSvg(input: string): string {
  if (input.length > 150000) throw new Error("SVG limit is 150 KB");
  if (
    /<!|<\?|url\s*\(|https?:|javascript:|data:/i.test(
      input.replace("http://www.w3.org/2000/svg", ""),
    )
  )
    throw new Error("SVG must be self-contained, without external references");
  let invalid = false;
  const doc = new DOMParser({
    onError: () => {
      invalid = true;
    },
  }).parseFromString(input, "image/svg+xml");
  if (invalid || doc.documentElement?.tagName !== "svg")
    throw new Error("Invalid SVG");
  function walk(node: Element) {
    if (!tags.has(node.tagName))
      throw new Error(`Unsupported SVG element: ${node.tagName}`);
    for (const a of Array.from(node.attributes)) {
      if (!attrs.has(a.name))
        throw new Error(`Unsupported SVG attribute: ${a.name}`);
      if (a.name === "fill" || a.name === "stroke") {
        if (
          ![
            "black",
            "white",
            "none",
            "#000",
            "#000000",
            "#fff",
            "#ffffff",
            "#111",
            "#111111",
            "currentColor",
          ].includes(a.value)
        )
          throw new Error(
            "Imported artwork must use black or white fills and strokes",
          );
        node.setAttribute(
          a.name,
          ["white", "#fff", "#ffffff", "none"].includes(a.value)
            ? a.value === "none"
              ? "none"
              : "white"
            : "black",
        );
      }
      if (a.name === "transform" && !/^[\d\s.,()eE+\-a-zA-Z]+$/.test(a.value))
        throw new Error("Invalid transform");
    }
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 1) walk(child as unknown as Element);
      else if (child.nodeType === 3 && child.textContent?.trim())
        throw new Error("Convert SVG text to outlines before import");
      else if (child.nodeType !== 3) throw new Error("Unsupported SVG node");
    }
  }
  walk(doc.documentElement as unknown as Element);
  doc.documentElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(doc.documentElement);
}
export async function contentHash(s: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
  )
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
}
export function readLibrary(): LibraryAsset[] {
  const raw = localStorage.getItem("adventure-studio:asset-library:v1");
  return raw
    ? LibraryAssetSchema.array()
        .parse(JSON.parse(raw))
        .map((a) => ({ ...a, svg: safeSvg(a.svg) }))
    : [];
}
export function writeLibrary(assets: LibraryAsset[]) {
  localStorage.setItem(
    "adventure-studio:asset-library:v1",
    JSON.stringify(assets),
  );
}
