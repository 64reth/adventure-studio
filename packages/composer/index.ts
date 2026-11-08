import { compose as legacyCompose } from "./legacy";
import { renderVisual } from "../editor/render";
import type { Page } from "../core/index";
export {
  esc,
  puzzleSvg,
  scenery,
  wrapLines,
  measure,
  blankPage,
} from "./legacy";
export function compose(
  page: Page,
  options: Parameters<typeof legacyCompose>[1] = {},
) {
  return page.editor
    ? renderVisual(page, options)
    : legacyCompose(page, options);
}
