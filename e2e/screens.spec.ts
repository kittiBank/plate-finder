import { expect, test } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";

// Visual check of each tab screen against /design (CLAUDE.md §9.3). Writes
// test-results/screens/<name>.png (app) next to <name>.design.png (design file)
// for side-by-side comparison; these are not pixel assertions.
const SCREENS = [
  { name: "home", path: "/", design: "Main.dc.html" },
  { name: "my-plates", path: "/my-plates", design: "MyPlates.dc.html" },
  { name: "map", path: "/map", design: "Map.dc.html" },
];

for (const screen of SCREENS) {
  test(`${screen.name}: renders at 390×844`, async ({ page }) => {
    await page.goto(screen.path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800); // let entrance animations finish
    await expect(page.getByRole("navigation", { name: "เมนูหลัก" })).toBeVisible();
    await page.screenshot({ path: `test-results/screens/${screen.name}.png` });
    await page.screenshot({ path: `test-results/screens/${screen.name}-full.png`, fullPage: true });

    await page.goto(pathToFileURL(path.join("design", screen.design)).href);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `test-results/screens/${screen.name}.design.png`, fullPage: true });
  });

  test(`${screen.name}: no horizontal scroll at 360px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(screen.path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}
