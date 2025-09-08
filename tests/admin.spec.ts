import { test, expect, Page } from '@playwright/test';

// Admin test credentials
const adminUser = {
  email: 'admin@axanar.com',
  password: 'AdminPassword123!'
};

const testDonor = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-123-4567',
  address: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  postalCode: '90210'
};

const testCampaign = {
  name: 'Test Campaign 2024',
  description: 'A test campaign for automated testing',
  goalAmount: '50000',
  startDate: '2024-01-01',
  endDate: '2024-12-31'
};

test.describe('Admin Authentication', () => {
  
  test('should allow admin login and access admin dashboard', async ({ page }) => {
    await page.goto('/auth');
    
    // Login as admin
    await page.fill('[name="email"]', adminUser.email);
    await page.fill('[name="password"]', adminUser.password);
    await page.click('button:has-text("Sign In")');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
    
    // Navigate to admin dashboard
    await page.goto('/admin');
    
    // Should have access to admin dashboard
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('[data-testid="admin-navigation"]')).toBeVisible();
  });

  test('should deny non-admin access to admin areas', async ({ page }) => {
    // First create a regular user account
    await page.goto('/auth');
    
    // Try to access admin area without admin privileges
    await page.goto('/admin');
    
    // Should show access denied or redirect to login
    await expect(page.locator('text=Access Denied') || page).toHaveURL('/auth');
  });
});

test.describe('Admin Donor Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth');
    await page.fill('[name="email"]', adminUser.email);
    await page.fill('[name="password"]', adminUser.password);
    await page.click('button:has-text("Sign In")');
    await page.goto('/admin/dashboard?section=donors');
  });

  test('should display donor list and allow searching', async ({ page }) => {
    // Should show donor management interface
    await expect(page.locator('h2')).toContainText('Donor Management');
    await expect(page.locator('[data-testid="donor-table"]')).toBeVisible();
    
    // Should show search functionality
    await expect(page.locator('[placeholder*="search"]')).toBeVisible();
    
    // Test search functionality
    await page.fill('[placeholder*="search"]', 'john');
    await page.keyboard.press('Enter');
    
    // Should filter results
    const rows = page.locator('[data-testid="donor-row"]');
    await expect(rows.first()).toBeVisible();
  });

  test('should allow adding new donor', async ({ page }) => {
    // Click add donor button
    await page.click('button:has-text("Add Donor")');
    
    // Should show donor creation form
    await expect(page.locator('h3')).toContainText('Add New Donor');
    
    // Fill donor information
    await page.fill('[name="firstName"]', testDonor.firstName);
    await page.fill('[name="lastName"]', testDonor.lastName);
    await page.fill('[name="email"]', testDonor.email);
    await page.fill('[name="phone"]', testDonor.phone);
    await page.fill('[name="address1"]', testDonor.address);
    await page.fill('[name="city"]', testDonor.city);
    await page.selectOption('[name="state"]', testDonor.state);
    await page.fill('[name="postal_code"]', testDonor.postalCode);
    
    // Save donor
    await page.click('button:has-text("Save Donor")');
    
    // Should show success message and return to list
    await expect(page.locator('text=Donor added successfully')).toBeVisible();
    await expect(page.locator(`text=${testDonor.email}`)).toBeVisible();
  });

  test('should allow editing existing donor information', async ({ page }) => {
    // Find and click edit button for first donor
    const firstRow = page.locator('[data-testid="donor-row"]').first();
    await firstRow.locator('button:has-text("Edit")').click();
    
    // Should show edit form
    await expect(page.locator('h3')).toContainText('Edit Donor');
    
    // Update donor information
    const updatedPhone = '555-999-8888';
    await page.fill('[name="phone"]', updatedPhone);
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Should show success message
    await expect(page.locator('text=Donor updated successfully')).toBeVisible();
    
    // Should show updated information in list
    await expect(page.locator(`text=${updatedPhone}`)).toBeVisible();
  });

  test('should allow assigning donors to campaigns', async ({ page }) => {
    // Select a donor
    const firstRow = page.locator('[data-testid="donor-row"]').first();
    await firstRow.locator('[type="checkbox"]').check();
    
    // Click bulk actions
    await page.click('button:has-text("Bulk Actions")');
    await page.click('text=Assign to Campaign');
    
    // Should show campaign selection dialog
    await expect(page.locator('text=Select Campaign')).toBeVisible();
    
    // Select a campaign
    await page.selectOption('[name="campaignId"]', { index: 1 });
    await page.fill('[name="donationAmount"]', '100');
    
    // Confirm assignment
    await page.click('button:has-text("Assign")');
    
    // Should show success message
    await expect(page.locator('text=Donors assigned to campaign')).toBeVisible();
  });

  test('should allow marking perk shipping status', async ({ page }) => {
    // Navigate to donor detail view
    const firstRow = page.locator('[data-testid="donor-row"]').first();
    await firstRow.click();
    
    // Should show donor detail view
    await expect(page.locator('[data-testid="donor-detail"]')).toBeVisible();
    
    // Should show perks section
    await expect(page.locator('[data-testid="donor-perks"]')).toBeVisible();
    
    // Mark first perk as shipped
    const firstPerk = page.locator('[data-testid="perk-item"]').first();
    await firstPerk.locator('button:has-text("Mark Shipped")').click();
    
    // Should show confirmation dialog
    await expect(page.locator('text=Mark as Shipped')).toBeVisible();
    
    // Add tracking number
    await page.fill('[name="trackingNumber"]', 'TRACK123456');
    await page.click('button:has-text("Confirm")');
    
    // Should show success message and update status
    await expect(page.locator('text=Perk marked as shipped')).toBeVisible();
    await expect(firstPerk.locator('text=Shipped')).toBeVisible();
  });
});

test.describe('Admin Campaign Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', adminUser.email);
    await page.fill('[name="password"]', adminUser.password);
    await page.click('button:has-text("Sign In")');
    await page.goto('/admin/dashboard?section=campaigns');
  });

  test('should display campaign list and allow management', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Campaign Management');
    await expect(page.locator('[data-testid="campaign-table"]')).toBeVisible();
  });

  test('should allow creating new campaign', async ({ page }) => {
    await page.click('button:has-text("Add Campaign")');
    
    // Fill campaign form
    await page.fill('[name="name"]', testCampaign.name);
    await page.fill('[name="description"]', testCampaign.description);
    await page.fill('[name="goalAmount"]', testCampaign.goalAmount);
    await page.fill('[name="startDate"]', testCampaign.startDate);
    await page.fill('[name="endDate"]', testCampaign.endDate);
    
    await page.click('button:has-text("Create Campaign")');
    
    await expect(page.locator('text=Campaign created successfully')).toBeVisible();
    await expect(page.locator(`text=${testCampaign.name}`)).toBeVisible();
  });

  test('should allow editing campaign information', async ({ page }) => {
    const firstRow = page.locator('[data-testid="campaign-row"]').first();
    await firstRow.locator('button:has-text("Edit")').click();
    
    // Update campaign
    const updatedDescription = 'Updated campaign description';
    await page.fill('[name="description"]', updatedDescription);
    
    await page.click('button:has-text("Save Changes")');
    
    await expect(page.locator('text=Campaign updated successfully')).toBeVisible();
  });

  test('should allow bulk perk shipping by campaign', async ({ page }) => {
    // Select a campaign
    const firstRow = page.locator('[data-testid="campaign-row"]').first();
    await firstRow.locator('button:has-text("Manage Perks")').click();
    
    // Should show campaign perks management
    await expect(page.locator('text=Campaign Perks Management')).toBeVisible();
    
    // Select all perks
    await page.click('button:has-text("Select All")');
    
    // Mark as shipped
    await page.click('button:has-text("Mark Selected as Shipped")');
    
    // Confirm bulk shipping
    await page.click('button:has-text("Confirm Bulk Shipping")');
    
    await expect(page.locator('text=Perks marked as shipped')).toBeVisible();
  });
});

test.describe('Admin Perk Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', adminUser.email);
    await page.fill('[name="password"]', adminUser.password);
    await page.click('button:has-text("Sign In")');
    await page.goto('/admin/dashboard?section=perks');
  });

  test('should allow adding new perks to database', async ({ page }) => {
    await page.click('button:has-text("Add Perk")');
    
    // Fill perk information
    await page.fill('[name="name"]', 'Test Perk Item');
    await page.fill('[name="description"]', 'A test perk for automated testing');
    await page.fill('[name="value"]', '25');
    
    await page.click('button:has-text("Create Perk")');
    
    await expect(page.locator('text=Perk created successfully')).toBeVisible();
  });

  test('should allow assigning perks to campaigns', async ({ page }) => {
    // Select a perk
    const firstPerk = page.locator('[data-testid="perk-row"]').first();
    await firstPerk.locator('[type="checkbox"]').check();
    
    // Assign to campaign
    await page.click('button:has-text("Assign to Campaign")');
    
    // Select campaign
    await page.selectOption('[name="campaignId"]', { index: 1 });
    await page.click('button:has-text("Assign")');
    
    await expect(page.locator('text=Perk assigned to campaign')).toBeVisible();
  });

  test('should allow assigning perks to individual donors', async ({ page }) => {
    const firstPerk = page.locator('[data-testid="perk-row"]').first();
    await firstPerk.locator('button:has-text("Assign to Donor")').click();
    
    // Search for donor
    await page.fill('[placeholder="Search donors..."]', 'john');
    await page.click('[data-testid="donor-result"]');
    
    // Set quantity
    await page.fill('[name="quantity"]', '2');
    
    await page.click('button:has-text("Assign Perk")');
    
    await expect(page.locator('text=Perk assigned to donor')).toBeVisible();
  });
});

test.describe('Admin Data Import', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', adminUser.email);
    await page.fill('[name="password"]', adminUser.password);
    await page.click('button:has-text("Sign In")');
    await page.goto('/admin/dashboard?section=import');
  });

  test('should allow importing campaign data from external platforms', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Data Import');
    
    // Test Kickstarter import
    await page.click('text=Kickstarter Import');
    
    // Upload test file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/kickstarter-sample.csv');
    
    // Configure import settings
    await page.selectOption('[name="campaignMapping"]', 'auto');
    await page.check('[name="createMissingDonors"]');
    
    await page.click('button:has-text("Start Import")');
    
    // Should show import progress
    await expect(page.locator('text=Importing data...')).toBeVisible();
    
    // Should show completion message
    await expect(page.locator('text=Import completed successfully')).toBeVisible({ timeout: 30000 });
  });

  test('should validate import data before processing', async ({ page }) => {
    await page.click('text=Custom CSV Import');
    
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/invalid-data.csv');
    
    await page.click('button:has-text("Validate Data")');
    
    // Should show validation errors
    await expect(page.locator('text=Validation Error')).toBeVisible();
    await expect(page.locator('text=Missing required fields')).toBeVisible();
  });
});