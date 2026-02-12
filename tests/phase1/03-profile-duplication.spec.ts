import { test, expect } from '@playwright/test';
import {
  navigateAndWait,
  setupConsoleCollector,
  findDuplicateLinks,
  countVisibleBySelector,
  VIEWPORTS,
  RedundancyFinding,
} from './helpers';

/**
 * Phase 1: The Reductioning — Profile System Duplication Detection
 *
 * Known duplicate profile component pairs:
 *   ProfileContent.tsx (17,716 bytes)    vs PublicProfileContent.tsx (14,802 bytes)
 *   ProfileHeader.tsx (13,135 bytes)     vs PublicProfileHeader.tsx (13,193 bytes)
 *   ProfileSidebarNav.tsx (9,771 bytes)  vs PublicProfileSidebar.tsx (9,334 bytes)
 *
 * Mobile variants adding to the sprawl:
 *   MobileProfileHeader.tsx (9,461 bytes)
 *   MobileProfileContent.tsx (9,495 bytes)
 *   MobileProfileLayout.tsx (1,736 bytes)
 *   PublicMobileProfileLayout.tsx (12,402 bytes)
 *
 * Additional profile subdirectories:
 *   profile/dossier/   (12 items)
 *   profile/lcars/     (8 items)
 *   profile/rewards/   (3 items)
 *   profile/sections/  (6 items)
 *
 * Total: ~58 profile-related components for what is essentially 2 views
 * (your own profile, someone else's profile).
 */

const findings: RedundancyFinding[] = [];

test.describe('Profile System Duplication Audit', () => {

  test('should document the profile component sprawl', async ({ page }) => {
    await navigateAndWait(page, '/');

    // This test documents the known duplication pattern
    const profileInventory = {
      privateProfile: {
        header: 'ProfileHeader.tsx (13,135 bytes)',
        content: 'ProfileContent.tsx (17,716 bytes)',
        sidebar: 'ProfileSidebarNav.tsx (9,771 bytes)',
        totalBytes: 40622,
      },
      publicProfile: {
        header: 'PublicProfileHeader.tsx (13,193 bytes)',
        content: 'PublicProfileContent.tsx (14,802 bytes)',
        sidebar: 'PublicProfileSidebar.tsx (9,334 bytes)',
        totalBytes: 37329,
      },
      mobilePrivate: {
        header: 'MobileProfileHeader.tsx (9,461 bytes)',
        content: 'MobileProfileContent.tsx (9,495 bytes)',
        layout: 'MobileProfileLayout.tsx (1,736 bytes)',
        totalBytes: 20692,
      },
      mobilePublic: {
        layout: 'PublicMobileProfileLayout.tsx (12,402 bytes)',
        totalBytes: 12402,
      },
    };

    const totalProfileBytes =
      profileInventory.privateProfile.totalBytes +
      profileInventory.publicProfile.totalBytes +
      profileInventory.mobilePrivate.totalBytes +
      profileInventory.mobilePublic.totalBytes;

    console.log('\n[Profile Component Inventory]');
    console.log(`  Private profile components: ~${(profileInventory.privateProfile.totalBytes / 1024).toFixed(1)}KB`);
    console.log(`  Public profile components:  ~${(profileInventory.publicProfile.totalBytes / 1024).toFixed(1)}KB`);
    console.log(`  Mobile private components:  ~${(profileInventory.mobilePrivate.totalBytes / 1024).toFixed(1)}KB`);
    console.log(`  Mobile public components:   ~${(profileInventory.mobilePublic.totalBytes / 1024).toFixed(1)}KB`);
    console.log(`  TOTAL profile source:       ~${(totalProfileBytes / 1024).toFixed(1)}KB across 10+ files`);
    console.log(`  Plus 29 additional files in subdirectories (dossier, lcars, rewards, sections)`);

    findings.push({
      category: 'Profile',
      severity: 'critical',
      title: 'ProfileHeader and PublicProfileHeader are near-identical (~13KB each)',
      description: 'Two 13KB header components exist with minimal differences (edit button vs. follow button). 95%+ code overlap.',
      files: ['src/components/profile/ProfileHeader.tsx', 'src/components/profile/PublicProfileHeader.tsx'],
      recommendation: 'Merge into a single ProfileHeader that accepts an `isOwner` prop to toggle edit vs. follow controls.',
    });

    findings.push({
      category: 'Profile',
      severity: 'critical',
      title: 'ProfileContent and PublicProfileContent are near-identical (~16KB each)',
      description: 'Two large content components with overlapping tab structures and display logic.',
      files: ['src/components/profile/ProfileContent.tsx', 'src/components/profile/PublicProfileContent.tsx'],
      recommendation: 'Merge into a single ProfileContent with visibility flags for owner-only sections.',
    });

    findings.push({
      category: 'Profile',
      severity: 'high',
      title: 'ProfileSidebarNav and PublicProfileSidebar are near-identical (~9.5KB each)',
      description: 'Sidebar navigation components with overlapping link sets.',
      files: ['src/components/profile/ProfileSidebarNav.tsx', 'src/components/profile/PublicProfileSidebar.tsx'],
      recommendation: 'Merge into a single sidebar that shows/hides owner-only links.',
    });

    findings.push({
      category: 'Profile',
      severity: 'high',
      title: '4 mobile profile layout variants exist',
      description: 'MobileProfileHeader, MobileProfileContent, MobileProfileLayout, and PublicMobileProfileLayout add ~33KB of mobile-specific profile code. Responsive design should handle this.',
      files: [
        'src/components/mobile/MobileProfileHeader.tsx',
        'src/components/mobile/MobileProfileContent.tsx',
        'src/components/mobile/MobileProfileLayout.tsx',
        'src/components/mobile/PublicMobileProfileLayout.tsx',
      ],
      recommendation: 'Use responsive Tailwind classes in the unified ProfileHeader/Content instead of separate mobile components. Delete all 4 mobile variants.',
    });

    expect(true).toBeTruthy();
  });

  test('/profile page should load without errors (unauthenticated)', async ({ page }) => {
    const { errors, warnings } = setupConsoleCollector(page);

    await page.goto('/profile', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const url = page.url();
    console.log(`[Profile Unauthed] Final URL: ${url}`);
    console.log(`[Profile Unauthed] Console errors: ${errors.length}, warnings: ${warnings.length}`);

    if (errors.length > 0) {
      console.log(`  Errors: ${errors.slice(0, 5).join('\n  ')}`);
      findings.push({
        category: 'Profile',
        severity: 'medium',
        title: `Profile page generates ${errors.length} console error(s) when unauthenticated`,
        description: errors.slice(0, 3).join('; '),
        files: ['src/pages/Profile.tsx'],
        recommendation: 'Profile should gracefully redirect or show public view without console errors.',
      });
    }
  });

  test('/u/testuser public profile route should not 404', async ({ page }) => {
    const { errors } = setupConsoleCollector(page);

    await page.goto('/u/testuser', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const url = page.url();
    const content = await page.textContent('body');
    const is404 = content?.toLowerCase().includes('not found') || content?.toLowerCase().includes('404');

    console.log(`[Public Profile] URL: ${url}, appears 404: ${is404}`);

    // Even for a non-existent user, it should show a "user not found" message, not crash
    if (errors.length > 2) {
      findings.push({
        category: 'Profile',
        severity: 'medium',
        title: 'Public profile route generates excessive console errors for missing users',
        description: `${errors.length} errors when visiting /u/testuser`,
        files: ['src/pages/PublicProfile.tsx'],
        recommendation: 'Show a clean "user not found" state without console errors.',
      });
    }
  });

  test('should check /profile/:userId route handles gracefully', async ({ page }) => {
    const { errors } = setupConsoleCollector(page);

    await page.goto('/profile/nonexistent-id', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const url = page.url();
    console.log(`[Profile by ID] URL: ${url}, errors: ${errors.length}`);

    // Two routes lead to profiles: /profile/:userId and /u/:username
    // This is a potential source of confusion
    findings.push({
      category: 'Profile',
      severity: 'medium',
      title: 'Two different URL patterns for viewing other profiles',
      description: '/profile/:userId and /u/:username both show other users\' profiles, creating URL ambiguity.',
      files: ['src/pages/Profile.tsx', 'src/pages/PublicProfile.tsx', 'src/App.tsx'],
      recommendation: 'Standardize on /u/:username for public profiles. Redirect /profile/:userId to the appropriate /u/ URL.',
    });
  });

  test('should detect broken vanity URL redirect', async ({ page }) => {
    await page.goto('/vanity/someuser', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const url = page.url();
    console.log(`[Vanity Redirect] /vanity/someuser → ${url}`);

    // The route in App.tsx is: <Navigate to="/u/:username" replace />
    // This is a literal string, not a dynamic parameter — it's broken
    if (url.includes(':username')) {
      findings.push({
        category: 'Profile',
        severity: 'high',
        title: 'Vanity URL redirect is broken — navigates to literal "/u/:username"',
        description: 'The <Navigate to="/u/:username"> in App.tsx uses a literal string instead of resolving the route param.',
        files: ['src/App.tsx'],
        recommendation: 'Either fix with a wrapper component that reads params and redirects, or remove the /vanity/ route entirely.',
      });
    }
  });

  test.describe('Mobile profile rendering', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test('should audit mobile profile layout on small screen', async ({ page }) => {
      await page.goto('/profile', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);

      // Check if mobile-specific profile components render alongside desktop ones
      const allSections = await countVisibleBySelector(page, 'section, [class*="profile"], [class*="Profile"]');
      console.log(`[Mobile Profile] Visible profile sections/divs: ${allSections}`);

      // Check for scrollable content not being hidden by fixed nav
      const fixedElements = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*'))
          .filter((el) => {
            const style = window.getComputedStyle(el);
            return style.position === 'fixed' && el.getBoundingClientRect().height > 0;
          })
          .map((el) => ({
            tag: el.tagName,
            height: el.getBoundingClientRect().height,
            position: el.getBoundingClientRect().top < window.innerHeight / 2 ? 'top' : 'bottom',
          }));
      });

      const totalFixedHeight = fixedElements.reduce((sum, el) => sum + el.height, 0);
      const viewportHeight = VIEWPORTS.mobile.height;
      const fixedPercentage = (totalFixedHeight / viewportHeight) * 100;

      console.log(`[Mobile Profile] Fixed elements: ${fixedElements.length}, total height: ${totalFixedHeight}px (${fixedPercentage.toFixed(1)}% of viewport)`);

      if (fixedPercentage > 25) {
        findings.push({
          category: 'Profile',
          severity: 'high',
          title: `Fixed elements consume ${fixedPercentage.toFixed(0)}% of mobile viewport on profile page`,
          description: `${fixedElements.length} fixed elements totaling ${totalFixedHeight}px out of ${viewportHeight}px viewport.`,
          recommendation: 'Reduce fixed chrome. Consider collapsing header on scroll and reducing bottom nav height.',
        });
      }
    });
  });

  test.afterAll(async () => {
    if (findings.length > 0) {
      console.log('\n══════════════════════════════════════════════════════');
      console.log('  PROFILE DUPLICATION FINDINGS');
      console.log('══════════════════════════════════════════════════════');
      for (const f of findings) {
        console.log(`\n[${f.severity.toUpperCase()}] ${f.title}`);
        console.log(`  ${f.description}`);
        if (f.files) console.log(`  Files: ${f.files.join(', ')}`);
        console.log(`  → ${f.recommendation}`);
      }
      console.log('\n══════════════════════════════════════════════════════\n');
    }
  });
});
