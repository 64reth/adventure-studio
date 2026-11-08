import { canvasQA, visualLayout } from "../editor/model";
import { safeSvg } from "../editor/assets";
import type PDFDocument from "pdfkit";
import { Buffer } from "buffer/index.js";
import SVGtoPDF from "svg-to-pdfkit";
import JSZip from "jszip";
import { AdventureSchema, type Adventure, type Page } from "../core/index";
import { compose, esc } from "../composer/index";
import { layout, type PrintProfile } from "./index";
import { registry, solve, validate } from "../puzzles/index";
import { progression, narrativeQA } from "../adventure/index";
import { LocalArtworkProvider, sha256 } from "../artwork/index";
export type ExportMode = "review" | "publication";
export function preflight(
  a: Adventure,
  mode: ExportMode,
  profile: PrintProfile,
) {
  const errors: string[] = [];
  if (a.pages.length === 0) errors.push("Adventure has no pages");
  if (a.pages.length > 40) errors.push("Export at most 40 pages per package");
  const flow = progression(a);
  errors.push(...flow.errors, ...narrativeQA(a).errors);
  a.pages.forEach((p, i) => {
    if (p.number !== i + 1)
      errors.push(`${p.title}: page numbers must be consecutive`);
    try {
      const generated = registry[p.mechanic].generate(
        { ...p.config, difficulty: p.difficulty },
        p.seed,
      );
      const v = validate(generated);
      errors.push(...v.errors.map((e) => `${p.title}: ${e}`));
      if (p.editor) {
        errors.push(...canvasQA(p).errors.map((e) => `${p.title}: ${e}`));
        for (const asset of p.editor.state.assets) {
          safeSvg(asset.svg);
          if (
            mode === "publication" &&
            (asset.review !== "Approved" || !asset.reviewNote.trim())
          )
            errors.push(`${p.title}: imported asset rights approval required`);
        }
      } else layout(profile, p.number, a.pages.length);
    } catch (e) {
      errors.push(`${p.title}: ${String(e)}`);
    }
    if (mode === "publication") {
      if (p.status !== "Approved" && p.status !== "Exported")
        errors.push(`${p.title}: human page approval required`);
      if (!p.reviewNote.trim())
        errors.push(`${p.title}: review record missing`);
      if (
        p.assets.length === 0 ||
        p.assets.some((asset) => asset.rightsReview !== "Approved")
      )
        errors.push(`${p.title}: approved asset provenance required`);
    }
  });
  return {
    valid: errors.length === 0,
    errors,
    warnings: [
      "Human visual, difficulty and commercial review required.",
      "Five-page prototype is below KDP minimum book length.",
      "No automated test constitutes legal clearance.",
    ],
    profile,
    mode,
    pageCount: a.pages.length,
    schemaVersion: 1,
  };
}
export async function pdf(
  pages: Page[],
  font: Uint8Array,
  options: {
    solution?: boolean;
    profile: PrintProfile;
    review: boolean;
    count: number;
    fonts?: Record<string, Uint8Array>;
    document: typeof PDFDocument;
  },
) {
  return new Promise<Uint8Array>((resolve, reject) => {
    const doc = new options.document({
      autoFirstPage: false,
      font: "",
      compress: true,
      info: {
        Title: options.solution
          ? "Adventure Studio answer keys"
          : "Adventure Studio interior",
        Author: "Allen Creative Technologies Ltd",
        Subject: options.review
          ? "REVIEW COPY — NOT APPROVED FOR PUBLICATION"
          : "Approved interior",
      },
    });
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(new Uint8Array(Buffer.concat(chunks))));
    try {
      doc.registerFont("OpenSans", Buffer.from(font));
      for (const [name, bytes] of Object.entries(options.fonts ?? {}))
        doc.registerFont(name, Buffer.from(bytes));
      for (const p of pages) {
        const l = p.editor
          ? visualLayout(p.editor.state.print, p.number, options.count)
          : layout(options.profile, p.number, options.count);
        doc.addPage({ size: [l.width * 72, l.height * 72], margin: 0 });
        Object.assign(doc.page.dictionary.data, {
          TrimBox: [
            l.trim.x * 72,
            (l.height - l.trim.y - l.trim.height) * 72,
            (l.trim.x + l.trim.width) * 72,
            (l.height - l.trim.y) * 72,
          ],
          BleedBox: [0, 0, l.width * 72, l.height * 72],
        });
        doc.font("OpenSans");
        const svg = compose(p, {
          solution: options.solution,
          profile: p.editor ? undefined : options.profile,
          count: options.count,
        });
        SVGtoPDF(
          doc,
          svg
            .replace(/width="[0-9.]+in"/, `width="${l.width * 72}"`)
            .replace(/height="[0-9.]+in"/, `height="${l.height * 72}"`),
          0,
          0,
          {
            width: l.width * 72,
            height: l.height * 72,
            fontCallback: (family) =>
              family.includes("Fredoka") && options.fonts?.Fredoka
                ? "Fredoka"
                : family.includes("Nunito") && options.fonts?.Nunito
                  ? "Nunito"
                  : "OpenSans",
            assumePt: true,
          },
        );
        if (options.review)
          doc
            .font("OpenSans")
            .fontSize(7)
            .fillColor("#444")
            .text(
              "REVIEW COPY — NOT APPROVED FOR PUBLICATION",
              l.safe.x * 72,
              l.height * 72 - 20,
              { width: l.safe.width * 72, align: "center", lineBreak: false },
            );
      }
      doc.end();
    } catch (e) {
      doc.destroy();
      reject(e);
    }
  });
}
export async function exportPackage(
  input: unknown,
  font: Uint8Array,
  options: {
    mode: ExportMode;
    profile: PrintProfile;
    fonts?: Record<string, Uint8Array>;
    document: typeof PDFDocument;
  },
) {
  const a = AdventureSchema.parse(input),
    report = preflight(a, options.mode, options.profile);
  if (!report.valid) throw new Error(report.errors.join("\n"));
  const zip = new JSZip(),
    provider = new LocalArtworkProvider();
  const files: { path: string; sha256: string }[] = [];
  const add = async (path: string, data: string | Uint8Array) => {
    zip.file(path, data);
    files.push({
      path,
      sha256:
        typeof data === "string"
          ? await sha256(data)
          : Array.from(
              new Uint8Array(
                await crypto.subtle.digest("SHA-256", new Uint8Array(data)),
              ),
            )
              .map((n) => n.toString(16).padStart(2, "0"))
              .join(""),
    });
  };
  await add(
    "interior.pdf",
    await pdf(a.pages, font, {
      profile: options.profile,
      review: options.mode === "review",
      count: a.pages.length,
      fonts: options.fonts,
      document: options.document,
    }),
  );
  await add(
    "answers.pdf",
    await pdf(a.pages, font, {
      solution: true,
      profile: options.profile,
      review: options.mode === "review",
      count: a.pages.length,
      fonts: options.fonts,
      document: options.document,
    }),
  );
  const provenance = [];
  const answers = [];
  for (const p of a.pages) {
    const n = String(p.number).padStart(3, "0");
    await add(
      `pages/page-${n}.svg`,
      compose(p, {
        profile: p.editor ? undefined : options.profile,
        count: a.pages.length,
      }),
    );
    await add(
      `solutions/page-${n}.svg`,
      compose(p, {
        solution: true,
        profile: p.editor ? undefined : options.profile,
        count: a.pages.length,
      }),
    );
    await add(
      `pages/page-${n}.pdf`,
      await pdf([p], font, {
        profile: options.profile,
        review: options.mode === "review",
        count: a.pages.length,
        fonts: options.fonts,
        document: options.document,
      }),
    );
    const local = await provider.generate({
      theme: p.scene.theme,
      mechanic: p.mechanic,
      seed: p.seed,
      references: [],
    });
    await add(local.asset.file, local.svg);
    provenance.push(...(p.assets.length ? p.assets : [local.asset]));
    for (const asset of p.editor?.state.assets ?? []) {
      const sanitized = safeSvg(asset.svg);
      if ((await sha256(sanitized)) !== asset.hash)
        throw new Error(`Asset hash mismatch: ${asset.name}`);
      await add(`assets/${asset.id}.svg`, sanitized);
      provenance.push({
        id: asset.id,
        type: "svg",
        provider: "import",
        source: asset.source,
        creationRecord: asset.licence,
        version: String(asset.version),
        createdAt: asset.createdAt,
        licence: asset.licence,
        rightsReview: asset.review,
        contentHash: asset.hash,
        file: `assets/${asset.id}.svg`,
      });
    }
    answers.push({
      page: p.number,
      title: p.title,
      seed: p.seed,
      generatorVersion: registry[p.mechanic].version,
      solution: solve(
        registry[p.mechanic].generate(
          { ...p.config, difficulty: p.difficulty },
          p.seed,
        ),
      )[0],
    });
  }
  await add("answer-keys.json", JSON.stringify(answers, null, 2));
  await add("provenance.json", JSON.stringify(provenance, null, 2));
  await add("validation-report.json", JSON.stringify(report, null, 2));
  await add("adventure.json", JSON.stringify(a, null, 2));
  await add(
    "manifest.json",
    JSON.stringify(
      {
        schemaVersion: 1,
        title: a.title,
        adventureId: a.id,
        adventureVersion: a.version,
        mode: options.mode,
        profile: options.profile,
        pageCount: a.pages.length,
        profilePolicy:
          "Visual pages use saved settings; profile selection applies to legacy pages",
        pageProfiles: a.pages.map((p) => {
          const geometry = p.editor
            ? visualLayout(p.editor.state.print, p.number, a.pages.length)
            : layout(options.profile, p.number, a.pages.length);
          return {
            page: p.number,
            widthInches: geometry.width,
            heightInches: geometry.height,
            trim: geometry.trim,
            dpi: p.editor?.state.print.dpi ?? 300,
          };
        }),
        generatedAt: new Date().toISOString(),
        files,
        previewFormat:
          "300 DPI PNG previews are added by browser or CLI exporter",
        integration: "Story Book Builder handoff only; no import verified",
      },
      null,
      2,
    ),
  );
  return zip;
}
