import { expect, type Page, test } from "@playwright/test";

// Public found-report detail (Phase 4.3). Writes test-results/screens/plate-detail-*.png for review.
const shot = (page: Page, name: string, fullPage = false) =>
  page
    .waitForTimeout(1200) // entrance animations + map tiles
    .then(() => page.screenshot({ path: `test-results/screens/plate-detail-${name}.png`, fullPage }));

test("opens from a search result and goes back to it", async ({ page }) => {
  await page.goto("/search?q=1กข 1234 กรุงเทพ");
  await page.getByRole("link", { name: "ดูรายละเอียดป้าย 1กข 1234" }).first().click();
  await expect(page).toHaveURL(/\/plates\/fr-1$/);
  await expect(page.getByRole("heading", { level: 1, name: "รายละเอียดป้ายที่พบ" })).toBeVisible();

  await page.getByRole("button", { name: "ย้อนกลับ" }).click();
  await expect(page).toHaveURL(/\/search\?q=/);
});

test("shows the plate, status, details, photo and approximate location", async ({ page }) => {
  await page.goto("/plates/fr-1");
  await expect(page.getByRole("img", { name: "ป้ายทะเบียน 1กข 1234 กรุงเทพมหานคร" })).toBeVisible();
  await expect(page.getByText("รอเจ้าของรับคืน")).toBeVisible();

  const details = page.getByRole("definition");
  await expect(details.filter({ hasText: "ซ.ลาดพร้าว 71" })).toBeVisible();
  await expect(details.filter({ hasText: "ป้ายหน้า" })).toBeVisible();
  await expect(details.filter({ hasText: "กรุงเทพมหานคร" })).toBeVisible();

  await expect(page.getByRole("img", { name: "แผนที่ตำแหน่งโดยประมาณแถว ซ.ลาดพร้าว 71" })).toBeVisible();
  // Approximate circle only: no marker pin.
  await expect(page.locator("path.leaflet-interactive, .leaflet-marker-icon")).toHaveCount(0);
  await expect(page.locator(".leaflet-overlay-pane path")).toHaveCount(1);

  await expect(page.getByRole("link", { name: "นี่คือป้ายของฉัน" })).toHaveAttribute(
    "href",
    `/my-plates/new?plate=${encodeURIComponent("1กข1234")}&province=10`,
  );
  await expect(page.getByText("ยังไม่แสดงข้อมูลติดต่อของผู้พบ")).toBeVisible();
  await shot(page, "top");
  await shot(page, "full", true);
});

test("photo opens full screen and closes", async ({ page }) => {
  await page.goto("/plates/fr-1");
  await page.getByRole("button", { name: "ดูรูปเต็มจอ" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await shot(page, "photo");
  await dialog.getByRole("button", { name: "ปิดรูป" }).click();
  await expect(dialog).toBeHidden();
});

test("unknown id shows a friendly not-found page", async ({ page }) => {
  await page.goto("/plates/does-not-exist");
  await expect(page.getByRole("heading", { name: "ไม่พบรายการนี้" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ค้นหาป้ายทะเบียน" })).toHaveAttribute("href", "/search");
  await shot(page, "not-found");
});

test("no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/plates/fr-1");
  await expect(page.getByRole("link", { name: "นี่คือป้ายของฉัน" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBe(0);
  await shot(page, "360");
});
