import { test, expect } from '@playwright/test';

test.describe('End-to-End User Flows', () => {
  
  test('complete donor journey: registration to profile management', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Fund the Future of Axanar');
    
    // 2. Navigate to registration
    await page.click('text=Sign In');
    await page.click('text=Account Lookup');
    
    // 3. Check for existing donor account
    const donorEmail = 'existing.donor@axanar.com';
    await page.fill('[placeholder*="email"]', donorEmail);
    await page.click('button:has-text("Check Email")');
    
    // 4. Should find existing donor record
    await expect(page.locator('text=Account Found')).toBeVisible();
    await expect(page.locator('text=Donor Status: Active')).toBeVisible();
    
    // 5. Claim account with password setup
    await page.click('button:has-text("Claim Account")');
    
    const password = 'NewPassword123!';
    await page.fill('[name="password"]', password);
    await page.fill('[name="confirmPassword"]', password);
    await page.click('button:has-text("Complete Setup")');
    
    // 6. Should redirect to profile with donor information
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('text=Donor Status: Active')).toBeVisible();
    
    // 7. Verify donor information is displayed
    await expect(page.locator('[data-testid="pledge-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="perks-section"]')).toBeVisible();
    
    // 8. Update profile information
    await page.click('button:has-text("Edit Profile")');
    await page.fill('[name="bio"]', 'Long-time Axanar supporter!');
    await page.click('button:has-text("Save Changes")');
    
    // 9. Update contact information
    await page.click('text=Contact Information');
    await page.fill('[name="phone"]', '555-123-4567');
    await page.fill('[name="address1"]', '123 Starfleet Avenue');
    await page.fill('[name="city"]', 'San Francisco');
    await page.selectOption('[name="state"]', 'CA');
    await page.fill('[name="postal_code"]', '94102');
    await page.click('button:has-text("Save Contact Info")');
    
    // 10. Verify all changes were saved
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    await expect(page.locator('text=Contact information updated')).toBeVisible();
  });

  test('new user registration and account setup', async ({ page }) => {
    // 1. Start registration process
    await page.goto('/auth');
    await page.click('text=Account Lookup');
    
    // 2. Enter email for new user
    const newUserEmail = 'new.user@example.com';
    await page.fill('[placeholder*="email"]', newUserEmail);
    await page.click('button:has-text("Check Email")');
    
    // 3. Should show new user signup flow
    await expect(page.locator('text=Create New Account')).toBeVisible();
    
    // 4. Complete registration
    await page.fill('[name="fullName"]', 'New Axanar Fan');
    await page.fill('[name="username"]', 'newaxanarfan');
    await page.fill('[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Create Account")');
    
    // 5. Should redirect to home page
    await expect(page).toHaveURL('/');
    
    // 6. Navigate to profile
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Profile');
    
    // 7. Should show new user profile (no donor status)
    await expect(page.locator('text=Member Status: User')).toBeVisible();
    await expect(page.locator('text=No pledge history')).toBeVisible();
    
    // 8. Complete profile setup
    await page.click('button:has-text("Edit Profile")');
    await page.fill('[name="bio"]', 'New to Axanar, excited to support!');
    await page.click('button:has-text("Save Changes")');
    
    // 9. Add contact information
    await page.click('text=Contact Information');
    await page.fill('[name="phone"]', '555-987-6543');
    await page.fill('[name="address1"]', '456 Enterprise Drive');
    await page.fill('[name="city]', 'Los Angeles');
    await page.selectOption('[name="state"]', 'CA');
    await page.fill('[name="postal_code"]', '90210');
    await page.click('button:has-text("Save Contact Info")');
  });

  test('admin workflow: donor management to campaign assignment', async ({ page }) => {
    // 1. Login as admin
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    // 2. Navigate to admin dashboard
    await page.goto('/admin/dashboard');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    
    // 3. Go to donor management
    await page.click('text=Donor Management');
    await expect(page.locator('[data-testid="donor-table"]')).toBeVisible();
    
    // 4. Add new donor
    await page.click('button:has-text("Add Donor")');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'Donor');
    await page.fill('[name="email"]', 'test.donor@example.com');
    await page.fill('[name="phone"]', '555-555-5555');
    await page.click('button:has-text("Save Donor")');
    
    // 5. Assign donor to campaign
    const newDonorRow = page.locator('text=test.donor@example.com').locator('..').locator('..');
    await newDonorRow.locator('[type="checkbox"]').check();
    await page.click('button:has-text("Bulk Actions")');
    await page.click('text=Assign to Campaign');
    
    await page.selectOption('[name="campaignId"]', { index: 1 });
    await page.fill('[name="donationAmount"]', '150');
    await page.click('button:has-text("Assign")');
    
    // 6. Assign perks to the donor
    await page.goto('/admin/dashboard?section=perks');
    await page.click('button:has-text("Add Perk")');
    await page.fill('[name="name"]', 'Test Perk for New Donor');
    await page.fill('[name="description"]', 'Special perk for testing');
    await page.fill('[name="value"]', '150');
    await page.click('button:has-text("Create Perk")');
    
    // 7. Assign perk to the donor
    const perkRow = page.locator('text=Test Perk for New Donor').locator('..').locator('..');
    await perkRow.locator('button:has-text("Assign to Donor")').click();
    await page.fill('[placeholder="Search donors..."]', 'test.donor@example.com');
    await page.click('[data-testid="donor-result"]');
    await page.fill('[name="quantity"]', '1');
    await page.click('button:has-text("Assign Perk")');
    
    // 8. Navigate to shipping management
    await page.goto('/admin/dashboard?section=shipping');
    
    // 9. Mark perk as shipped
    const perkItem = page.locator('text=Test Perk for New Donor').locator('..').locator('..');
    await perkItem.locator('button:has-text("Mark Shipped")').click();
    await page.fill('[name="trackingNumber"]', 'TEST123456789');
    await page.selectOption('[name="carrier"]', 'USPS');
    await page.click('button:has-text("Confirm")');
    
    // 10. Verify shipping status update
    await expect(page.locator('text=Perk marked as shipped')).toBeVisible();
    await expect(perkItem.locator('text=Shipped')).toBeVisible();
  });

  test('data import workflow: Kickstarter to donor database', async ({ page }) => {
    // 1. Login as admin
    await page.goto('/auth');
    await page.fill('[name="email"]', 'admin@axanar.com');
    await page.fill('[name="password"]', 'AdminPassword123!');
    await page.click('button:has-text("Sign In")');
    
    // 2. Navigate to import section
    await page.goto('/admin/dashboard?section=import');
    await expect(page.locator('h2')).toContainText('Data Import');
    
    // 3. Select Kickstarter import
    await page.click('text=Kickstarter Import');
    
    // 4. Upload sample data file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/kickstarter-sample.csv');
    
    // 5. Map fields correctly
    await page.selectOption('[name="nameField"]', 'Backer Name');
    await page.selectOption('[name="emailField"]', 'Email');
    await page.selectOption('[name="amountField"]', 'Pledged');
    await page.selectOption('[name="rewardField"]', 'Reward Title');
    await page.selectOption('[name="dateField"]', 'Pledge Date');
    
    // 6. Configure import settings
    await page.check('[name="createMissingDonors"]');
    await page.check('[name="createMissingPerks"]');
    await page.selectOption('[name="campaignId"]', { index: 1 });
    
    // 7. Validate data
    await page.click('button:has-text("Validate Data")');
    await expect(page.locator('text=Validation successful')).toBeVisible();
    
    // 8. Start import
    await page.click('button:has-text("Start Import")');
    await expect(page.locator('text=Importing data...')).toBeVisible();
    
    // 9. Wait for completion
    await expect(page.locator('text=Import completed successfully')).toBeVisible({ timeout: 30000 });
    
    // 10. Verify imported data
    await page.goto('/admin/dashboard?section=donors');
    await expect(page.locator('text=john.doe@example.com')).toBeVisible();
    await expect(page.locator('text=jane.smith@example.com')).toBeVisible();
    
    // 11. Check that perks were created
    await page.goto('/admin/dashboard?section=perks');
    await expect(page.locator('text=Early Bird Special')).toBeVisible();
    await expect(page.locator('text=Producer Package')).toBeVisible();
  });

  test('user experience: from landing page to successful donation tracking', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('/');
    
    // 2. Explore campaigns
    await page.click('text=Explore Campaigns');
    await expect(page).toHaveURL('/campaigns');
    
    // 3. View campaign details
    const firstCampaign = page.locator('[data-testid="campaign-card"]').first();
    await firstCampaign.click();
    
    // 4. Navigate to login to track donation
    await page.click('text=Track My Support');
    await expect(page).toHaveURL('/auth');
    
    // 5. Login as existing donor
    await page.fill('[name="email"]', 'existing.donor@axanar.com');
    await page.fill('[name="password"]', 'ExistingPassword123!');
    await page.click('button:has-text("Sign In")');
    
    // 6. Return to profile to see donation history
    await page.goto('/profile');
    
    // 7. Verify donation tracking
    await expect(page.locator('[data-testid="pledge-history"]')).toBeVisible();
    
    const pledgeItems = page.locator('[data-testid="pledge-item"]');
    await expect(pledgeItems.first()).toBeVisible();
    
    // 8. Check perk status
    await expect(page.locator('[data-testid="perks-section"]')).toBeVisible();
    
    const perkItems = page.locator('[data-testid="perk-item"]');
    if (await perkItems.count() > 0) {
      // Should show shipping status
      await expect(perkItems.first().locator('[data-testid="shipping-status"]')).toBeVisible();
    }
    
    // 9. Update contact info for shipping
    await page.click('text=Contact Information');
    
    // Verify all required fields are available
    await expect(page.locator('[name="address1"]')).toBeVisible();
    await expect(page.locator('[name="city"]')).toBeVisible();
    await expect(page.locator('[name="state"]')).toBeVisible();
    await expect(page.locator('[name="postal_code"]')).toBeVisible();
    await expect(page.locator('[name="phone"]')).toBeVisible();
  });
});