import { expect, type Page, test } from "@playwright/test";

// "Add a lost plate" form with mock save + matching (Phase 4.4). Writes test-results/screens/add-plate-*.png.
const shot = (page: Page, name: string, fullPage = false) =>
  page.waitForTimeout(800).then(() => page.screenshot({ path: `test-results/screens/add-plate-${name}.png`, fullPage }));

const submit = (page: Page) => page.getByRole("button", { name: "เริ่มติดตามป้ายนี้" });

async function pickProvince(page: Page, name: string) {
  await page.getByRole("button", { name: /^จังหวัด/ }).click();
  await page.getByRole("dialog").getByRole("searchbox").fill(name);
  await page.getByRole("option", { name }).click();
}

test("empty form: submit waits until the required fields are filled", async ({ page }) => {
  await page.goto("/my-plates/new");
  await expect(page.getByRole("heading", { level: 1, name: "ป้ายไหนหายไป?" })).toBeVisible();
  await expect(submit(page)).toBeDisabled();
  await expect(page.getByText("กรอกให้ครบก่อนนะ: เลขทะเบียน, จังหวัด, ป้ายที่หาย")).toBeVisible();
  await shot(page, "empty");
  await shot(page, "empty-full", true);

  await page.getByLabel("เลขทะเบียน", { exact: true }).fill("9ฮฮ 9999");
  await pickProvince(page, "เชียงใหม่");
  await page.getByRole("radio", { name: "ทั้งสองป้าย" }).check({ force: true });
  await page.getByRole("button", { name: "รถกระบะ" }).click();
  await expect(page.getByRole("button", { name: "รถกระบะ" })).toHaveAttribute("aria-pressed", "true");
  await expect(submit(page)).toBeEnabled();
  await shot(page, "filled", true);

  // No mock report matches → "tracking" success.
  await submit(page).click();
  await expect(page.getByRole("heading", { name: "เริ่มติดตามแล้ว" })).toBeVisible();
  await expect(page.getByText("ติดตามทั้งป้ายหน้าและป้ายหลัง")).toBeVisible();
  await expect(page.getByRole("link", { name: "ไปที่ป้ายของฉัน" })).toHaveAttribute("href", "/my-plates");
  await shot(page, "done");
});

test("prefilled from plate detail: a strong match shows the found report right away", async ({ page }) => {
  await page.goto("/plates/fr-1");
  await page.getByRole("link", { name: "นี่คือป้ายของฉัน" }).click();
  await expect(page).toHaveURL(/\/my-plates\/new\?plate=/);
  await expect(page.getByLabel("เลขทะเบียน", { exact: true })).toHaveValue("1กข 1234");
  await expect(page.getByRole("button", { name: /^จังหวัด/ })).toContainText("กรุงเทพมหานคร");

  await page.getByRole("radio", { name: "ป้ายหน้า" }).check({ force: true });
  await submit(page).click();
  await expect(page.getByRole("heading", { name: "มีคนพบป้ายนี้แล้ว!" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ดูป้ายที่พบ" })).toHaveAttribute("href", "/plates/fr-1");
  await shot(page, "match");
});

test("junk URL params are ignored", async ({ page }) => {
  await page.goto("/my-plates/new?plate=hello&province=999");
  await expect(page.getByLabel("เลขทะเบียน", { exact: true })).toHaveValue("");
  await expect(page.getByRole("button", { name: /^จังหวัด/ })).toContainText("เลือกจังหวัด");
});

test("a future lost date is rejected", async ({ page }) => {
  await page.goto(`/my-plates/new?plate=${encodeURIComponent("1กข1234")}&province=10`);
  await page.getByRole("radio", { name: "ป้ายหลัง" }).check({ force: true });
  await expect(submit(page)).toBeEnabled();
  await page.getByLabel("หายตั้งแต่วันที่").fill("2099-01-01");
  await expect(page.getByText("เลือกวันที่ไม่เกินวันนี้")).toBeVisible();
  await expect(submit(page)).toBeDisabled();
});

test("no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/my-plates/new");
  await expect(submit(page)).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBe(0);
  await shot(page, "360", true);
});
