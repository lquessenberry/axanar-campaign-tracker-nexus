import { Page, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Admin Impersonation Tutorial — Playwright Screenshot Automation
 *
 * Captures a step-by-step screenshot sequence showing how an admin
 * can impersonate any user on the platform.
 * The resulting images can be compiled into a tutorial video or PDF.
 *
 * Run:  npx playwright test tests/tutorial/impersonation-tutorial.spec.ts --project=chromium
 */

// Configure via env vars: TUTORIAL_BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
const BASE_URL = process.env.TUTORIAL_BASE_URL || "http://localhost:8080";
const SUPABASE_URL = "https://vsarkftwkontkfcodbyk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYXJrZnR3a29udGtmY29kYnlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzgwODksImV4cCI6MjA2MzYxNDA4OX0.gc3Qq6_qXnbkDT77jBX2UZ-Q3A1g6AHR7NlhVQDzVgg";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

const __filename2 = fileURLToPath(import.meta.url);
const __dirname2 = path.dirname(__filename2);
const SCREENSHOT_DIR = path.resolve(__dirname2, "../../tutorial-screenshots");

// Ensure output directory exists
test.beforeAll(async () => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

/** Authenticate via Supabase REST API and inject session into page localStorage */
async function supabaseLogin(page: Page, email: string, password: string) {
  // Call Supabase auth API directly
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase auth failed (${res.status}): ${err}`);
  }

  const session = await res.json();
  console.log(`  ✅ Authenticated as ${email} (user_id: ${session.user?.id})`);

  // Build the storage key Supabase JS client uses
  const storageKey = `sb-vsarkftwkontkfcodbyk-auth-token`;
  const storageValue = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: session.user,
  });

  // Navigate to the app first so localStorage is on the right origin
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // Inject session into localStorage
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key: storageKey, value: storageValue },
  );

  // Dismiss tour so the overlay doesn't block everything
  await page.evaluate(() => {
    localStorage.setItem("axanar-tour-completed", "true");
    localStorage.setItem("axanar-tour-dismissed", "true");
  });

  // Reload so the app picks up the session (and tour is dismissed)
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  return session;
}

/** Helper: take a numbered, annotated screenshot */
async function snap(page: Page, stepNumber: number, name: string) {
  const filename = `${String(stepNumber).padStart(2, "0")}-${name}.png`;
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, filename),
    fullPage: false,
  });
  console.log(`  📸  Step ${stepNumber}: ${name}`);
}

/** Helper: take a full-page screenshot */
async function snapFull(page: Page, stepNumber: number, name: string) {
  const filename = `${String(stepNumber).padStart(2, "0")}-${name}.png`;
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, filename),
    fullPage: true,
  });
  console.log(`  📸  Step ${stepNumber}: ${name} (full page)`);
}

test.describe("Admin Impersonation Tutorial", () => {
  test.use({
    viewport: { width: 1280, height: 800 },
    baseURL: BASE_URL,
  });

  test("capture full impersonation flow screenshots", async ({ page }) => {
    test.setTimeout(180_000); // 3 minutes

    // ─── STEP 1: Landing page (unauthenticated) ────────────────
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await snap(page, 1, "landing-page");

    // ─── STEP 2: Auth page ─────────────────────────────────────
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await snap(page, 2, "auth-login-page");

    // ─── STEP 3: Authenticate via Supabase API ─────────────────
    console.log("  🔑 Authenticating via Supabase REST API...");
    const session = await supabaseLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await snap(page, 3, "authenticated-home");

    // ─── STEP 4: Authenticated profile/dashboard ───────────────
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await snap(page, 4, "admin-profile-dashboard");

    // ─── STEP 5: Navigate to Admin Dashboard ───────────────────
    await page.goto("/admin/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await snap(page, 5, "admin-dashboard");

    // ─── STEP 6: Navigate to God View / Donor management ──────
    await page.goto("/admin/donor");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await snap(page, 6, "admin-god-view");

    // ─── STEP 7: Search for a donor to impersonate ──────────────
    // The God View header has: input[placeholder="Search donors... (⌘K)"]
    const searchInput = page
      .locator(
        'input[aria-label="Search donors"], input[placeholder*="Search donors"]',
      )
      .first();
    const searchTerms = ["peter", "john", "smith", "david", "mike"];
    let foundDonor = false;

    if (await searchInput.isVisible({ timeout: 5000 })) {
      for (const term of searchTerms) {
        await searchInput.click();
        await searchInput.fill(term);
        await page.waitForTimeout(2500);

        const userResult = page.locator('[role="option"]').first();
        if (await userResult.isVisible({ timeout: 3000 }).catch(() => false)) {
          await snap(page, 7, "user-search-results");
          await userResult.click();
          await page.waitForTimeout(3000);
          await snap(page, 8, "user-selected");
          foundDonor = true;
          break;
        }
        console.log(`  ℹ️  No results for "${term}", trying next...`);
      }

      if (!foundDonor) {
        console.log("  ⚠️  No donors found for any search term");
        await snap(page, 7, "user-search-no-results");
      }
    } else {
      console.log("  ⚠️  No search input found on admin/donor page");
      await snap(page, 7, "admin-donor-no-search");
    }

    // ─── STEP 9: Look for "View as User" button ─────────────────
    const viewAsBtn = page.locator('button:has-text("View as User")').first();
    if (await viewAsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await snap(page, 9, "view-as-user-button");
      await viewAsBtn.click();
      await page.waitForTimeout(2000);
      await snap(page, 10, "impersonation-started");

      // ─── Impersonation banner ──────────────────────────────────
      const banner = page.locator(".bg-amber-500").first();
      if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
        await snap(page, 11, "impersonation-banner-visible");
      }

      // ─── Browse as impersonated user ────────────────────────────
      const impersonatedPages = [
        { path: "/profile", name: "impersonated-user-profile" },
        { path: "/forum", name: "impersonated-user-forum" },
        { path: "/direct-messages", name: "impersonated-user-messages" },
        { path: "/campaigns", name: "impersonated-user-campaigns" },
        { path: "/leaderboard", name: "impersonated-user-leaderboard" },
      ];
      let stepNum = 12;
      for (const pg of impersonatedPages) {
        await page.goto(pg.path);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1500);
        await snap(page, stepNum++, pg.name);
      }

      // ─── Exit impersonation ──────────────────────────────────────
      const exitBtn = page.locator('button:has-text("Exit View")').first();
      if (await exitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await snap(page, 17, "exit-view-button");
        await exitBtn.click();
        await page.waitForTimeout(1500);
        await snap(page, 18, "impersonation-ended");
      }
    } else {
      console.log(
        "  ⚠️  'View as User' button not found — donor may not have a linked account",
      );
    }

    // ─── Admin view restored ────────────────────────────────────
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await snap(page, 19, "admin-view-restored");

    // ─── Tour demo ──────────────────────────────────────────────
    // Clear tour state so the auto-tour fires (simulates a new user)
    await page.evaluate(() => {
      localStorage.removeItem("axanar-tour-completed");
      localStorage.removeItem("axanar-tour-dismissed");
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // The auto-tour will fire after 2s for authenticated users
    await page.waitForTimeout(3000);

    // Screenshot the auto-started tour (step 1 should be showing)
    const tourOverlay = page.locator(".react-joyride__overlay");
    if (await tourOverlay.isVisible({ timeout: 5000 }).catch(() => false)) {
      await snap(page, 20, "tour-auto-started-step1");

      // Click Next to advance (these buttons are INSIDE the overlay, so they work)
      const nextBtn = page.locator('button:has-text("Next")').first();
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
        await snap(page, 21, "tour-step-2");

        await nextBtn.click();
        await page.waitForTimeout(1000);
        await snap(page, 22, "tour-step-3");
      }
    } else {
      // Fallback: try clicking tour button with force
      const tourBtn = page.locator('button[title="Take a tour"]');
      if (await tourBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await snap(page, 20, "tour-button-in-nav");
        await tourBtn.click({ force: true });
        await page.waitForTimeout(1500);
        await snap(page, 21, "tour-triggered");
      }
    }

    console.log(`\n✅ Tutorial screenshots saved to: ${SCREENSHOT_DIR}`);
  });
});
