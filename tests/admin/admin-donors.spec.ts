import { test, expect } from '@playwright/test';

/**
 * Test suite for admin donor functionality in the Axanar Campaign Tracker Nexus
 */
test.describe('Admin Donor Management', () => {
  // Setup - runs before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin login page
    await page.goto('/admin/login');
    
    // Fill in login credentials (these would need to be environment variables in production)
    await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@example.com');
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'password123');
    
    // Submit the login form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to admin dashboard
    await page.waitForURL('/admin/dashboard');
    
    // Verify we're on the admin dashboard
    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('should navigate to donors section', async ({ page }) => {
    // Click on donors section in the sidebar
    await page.click('button:has-text("Donors")');
    
    // Verify the donors section is displayed
    await expect(page.locator('h2:has-text("Donor Management")')).toBeVisible();
  });

  test('should display donor list', async ({ page }) => {
    // Navigate to donors section
    await page.click('button:has-text("Donors")');
    
    // Verify that the donor table is visible
    await expect(page.locator('table')).toBeVisible();
    
    // Verify that the table headers are correct
    await expect(page.locator('th:has-text("Donor Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should search for donors', async ({ page }) => {
    // Navigate to donors section
    await page.click('button:has-text("Donors")');
    
    // Type in the search box
    await page.fill('input[placeholder*="Search"]', 'spoof1');
    
    // Wait for the search results to update
    await page.waitForTimeout(500);
    
    // Verify search results contain the expected donor
    // This will be more specific once we create our spoof donors
    await expect(page.locator('table')).toContainText('spoof1');
  });

  test('should edit donor details', async ({ page }) => {
    // Navigate to donors section
    await page.click('button:has-text("Donors")');
    
    // Search for our test donor
    await page.fill('input[placeholder*="Search"]', 'spoof1');
    await page.waitForTimeout(500);
    
    // Click the edit button for the first donor
    await page.click('button[aria-label="Edit donor"]');
    
    // Verify edit dialog is visible
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Update donor details
    await page.fill('input[name="donor_name"]', 'Updated Spoof1 Donor');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('div:has-text("Donor updated successfully")')).toBeVisible();
    
    // Verify table shows updated name
    await expect(page.locator('table')).toContainText('Updated Spoof1 Donor');
  });

  // More tests to be added as functionality is implemented
});
