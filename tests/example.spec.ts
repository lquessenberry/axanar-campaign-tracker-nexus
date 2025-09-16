
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check that a primary hero heading is visible (supports multiple variations)
  await expect(page.locator('h1').first()).toContainText(/Fund the Future of Axanar|Welcome Back/i);
  
  // Check that navigation is present
  await expect(page.locator('nav')).toBeVisible();
  
  // Check that a primary CTA link is present
  await expect(page.getByRole('link', { name: /Explore Campaigns|Access Portal|Sign In/i }).first()).toBeVisible();
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  
  // Click on Campaigns link
  await page.click('text=Campaigns');
  await expect(page).toHaveURL('/campaigns');
  
  // Go back to home
  await page.click('text=Home');
  await expect(page).toHaveURL('/');
});
