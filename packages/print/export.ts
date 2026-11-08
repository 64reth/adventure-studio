import PDFDocument from "pdfkit";
import { exportPackage as renderPackage, pdf as renderPDF } from "./pipeline";
export { preflight } from "./pipeline";
export type { ExportMode } from "./pipeline";
export function exportPackage(
  input: unknown,
  font: Uint8Array,
  options: Omit<Parameters<typeof renderPackage>[2], "document">,
) {
  return renderPackage(input, font, { ...options, document: PDFDocument });
}
export function pdf(
  pages: Parameters<typeof renderPDF>[0],
  font: Uint8Array,
  options: Omit<Parameters<typeof renderPDF>[2], "document">,
) {
  return renderPDF(pages, font, { ...options, document: PDFDocument });
}
