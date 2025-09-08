import { test, expect } from '@playwright/test';

// Database integration tests
test.describe('Database Structure and Relationships', () => {
  
  test('should maintain donor uniqueness across campaigns', async ({ page }) => {
    // Login as admin to access database management
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=donors');
    
    // Try to create duplicate donor
    await page.click('button:has-text("Add Donor")');
    
    const duplicateEmail = 'existing.donor@example.com';
    await page.fill('[name="email"]', duplicateEmail);
    await page.fill('[name="firstName"]', 'Duplicate');
    await page.fill('[name="lastName"]', 'User');
    
    await page.click('button:has-text("Save Donor")');
    
    // Should show error about duplicate email
    await expect(page.locator('text=Email already exists')).toBeVisible();
    
    // Should suggest merging with existing record
    await expect(page.locator('text=Merge with existing donor')).toBeVisible();
  });

  test('should allow perks to be assigned to multiple campaigns', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=perks');
    
    // Create a perk
    await page.click('button:has-text("Add Perk")');
    await page.fill('[name="name"]', 'Multi-Campaign Perk');
    await page.fill('[name="description"]', 'This perk can be used in multiple campaigns');
    await page.click('button:has-text("Create Perk")');
    
    // Assign to first campaign
    const perkRow = page.locator(`text=Multi-Campaign Perk`).locator('..').locator('..');
    await perkRow.locator('button:has-text("Assign")').click();
    await page.selectOption('[name="campaignId"]', { index: 1 });
    await page.click('button:has-text("Assign to Campaign")');
    
    // Assign to second campaign
    await perkRow.locator('button:has-text("Assign")').click();
    await page.selectOption('[name="campaignId"]', { index: 2 });
    await page.click('button:has-text("Assign to Campaign")');
    
    // Should show perk is assigned to both campaigns
    await expect(page.locator('text=Assigned to 2 campaigns')).toBeVisible();
  });

  test('should track all donor information by campaign', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=campaigns');
    
    // Select a campaign to view details
    const firstCampaign = page.locator('[data-testid="campaign-row"]').first();
    await firstCampaign.locator('button:has-text("View Details")').click();
    
    // Should show campaign dashboard with donor information
    await expect(page.locator('[data-testid="campaign-donors"]')).toBeVisible();
    
    // Should show donation amounts and perks for each donor
    const donorEntries = page.locator('[data-testid="donor-entry"]');
    const firstDonor = donorEntries.first();
    
    await expect(firstDonor.locator('[data-testid="donor-name"]')).toBeVisible();
    await expect(firstDonor.locator('[data-testid="donation-amount"]')).toBeVisible();
    await expect(firstDonor.locator('[data-testid="donor-perks"]')).toBeVisible();
    await expect(firstDonor.locator('[data-testid="donation-date"]')).toBeVisible();
  });

  test('should maintain referential integrity between donors and pledges', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=donors');
    
    // Try to delete a donor with existing pledges
    const donorWithPledges = page.locator('[data-testid="donor-row"]').first();
    await donorWithPledges.locator('button:has-text("Delete")').click();
    
    // Should show warning about existing pledges
    await expect(page.locator('text=Cannot delete donor with existing pledges')).toBeVisible();
    await expect(page.locator('text=Archive donor instead?')).toBeVisible();
    
    // Test archiving instead of deletion
    await page.click('button:has-text("Archive Donor")');
    
    // Should mark donor as archived but preserve data
    await expect(page.locator('text=Donor archived successfully')).toBeVisible();
  });
});

test.describe('Data Import and Export', () => {
  
  test('should handle Kickstarter data format correctly', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=import');
    
    await page.click('text=Kickstarter Import');
    
    // Should show Kickstarter-specific field mappings
    await expect(page.locator('text=Backer Name')).toBeVisible();
    await expect(page.locator('text=Pledge Amount')).toBeVisible();
    await expect(page.locator('text=Reward Title')).toBeVisible();
    await expect(page.locator('text=Backer Email')).toBeVisible();
    
    // Test field mapping
    await page.selectOption('[name="nameField"]', 'Backer Name');
    await page.selectOption('[name="emailField"]', 'Email');
    await page.selectOption('[name="amountField"]', 'Pledged');
    
    // Should validate mapping before import
    await page.click('button:has-text("Validate Mapping")');
    await expect(page.locator('text=Mapping validated successfully')).toBeVisible();
  });

  test('should handle Indiegogo data format correctly', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=import');
    
    await page.click('text=Indiegogo Import');
    
    // Should show Indiegogo-specific field mappings
    await expect(page.locator('text=Contributor Name')).toBeVisible();
    await expect(page.locator('text=Contribution Amount')).toBeVisible();
    await expect(page.locator('text=Perk Name')).toBeVisible();
    
    // Test different field structure
    await page.selectOption('[name="nameField"]', 'Name');
    await page.selectOption('[name="emailField"]', 'Email');
    await page.selectOption('[name="amountField"]', 'Amount');
  });

  test('should export campaign data in multiple formats', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=campaigns');
    
    // Select a campaign
    const firstCampaign = page.locator('[data-testid="campaign-row"]').first();
    await firstCampaign.locator('button:has-text("Export")').click();
    
    // Should show export options
    await expect(page.locator('text=Export Format')).toBeVisible();
    
    // Test CSV export
    await page.selectOption('[name="exportFormat"]', 'csv');
    await page.check('[name="includeDonorInfo"]');
    await page.check('[name="includePerkDetails"]');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Export")');
    const download = await downloadPromise;
    
    // Should download file with correct name
    expect(download.suggestedFilename()).toMatch(/campaign-.*\.csv$/);
  });
});

test.describe('Perk and Shipping Management', () => {
  
  test('should track shipping status for each perk by donor', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=shipping');
    
    // Should show shipping dashboard
    await expect(page.locator('h2')).toContainText('Shipping Management');
    
    // Should show perks grouped by status
    await expect(page.locator('[data-testid="pending-perks"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipped-perks"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivered-perks"]')).toBeVisible();
    
    // Test bulk status update
    await page.click('button:has-text("Mark Selected as Shipped")');
    
    // Should show bulk shipping form
    await expect(page.locator('text=Bulk Shipping Update')).toBeVisible();
    await page.fill('[name="trackingNumber"]', 'BULK123456');
    await page.fill('[name="carrier"]', 'USPS');
    
    await page.click('button:has-text("Update Shipping Status")');
    
    await expect(page.locator('text=Shipping status updated')).toBeVisible();
  });

  test('should allow filtering perks by campaign and donor', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=shipping');
    
    // Test campaign filter
    await page.selectOption('[name="campaignFilter"]', { index: 1 });
    
    // Should update perk list to show only perks from selected campaign
    const perkItems = page.locator('[data-testid="perk-item"]');
    await expect(perkItems.first()).toBeVisible();
    
    // Test donor search
    await page.fill('[placeholder="Search donor..."]', 'john');
    await page.keyboard.press('Enter');
    
    // Should filter to show only perks for matching donors
    await expect(perkItems.first().locator('text=John')).toBeVisible();
  });

  test('should generate shipping reports', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    await page.goto('/admin/dashboard?section=shipping');
    
    await page.click('button:has-text("Generate Report")');
    
    // Should show report options
    await expect(page.locator('text=Shipping Report')).toBeVisible();
    
    // Configure report
    await page.selectOption('[name="reportType"]', 'pending');
    await page.fill('[name="dateFrom"]', '2024-01-01');
    await page.fill('[name="dateTo"]', '2024-12-31');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate Report")');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/shipping-report-.*\.pdf$/);
  });
});