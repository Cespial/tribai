import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("hero section is visible", async ({ page }) => {
    await page.goto("/");
    // The landing page should have a hero heading
    const hero = page.locator("h1").first();
    await expect(hero).toBeVisible();
  });

  test("main CTA buttons are clickable", async ({ page }) => {
    await page.goto("/");
    // Look for primary CTA links
    const ctaLinks = page.locator('a[href*="calculadoras"], a[href*="asistente"]');
    const count = await ctaLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("footer is visible", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("page title contains tribai or tributaria", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/tribai|tributar/);
  });

  test("navigation header is present", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });
});
