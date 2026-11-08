import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
test("blank page: size, drag activity, scenery, text, transforms, undo, reload, approval and real export", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByRole("button", { name: "Page Studio", exact: true }).click();
  await page.getByRole("button", { name: "+ Add page", exact: true }).click();
  await page.getByRole("button", { name: "Page setup", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Page size", exact: true })
    .selectOption("A4");
  await page
    .getByRole("combobox", { name: "Grid preset", exact: true })
    .selectOption("free");
  const tile = page.getByRole("button", { name: "Add Maze", exact: true });
  const canvas = page.getByLabel("Page canvas", { exact: true });
  await tile.dragTo(canvas, { targetPosition: { x: 55 * 0.8, y: 220 * 0.8 } });
  await expect(page.locator('[data-kind="puzzle"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Select maze", exact: true }).click();
  await page.getByLabel("X position (pt)", { exact: true }).fill("55");
  await page.getByLabel("Y position (pt)", { exact: true }).fill("220");
  await page.getByLabel("Width (pt)", { exact: true }).fill("430");
  await page.getByLabel("Height (pt)", { exact: true }).fill("450");
  await page.getByRole("button", { name: "Environment", exact: true }).click();
  await page.getByRole("button", { name: "Add tree", exact: true }).click();
  await page.getByLabel("X position (pt)", { exact: true }).fill("450");
  await page.getByLabel("Y position (pt)", { exact: true }).fill("100");
  await page.getByLabel("Width (pt)", { exact: true }).fill("65");
  await page.getByLabel("Height (pt)", { exact: true }).fill("80");
  const handle = page.getByRole("button", { name: "Resize tree", exact: true });
  await handle.scrollIntoViewIfNeeded();
  const hb = await handle.boundingBox();
  if (!hb) throw new Error("Resize handle missing");
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await page.mouse.down();
  await page.mouse.move(hb.x + hb.width / 2 + 8, hb.y + hb.height / 2 + 8, {
    steps: 4,
  });
  await page.mouse.up();
  await expect(page.getByLabel("Width (pt)", { exact: true })).not.toHaveValue(
    "65",
  );
  const tree = page.locator('[data-kind="scenery"]');
  const id = await tree.getAttribute("data-component");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await page
    .getByRole("button", { name: "Page elements", exact: true })
    .click();
  await page.getByRole("button", { name: "Add title", exact: true }).click();
  await page
    .getByLabel("Text content", { exact: true })
    .fill("The moonlit garden");
  await page.getByLabel("X position (pt)", { exact: true }).fill("55");
  await page.getByLabel("Y position (pt)", { exact: true }).fill("55");
  await page
    .getByRole("combobox", { name: "Text font", exact: true })
    .selectOption("Fredoka");
  await page.getByRole("button", { name: "Save layout", exact: false }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Layout saved" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Page Studio", exact: true }).click();
  await page.locator(".page-list button").last().click();
  await expect(page.locator(`[data-component="${id}"]`)).toBeVisible();
  await expect(page.locator(".composition-image")).toContainText(
    "The moonlit garden",
  );
  await page
    .getByRole("button", { name: "Validate layout", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "print-safe" }),
  ).toBeVisible();
  await page
    .getByLabel("Human visual and rights review note")
    .fill("Automated editor fixture, not owner publication approval.");
  await page.getByRole("button", { name: "Approve page & artwork" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "review recorded" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Publishing", exact: true }).click();
  const exported = page.waitForResponse(
    (r) => r.url().endsWith("/api/export") && r.status() < 500,
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export review package" }).click();
  expect((await exported).status()).toBe(200);
  const zip = await JSZip.loadAsync(
    await readFile((await (await download).path())!),
  );
  const svg = await zip.file("pages/page-006.svg")!.async("string");
  expect(svg).toContain("The moonlit garden");
  expect(svg).toContain("8.267");
  expect(svg).not.toMatch(/data-editor-overlay|data-resize-handle|layout-grid/);
  expect(zip.file("pages/page-006.png")).not.toBeNull();
});
test("asset import, metadata, explicit rights approval and reuse", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Assets", exact: true }).click();
  await page
    .getByLabel("Source & commercial-use licence")
    .fill("Original test asset; owner-created fixture.");
  await page.getByLabel("Import asset").setInputFiles({
    name: "test-cloud.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="white" stroke="black" d="M10 70Q0 30 30 35Q40 0 65 35Q100 30 90 70Z"/></svg>',
    ),
  });
  await expect(
    page.getByRole("button", { name: "Inspect test-cloud.svg" }),
  ).toBeVisible();
  await page
    .getByLabel("Asset rights review note")
    .fill("Fixture review only.");
  await page.getByRole("button", { name: "Approve asset rights" }).click();
  await expect(page.locator(".asset-tile")).toContainText("Approved");
  await page.reload();
  await page.getByRole("button", { name: "Assets", exact: true }).click();
  await expect(page.locator(".asset-tile")).toContainText("Approved");
  await page.getByRole("button", { name: "Page Studio", exact: true }).click();
  await page.getByRole("button", { name: "+ Add page", exact: true }).click();
  await page.getByRole("button", { name: "Add Maze", exact: true }).click();
  await page.getByRole("button", { name: "My assets", exact: true }).click();
  await page
    .locator(".component-tile")
    .filter({ hasText: "test-cloud.svg" })
    .click();
  await expect(page.locator('[data-kind="asset"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Save layout", exact: false }).click();
  await page
    .getByRole("button", { name: "Validate layout", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "print-safe" }),
  ).toBeVisible();
});

test("unsaved canvas draft recovers after reload and keyboard operations preserve geometry", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Page Studio", exact: true }).click();
  await page.getByRole("button", { name: "+ Add page", exact: true }).click();
  await page.getByRole("button", { name: "Characters", exact: true }).click();
  await page.getByRole("button", { name: "Add robot", exact: true }).click();
  const selected = page.getByRole("button", {
    name: "Select robot",
    exact: true,
  });
  await selected.focus();
  await selected.press("ArrowRight");
  const x = await page
    .getByLabel("X position (pt)", { exact: true })
    .inputValue();
  await selected.press("Control+d");
  await expect(page.locator('[data-kind="character"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator('[data-kind="character"]')).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "Page Studio", exact: true }).click();
  await page.locator(".page-list button").last().click();
  await expect(page.locator('[data-kind="character"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Select robot", exact: true }).click();
  await expect(page.getByLabel("X position (pt)", { exact: true })).toHaveValue(
    x,
  );
  await page.getByLabel("Monochrome preview").check();
  await expect(page.locator(".canvas-interactions")).toBeHidden();
});
