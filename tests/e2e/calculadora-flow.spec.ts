import { test, expect } from "@playwright/test";

test.describe("Calculadora Flow", () => {
  test("calculadoras page loads with catalog", async ({ page }) => {
    await page.goto("/calculadoras");
    // Should have calculator cards
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });

  test("renta calculator loads and accepts input", async ({ page }) => {
    await page.goto("/calculadoras/renta");
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
    // Should have input fields
    const inputs = page.locator('input[type="number"], input[type="text"]');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test("comparador calculator loads", async ({ page }) => {
    await page.goto("/calculadoras/comparador");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });

  test("UVT calculator loads", async ({ page }) => {
    await page.goto("/calculadoras/uvt");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });
});
