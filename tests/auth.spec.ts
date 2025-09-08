import { test, expect, Page } from '@playwright/test';

// Test data
const testUser = {
  email: 'test.user@example.com',
  password: 'TestPassword123!',
  fullName: 'Test User',
  username: 'testuser'
};

const testDonor = {
  email: 'existing.donor@example.com',
  password: 'DonorPassword123!'
};

test.describe('Authentication Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow new user registration', async ({ page }) => {
    // Navigate to auth page
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/auth');

    // Switch to signup flow
    await page.click('text=Account Lookup');
    
    // TODO: This needs to be implemented - ability to create new account
    await page.fill('[placeholder*="email"]', testUser.email);
    await page.click('button:has-text("Check Email")');
    
    // Should show signup form for new user
    await expect(page.locator('h2')).toContainText('Create Account');
    
    // Fill signup form
    await page.fill('[name="fullName"]', testUser.fullName);
    await page.fill('[name="username"]', testUser.username);
    await page.fill('[name="password"]', testUser.password);
    
    await page.click('button:has-text("Create Account")');
    
    // Should redirect to main page after successful signup
    await expect(page).toHaveURL('/');
    
    // Should show user menu indicating logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should allow existing donor to claim account', async ({ page }) => {
    // Navigate to auth page
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/auth');

    // Switch to account lookup
    await page.click('text=Account Lookup');
    
    // Enter existing donor email
    await page.fill('[placeholder*="email"]', testDonor.email);
    await page.click('button:has-text("Check Email")');
    
    // Should show account recovery/claim flow for existing donor
    await expect(page.locator('text=Account Found')).toBeVisible();
    await expect(page.locator('text=Donor Status')).toBeVisible();
    
    // Should show donor information
    await expect(page.locator('[data-testid="donor-info"]')).toBeVisible();
    
    // Click to claim account
    await page.click('button:has-text("Claim Account")');
    
    // Should show password setup form
    await page.fill('[name="password"]', testDonor.password);
    await page.fill('[name="confirmPassword"]', testDonor.password);
    
    await page.click('button:has-text("Complete Setup")');
    
    // Should redirect to profile with donor information
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('text=Donor Status: Active')).toBeVisible();
  });

  test('should allow user login with valid credentials', async ({ page }) => {
    // Navigate to auth page
    await page.click('text=Sign In');
    
    // Fill login form
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    
    await page.click('button:has-text("Sign In")');
    
    // Should redirect to main page
    await expect(page).toHaveURL('/');
    
    // Should show user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.click('text=Sign In');
    
    await page.fill('[name="email"]', 'invalid@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    
    await page.click('button:has-text("Sign In")');
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    
    // Should stay on auth page
    await expect(page).toHaveURL('/auth');
  });

  test('should redirect authenticated users away from auth page', async ({ page }) => {
    // First log in
    await page.click('text=Sign In');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    
    // Now try to access auth page
    await page.goto('/auth');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
  });
});

test.describe('User Profile Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
  });

  test('should display user profile information', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(testUser.fullName);
    await expect(page.locator('[data-testid="username"]')).toContainText(testUser.username);
    await expect(page.locator('[data-testid="email"]')).toContainText(testUser.email);
    
    // Should show user stats
    await expect(page.locator('[data-testid="campaigns-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-pledged"]')).toBeVisible();
    await expect(page.locator('[data-testid="member-since"]')).toBeVisible();
  });

  test('should allow updating profile information', async ({ page }) => {
    // Click edit button
    await page.click('button:has-text("Edit Profile")');
    
    // Should show edit form
    await expect(page.locator('[name="full_name"]')).toBeVisible();
    
    const newName = 'Updated Test User';
    const newBio = 'This is my updated bio';
    
    // Update fields
    await page.fill('[name="full_name"]', newName);
    await page.fill('[name="bio"]', newBio);
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Should show success message
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    
    // Should show updated information
    await expect(page.locator('h1')).toContainText(newName);
    await expect(page.locator('[data-testid="bio"]')).toContainText(newBio);
  });

  test('should display donation history for donors', async ({ page }) => {
    // This test assumes the user has donation history
    await expect(page.locator('[data-testid="pledge-history"]')).toBeVisible();
    
    // Should show pledge details
    const pledges = page.locator('[data-testid="pledge-item"]');
    await expect(pledges.first()).toBeVisible();
    
    // Each pledge should show campaign, amount, and date
    await expect(pledges.first().locator('[data-testid="campaign-name"]')).toBeVisible();
    await expect(pledges.first().locator('[data-testid="pledge-amount"]')).toBeVisible();
    await expect(pledges.first().locator('[data-testid="pledge-date"]')).toBeVisible();
  });

  test('should display perk status and shipping information', async ({ page }) => {
    // Should show perks section
    await expect(page.locator('[data-testid="perks-section"]')).toBeVisible();
    
    const perks = page.locator('[data-testid="perk-item"]');
    if (await perks.count() > 0) {
      // Should show perk details
      await expect(perks.first().locator('[data-testid="perk-name"]')).toBeVisible();
      await expect(perks.first().locator('[data-testid="perk-status"]')).toBeVisible();
      
      // Should show shipping status
      await expect(perks.first().locator('[data-testid="shipping-status"]')).toBeVisible();
    }
  });
});

test.describe('Address and Contact Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth');
    await page.fill('[name="email"]', testUser.email);
    await page.fill('[name="password"]', testUser.password);
    await page.click('button:has-text("Sign In")');
    await page.goto('/profile');
  });

  test('should allow updating contact information', async ({ page }) => {
    // Navigate to contact settings
    await page.click('text=Contact Information');
    
    const newPhone = '555-123-4567';
    const newAddress = '123 Test Street';
    const newCity = 'Test City';
    
    // Update contact fields
    await page.fill('[name="phone"]', newPhone);
    await page.fill('[name="address1"]', newAddress);
    await page.fill('[name="city"]', newCity);
    await page.fill('[name="state"]', 'CA');
    await page.fill('[name="postal_code"]', '90210');
    
    // Save changes
    await page.click('button:has-text("Save Contact Info")');
    
    // Should show success message
    await expect(page.locator('text=Contact information updated')).toBeVisible();
  });

  test('should validate required fields in contact form', async ({ page }) => {
    await page.click('text=Contact Information');
    
    // Try to save without required fields
    await page.fill('[name="phone"]', '');
    await page.click('button:has-text("Save Contact Info")');
    
    // Should show validation errors
    await expect(page.locator('text=Phone is required')).toBeVisible();
  });
});