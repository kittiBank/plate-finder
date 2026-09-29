import { expect, type Page, test } from "@playwright/test";

// Walks the whole "report a found plate" flow and writes test-results/screens/report-*.png for review.
test.use({
  geolocation: { latitude: 13.7563, longitude: 100.5018 },
  permissions: ["geolocation"],
});

const shot = (page: Page, name: string) =>
  page.waitForTimeout(700).then(() => page.screenshot({ path: `test-results/screens/report-${name}.png` }));

/** A fake "photo": a plate on a muddy background, rendered by the browser itself. */
async function fakePlatePhoto(page: Page) {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.setContent(`
    <body style="margin:0;display:grid;place-items:center;height:100vh;background:radial-gradient(circle at 30% 30%,#8a7a5c,#4d4332)">
      <div style="transform:rotate(-6deg);background:#f4f1ea;border:6px solid #1b1b1b;border-radius:14px;padding:18px 40px;text-align:center;font:700 96px sans-serif;box-shadow:0 20px 40px #0006">
        1กข 1234<div style="font:500 40px sans-serif">กรุงเทพมหานคร</div>
      </div>
    </body>`);
  const buffer = await page.screenshot({ type: "jpeg" });
  await page.setViewportSize({ width: 390, height: 844 });
  return { name: "plate.jpg", mimeType: "image/jpeg", buffer };
}

test("report flow: photo → plate → position → location → review → success", async ({ page }) => {
  const photo = await fakePlatePhoto(page);
  const next = page.getByRole("button", { name: "ถัดไป" });

  // 1. Photo (required)
  await page.goto("/report");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ถ่ายรูปป้ายที่พบ");
  await expect(next).toBeDisabled();
  await shot(page, "1-photo");
  await page.getByLabel("ถ่ายรูปป้าย").setInputFiles(photo);
  await expect(page.getByRole("img", { name: "รูปป้ายทะเบียนที่พบ" })).toBeVisible();
  await shot(page, "1-photo-filled");
  await next.click();

  // 2. Plate + province
  await expect(page).toHaveURL(/step=plate/);
  await expect(next).toBeDisabled();
  await page.getByRole("textbox", { name: "เลขทะเบียน" }).fill("1กข 1234");
  await page.getByRole("button", { name: /จังหวัด/ }).click();
  await page.getByRole("dialog").getByRole("searchbox").fill("กรุงเทพ");
  await page.getByRole("option", { name: "กรุงเทพมหานคร" }).click();
  await shot(page, "2-plate");
  await next.click();

  // 3. Position; the phone's Back button returns to the plate step with input kept.
  await expect(page).toHaveURL(/step=position/);
  await page.goBack();
  await expect(page.getByRole("textbox", { name: "เลขทะเบียน" })).toHaveValue("1กข 1234");
  await page.goForward();
  await expect(next).toBeDisabled();
  await page.getByText("ป้ายหลัง", { exact: true }).click();
  await expect(page.getByRole("radio", { name: /ป้ายหลัง/ })).toBeChecked();
  await shot(page, "3-position");
  await next.click();

  // 4. Location
  await expect(page).toHaveURL(/step=location/);
  await page.getByRole("button", { name: "ใช้ตำแหน่งของฉัน" }).click();
  await page.waitForTimeout(1200); // fly animation + tiles
  await shot(page, "4-location");
  await next.click();

  // 5. Review → edit plate → comes back to review
  await expect(page).toHaveURL(/step=review/);
  await expect(page.getByRole("img", { name: "ป้ายทะเบียน 1กข 1234 กรุงเทพมหานคร" })).toBeVisible();
  await shot(page, "5-review");
  await page.getByRole("button", { name: "แก้ไขป้ายทะเบียน" }).click();
  await expect(page).toHaveURL(/step=plate/);
  await page.getByRole("button", { name: "ตรวจสอบก่อนส่ง" }).click();
  await expect(page).toHaveURL(/step=review/);

  // Success
  await page.getByRole("button", { name: "ส่งการแจ้งพบ" }).click();
  await expect(page.getByRole("heading", { name: "ขอบคุณที่ช่วยกันนะ" })).toBeVisible();
  await shot(page, "6-success");
});

test("report flow: reloading mid-flow restarts at the photo step", async ({ page }) => {
  await page.goto("/report?step=location");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ถ่ายรูปป้ายที่พบ");
  await expect(page).toHaveURL(/\/report$/);
});

test("report flow: no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/report");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});
