import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
const base = process.env.STAGING_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
try {
  const p = await browser.newPage({ viewport: { width: 1600, height: 1100 } }),
    errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(base);
  await p.waitForSelector(".adventure-card");
  await p.screenshot({ path: "docs/screenshots/build-006-dashboard.png" });
  await p.getByRole("button", { name: "Adventures", exact: true }).click();
  await p
    .getByLabel("Import project JSON")
    .setInputFiles({
      name: "build-006-demo.json",
      mimeType: "application/json",
      buffer: await fs.readFile("artifacts/build-006/adventure.json"),
    });
  await p
    .getByRole("combobox", { name: "Active adventure" })
    .selectOption({ label: "The Moonlit Garden" });
  await p.getByRole("button", { name: "Page Studio", exact: true }).click();
  await p.getByRole("button", { name: "Select robot", exact: true }).click();
  await p.screenshot({
    path: "docs/screenshots/build-006-page-studio.png",
    fullPage: true,
  });
  await p
    .getByRole("button", { name: "Expand workspace", exact: true })
    .click();
  await p.waitForTimeout(100);
  await p.getByRole("button", { name: "Fit page", exact: true }).click();
  await p.screenshot({ path: "docs/screenshots/build-006-focused-canvas.png" });
  await p
    .getByRole("button", { name: "Expand workspace", exact: true })
    .click();
  await p.setViewportSize({ width: 820, height: 1180 });
  await p.getByRole("button", { name: "Fit page", exact: true }).click();
  await p.waitForTimeout(100);
  await p.screenshot({
    path: "docs/screenshots/build-006-tablet.png",
    fullPage: true,
  });
  const overflow = await p.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  if (overflow) throw new Error("Tablet document overflow");
  if (errors.length) throw new Error(errors.join("\n"));
  await fs.writeFile(
    "artifacts/build-006/interface-verification.json",
    JSON.stringify(
      {
        origin: base,
        desktop: [1600, 1100],
        tablet: [820, 1180],
        browserErrors: errors,
        documentOverflow: overflow,
      },
      null,
      2,
    ),
  );
  console.log(
    "Desktop, focus-mode and tablet screenshots saved; no browser errors or document overflow.",
  );
} finally {
  await browser.close();
}
