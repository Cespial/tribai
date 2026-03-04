import { test, expect, devices } from "@playwright/test";

test.describe("Responsive Mobile", () => {
  test.use({ ...devices["iPhone 14"] });

  test("landing page is legible on mobile", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("h1").first();
    await expect(hero).toBeVisible();
    // Content should not overflow horizontally
    const body = page.locator("body");
    const box = await body.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(430); // iPhone 14 width
  });

  test("navigation works on mobile", async ({ page }) => {
    await page.goto("/");
    // Header should be visible
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
  });

  test("calculadora page is usable on mobile", async ({ page }) => {
    await page.goto("/calculadoras");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });

  test("article page is readable on mobile", async ({ page }) => {
    await page.goto("/articulo/art-240");
    await page.waitForLoadState("networkidle");
    const content = page.locator("main");
    await expect(content).toBeVisible();
  });

  test("footer is accessible on mobile", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
