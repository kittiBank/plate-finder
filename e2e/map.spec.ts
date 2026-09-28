import { expect, test } from "@playwright/test";

// Map interactions with mock data (Phase 3).
test.beforeEach(async ({ page }) => {
  await page.goto("/map");
  // Marker anchors are 0×0; the visible pin is their child.
  await expect(page.locator(".leaflet-marker-icon > div").first()).toBeVisible();
});

test("shows all mock reports and a selected plate", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "พบ 18 ป้ายใกล้คุณ" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ดูรายละเอียด" })).toHaveAttribute("href", /^\/plates\/fr-/);
});

test("filters by plate number", async ({ page }) => {
  await page.getByRole("searchbox", { name: "ค้นหาพื้นที่หรือเลขทะเบียน" }).fill("1กข 1234");
  await expect(page.getByRole("heading", { name: "พบ 1 ป้ายใกล้คุณ" })).toBeVisible();
  await expect(page.getByRole("img", { name: /1กข 1234/ })).toBeVisible();
});

test("shows an empty state when nothing matches", async ({ page }) => {
  await page.getByRole("searchbox").fill("ฮฮ9999");
  await expect(page.getByText("ไม่พบป้ายตามตัวกรองนี้")).toBeVisible();
});

test("filter chips are single-select; the flood chip toggles on its own", async ({ page }) => {
  const today = page.getByRole("button", { name: "พบวันนี้" });
  await today.click();
  await expect(today).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "ทั้งหมด" })).toHaveAttribute("aria-pressed", "false");

  const flood = page.getByRole("button", { name: "พื้นที่น้ำท่วม" });
  await expect(flood).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("path.leaflet-interactive")).toHaveCount(1);
  await flood.click();
  await expect(flood).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("path.leaflet-interactive")).toHaveCount(0);
});

test("tapping a pin selects that report", async ({ page }) => {
  const sheetPlate = page.getByRole("region", { name: /ป้ายใกล้คุณ/ }).getByRole("img");
  const before = await sheetPlate.getAttribute("aria-label");

  // Single-report pins are titled with their plate; skip clusters, the user dot and the selected pin.
  const pins = page.locator(".leaflet-marker-icon[title]");
  const titles = await pins.evaluateAll((els) => els.map((e) => e.getAttribute("title") ?? ""));
  const target = titles.find(
    (t) => /^[1-9]?[ก-ฮ]{1,2} \d{1,4}$/.test(t) && !before?.includes(t),
  );
  expect(target, "expected at least one unselected single pin in view").toBeTruthy();

  await page.locator(`.leaflet-marker-icon[title="${target}"] > div`).first().click();
  await expect(sheetPlate).toHaveAttribute("aria-label", new RegExp(target!));
});
