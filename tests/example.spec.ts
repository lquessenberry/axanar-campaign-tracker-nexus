
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check that the main heading is visible
  await expect(page.locator('h1')).toContainText('Fund the Future of Axanar');
  
  // Check that navigation is present
  await expect(page.locator('nav')).toBeVisible();
  
  // Check that the Explore Campaigns button is present
  await expect(page.locator('text=Explore Campaigns')).toBeVisible();
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
