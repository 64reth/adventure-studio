/// <reference path="./browser-pdfkit.d.ts" />
import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import { exportPackage, type ExportMode } from "./pipeline";
import type { PrintProfile } from "./index";
/** Same schema, puzzle, rights and layout checks as the Worker; no service spending. */
export async function browserExport(input: {
  adventure: unknown;
  mode: ExportMode;
  profile: PrintProfile;
}) {
  const fonts: Record<string, Uint8Array> = {};
  for (const [name, url] of Object.entries({
    OpenSans: "/fonts/OpenSans-Regular.ttf",
    Fredoka: "/fonts/fredoka/Fredoka-Print.ttf",
    Nunito: "/fonts/nunito/Nunito-Print.ttf",
  })) {
    const r = await fetch(url);
    if (!r.ok)
      throw new Error(
        "Print font unavailable. Retry once the connection is available.",
      );
    fonts[name] = new Uint8Array(await r.arrayBuffer());
  }
  return exportPackage(input.adventure, fonts.OpenSans, {
    mode: input.mode,
    profile: input.profile,
    fonts,
    document: PDFDocument,
  });
}
