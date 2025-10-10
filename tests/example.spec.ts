
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check that navigation is present
  await expect(page.locator('nav')).toBeVisible();
  
  // Check that there is at least one visible navigation link
  await expect(page.locator('nav a').first()).toBeVisible();
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
