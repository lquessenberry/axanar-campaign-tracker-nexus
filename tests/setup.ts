
import { test as setup, expect } from '@playwright/test';

setup('basic setup', async ({ page }) => {
  // Navigate to the homepage to ensure the app loads
  await page.goto('/');
  
  // Wait for the page to load
  await expect(page.locator('h1')).toContainText('Axanar');
});
