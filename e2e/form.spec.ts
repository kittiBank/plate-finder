import { expect, test } from "@playwright/test";

// Real-browser check of the shared form pieces (native <dialog> isn't in jsdom).
// Screenshots land in test-results/screens/form-*.png for review.
test("PlateInput + ProvincePicker in the dev gallery", async ({ page }) => {
  await page.goto("/dev/components");
  const plate = page.getByRole("textbox", { name: "เลขทะเบียน" });
  await plate.scrollIntoViewIfNeeded();

  await plate.fill("abc");
  await plate.blur();
  await expect(plate).toHaveAttribute("aria-invalid", "true");
  await page.waitForTimeout(300);
  await plate.locator("..").screenshot({ path: "test-results/screens/form-invalid.png" });

  await plate.fill("1กข ๑๒๓๔");
  await page.getByRole("button", { name: /จังหวัด/ }).click();
  const dialog = page.getByRole("dialog", { name: "จังหวัด" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("searchbox")).toBeFocused();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/screens/form-picker.png" });

  await dialog.getByRole("searchbox").fill("นนท");
  await page.waitForTimeout(200);
  await page.screenshot({ path: "test-results/screens/form-picker-search.png" });
  await dialog.getByRole("option", { name: "นนทบุรี" }).click();
  await expect(dialog).toBeHidden();

  await expect(page.getByRole("img", { name: "ป้ายทะเบียน 1กข 1234 นนทบุรี" })).toBeVisible();
  await page.waitForTimeout(700);
  await plate.locator("../..").screenshot({ path: "test-results/screens/form-valid.png" });

  // Escape closes the sheet and returns focus to the trigger.
  const trigger = page.getByRole("button", { name: /จังหวัด/ });
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
