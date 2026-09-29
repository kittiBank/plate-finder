import { expect, type Page, test } from "@playwright/test";

// Search results with mock data (Phase 4.2). Writes test-results/screens/search-*.png for review.
const shot = (page: Page, name: string, fullPage = false) =>
  page.waitForTimeout(800).then(() => page.screenshot({ path: `test-results/screens/search-${name}.png`, fullPage }));

const searchbox = (page: Page) => page.getByRole("searchbox", { name: "เลขทะเบียนและจังหวัด" });

test("home search box submits to /search", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "ค้นหาเลขทะเบียนหรือจังหวัด" }).fill("1กข 1234");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=/);
  await expect(page.getByRole("heading", { name: "ตรงกับป้ายของคุณ" })).toBeVisible();
});

test("plate + province: exact matches and similar suggestions", async ({ page }) => {
  await page.goto("/search?q=1กข 1234 กรุงเทพ");
  await expect(searchbox(page)).toHaveValue("1กข 1234 กรุงเทพ");
  await expect(page.getByText("1กข 1234 · กรุงเทพมหานคร")).toBeVisible();

  const exact = page.getByRole("region", { name: "ตรงกับป้ายของคุณ" });
  await expect(exact.getByRole("listitem")).toHaveCount(1);
  await expect(exact.getByRole("link", { name: "ดูรายละเอียดป้าย 1กข 1234" })).toHaveAttribute(
    "href",
    "/plates/fr-1",
  );

  const similar = page.getByRole("region", { name: "ป้ายที่ใกล้เคียง" });
  await expect(similar.getByText("เลขตรง แต่จังหวัดต่างกัน")).toBeVisible();
  await expect(similar.getByText("ต่างกันหนึ่งตัว")).toBeVisible();
  await shot(page, "results");
  await shot(page, "results-full", true);
});

test("no exact match: reassuring message with a prefilled register CTA", async ({ page }) => {
  await page.goto("/search?q=9ฮฮ 9999");
  await expect(page.getByRole("heading", { name: "ยังไม่มีคนแจ้งพบ 9ฮฮ 9999" })).toBeVisible();
  const cta = page.getByRole("link", { name: "ลงทะเบียนป้ายที่หาย" });
  await expect(cta).toHaveAttribute("href", `/my-plates/new?plate=${encodeURIComponent("9ฮฮ9999")}`);
  await shot(page, "none");
});

test("searching again from the results page updates the results", async ({ page }) => {
  await page.goto("/search?q=9ฮฮ 9999");
  await searchbox(page).fill("1กข1284");
  await page.getByRole("button", { name: "ค้นหา" }).click();
  await expect(page.getByRole("region", { name: "ตรงกับป้ายของคุณ" })).toBeVisible();
  await expect(searchbox(page)).toHaveValue("1กข1284");
});

test("empty query: focused input and tappable examples", async ({ page }) => {
  await page.goto("/search");
  await expect(searchbox(page)).toBeFocused();
  await expect(page.getByRole("heading", { name: "พิมพ์เลขทะเบียนที่หาย" })).toBeVisible();
  await shot(page, "empty");
  await page.getByRole("link", { name: "กข 123", exact: true }).click();
  await expect(searchbox(page)).toHaveValue("กข 123");
});

test("province only: asks for the plate instead of listing the province", async ({ page }) => {
  await page.goto("/search?q=นนทบุรี");
  await expect(page.getByRole("heading", { name: "ขอเลขทะเบียนด้วยนะ" })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(0);
  await shot(page, "province-only");
});

test("invalid text shows a format hint", async ({ page }) => {
  await page.goto("/search?q=hello");
  await expect(page.getByRole("heading", { name: "ยังอ่านเลขทะเบียนไม่ออก" })).toBeVisible();
});

test("no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/search?q=1กข 1234 กรุงเทพ");
  await expect(page.getByRole("region", { name: "ตรงกับป้ายของคุณ" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBe(0);
  await shot(page, "results-360");
});

test("number only: every plate with that number, plus near numbers", async ({ page }) => {
  await page.goto("/search?q=1234");
  await expect(page.getByText("เลข 1234 · ทุกจังหวัด")).toBeVisible();

  const exact = page.getByRole("region", { name: "ป้ายที่มีเลข 1234" });
  await expect(exact.getByRole("link", { name: "ดูรายละเอียดป้าย 1กข 1234" })).toHaveCount(2); // กรุงเทพ + ปทุมธานี
  await expect(exact.getByRole("link", { name: "ดูรายละเอียดป้าย ขค 1234" })).toBeVisible();

  const similar = page.getByRole("region", { name: "ป้ายที่ใกล้เคียง" });
  await expect(similar.getByRole("link", { name: "ดูรายละเอียดป้าย 3ฆก 1324" })).toBeVisible(); // swapped digits
  await expect(similar.getByRole("link", { name: "ดูรายละเอียดป้าย 1กข 1284" })).toBeVisible(); // one digit off
  await shot(page, "number");
  await shot(page, "number-full", true);
});

test("number + province narrows the exact results", async ({ page }) => {
  await page.goto("/search?q=1234 นนทบุรี");
  const exact = page.getByRole("region", { name: "ป้ายที่มีเลข 1234" });
  await expect(exact.getByRole("listitem")).toHaveCount(1);
  await expect(exact.getByRole("link", { name: "ดูรายละเอียดป้าย ขค 1234" })).toBeVisible();
});
