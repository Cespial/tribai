import { test, expect } from "@playwright/test";

test.describe("Article Navigation", () => {
  test("Art. 240 page loads correctly", async ({ page }) => {
    await page.goto("/articulo/art-240");
    await page.waitForLoadState("networkidle");
    // Should display article content
    const content = page.locator("main");
    await expect(content).toBeVisible();
    // Title should reference Art. 240
    const heading = page.locator("h1");
    await expect(heading).toContainText("240");
  });

  test("explorador page loads", async ({ page }) => {
    await page.goto("/explorador");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });

  test("non-existent article returns 404", async ({ page }) => {
    const response = await page.goto("/articulo/art-99999");
    // Should return 404 status
    expect(response?.status()).toBe(404);
  });

  test("article has navigation to related articles", async ({ page }) => {
    await page.goto("/articulo/art-240");
    await page.waitForLoadState("networkidle");
    // Look for any links to other articles
    const articleLinks = page.locator('a[href*="/articulo/"]');
    const count = await articleLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});
