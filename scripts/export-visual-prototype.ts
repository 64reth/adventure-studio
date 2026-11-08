import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setPngDpi } from "../packages/print/png";
import { createAdventure } from "../packages/core/index";
import { makePage } from "../packages/adventure/index";
import {
  component,
  initialEditor,
  defaultPrint,
  canvasQA,
} from "../packages/editor/model";
import { compose } from "../packages/composer/index";
import { exportPackage } from "../packages/print/export";
import { refreshManifest } from "../packages/print/manifest";
const adventure = createAdventure("The Moonlit Garden", "Mechanical garden");
const page = makePage("maze", 1, "build-006-garden");
page.title = "The Moonlit Garden";
page.story =
  "Help Pip the robot find the greenhouse before the moonflowers close.";
page.instructions =
  "Enter at START. Trace one path to EXIT without crossing a black wall.";
page.editor = initialEditor(page, true);
page.editor.state.print = {
  ...defaultPrint,
  preset: "A4",
  width: 210 / 25.4,
  height: 297 / 25.4,
};
page.editor.state.components = [
  {
    ...component("text", "title", 40, 40),
    text: page.title,
    font: "Fredoka",
    fontSize: 26,
    width: 440,
    height: 45,
  },
  {
    ...component("text", "story", 40, 100),
    text: page.story,
    font: "Nunito",
    fontSize: 14,
    width: 400,
    height: 46,
  },
  {
    ...component("text", "instructions", 40, 162),
    text: page.instructions,
    font: "Nunito",
    fontSize: 13,
    width: 520,
    height: 45,
  },
  { ...component("character", "robot", 475, 90), width: 65, height: 65 },
  {
    ...component("puzzle", "maze", 44, 220),
    puzzleRef: page.id,
    width: 500,
    height: 500,
  },
  { ...component("scenery", "tree", 490, 740), width: 55, height: 60 },
  {
    ...component("text", "answer", 40, 755),
    text: "Answer: ________________________",
    width: 340,
    height: 28,
  },
  {
    ...component("text", "page number", 540, 785),
    text: "1",
    fontSize: 10,
    width: 18,
    height: 18,
  },
];
adventure.pages = [page];
const qa = canvasQA(page);
if (!qa.valid) throw new Error(qa.errors.join("\n"));
const font = new Uint8Array(
    await readFile("apps/studio/public/fonts/OpenSans-Regular.ttf"),
  ),
  fonts: Record<string, Uint8Array> = {};
for (const name of ["Fredoka", "Nunito"])
  fonts[name] = new Uint8Array(
    await readFile(
      `apps/studio/public/fonts/${name.toLowerCase()}/${name}-Print.ttf`,
    ),
  );
const zip = await exportPackage(adventure, font, {
  mode: "review",
  profile: "no-bleed",
  fonts,
});
await mkdir(".data/font-cache", { recursive: true });
const configPath = resolve(".data/build-006-fontconfig.xml");
await writeFile(
  configPath,
  `<fontconfig><dir>${resolve("apps/studio/public/fonts")}</dir><cachedir>${resolve(".data/font-cache")}</cachedir></fontconfig>`,
);
process.env.FONTCONFIG_FILE = configPath;
const sharp = (await import("sharp")).default;
const svg = compose(page),
  png = await sharp(Buffer.from(svg), { density: 300 }).png().toBuffer();
zip.file("pages/page-001.png", setPngDpi(png, 300));
await refreshManifest(zip);
const root = "artifacts/build-006";
await mkdir(root, { recursive: true });
for (const [name, file] of Object.entries(zip.files)) {
  if (file.dir) continue;
  const path = `${root}/${name}`;
  await mkdir(path.slice(0, path.lastIndexOf("/")), { recursive: true });
  await writeFile(path, await file.async("nodebuffer"));
}
await writeFile(
  root + "/book-export.zip",
  await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
);
console.log(
  "Visual A4 composition exported with protected maze, editable scenery and embedded Open Sans, Fredoka and Nunito.",
);
