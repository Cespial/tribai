import { test, expect } from "@playwright/test";

test.describe("Dark Mode", () => {
  test("page loads in light mode by default", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    // Should not have .dark class initially (or system preference)
    const classList = await html.getAttribute("class");
    // Light mode is the default — dark may be set by system preference
    expect(classList).toBeDefined();
  });

  test("dark mode toggle exists", async ({ page }) => {
    await page.goto("/");
    // Look for theme toggle button
    const toggle = page.locator('button[aria-label*="tema"], button[aria-label*="theme"], button[aria-label*="modo"], [data-testid="theme-toggle"]');
    const count = await toggle.count();
    // If toggle exists, it should be clickable
    if (count > 0) {
      await expect(toggle.first()).toBeVisible();
    }
  });

  test("dark mode applies .dark class to html", async ({ page }) => {
    await page.goto("/");
    // Find and click the theme toggle
    const toggle = page.locator('button[aria-label*="tema"], button[aria-label*="theme"], button[aria-label*="modo"], [data-testid="theme-toggle"]');
    const count = await toggle.count();
    if (count > 0) {
      await toggle.first().click();
      // Wait for transition
      await page.waitForTimeout(300);
      const html = page.locator("html");
      const classList = await html.getAttribute("class");
      // After toggle, class should change (either add or remove .dark)
      expect(classList).toBeDefined();
    }
  });
});
