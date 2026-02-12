import { test, expect } from '@playwright/test';
import {
  navigateAndWait,
  countNavElements,
  findDuplicateLinks,
  findOverlappingFixedElements,
  setupConsoleCollector,
  countVisibleBySelector,
  isVisibleAtViewport,
  VIEWPORTS,
  ALL_ROUTES,
  RedundancyFinding,
} from './helpers';

/**
 * Phase 1: The Reductioning — Navigation Redundancy Detection
 *
 * Known competing navigation systems:
 *   1. Navigation.tsx          – Desktop top nav + delegates to MobileNavigation
 *   2. ThumbMenu.tsx           – Floating action button (FAB), always in App.tsx
 *   3. MobileNavigation.tsx    – Mobile header + hamburger + UnifiedBottomNav
 *   4. MobileBottomNav.tsx     – Alternate bottom nav (auth-only)
 *   5. UnifiedBottomNav.tsx    – LCARS-styled bottom nav (used by MobileNavigation)
 *   6. MobileHamburgerMenu.tsx – Full slide-out drawer
 *   7. Footer.tsx              – Footer links (duplicate nav targets)
 *
 * Goal: Detect which systems render simultaneously, where links duplicate,
 * and where fixed/sticky elements overlap.
 */

const findings: RedundancyFinding[] = [];

test.describe('Navigation Redundancy Audit', () => {
  test.describe('Desktop viewport', () => {
    test.use({ viewport: VIEWPORTS.desktop });

    test('should not render mobile nav elements on desktop', async ({ page }) => {
      await navigateAndWait(page, '/');

      // ThumbMenu FAB — renders for all viewports in App.tsx but should be mobile-only
      const fabVisible = await isVisibleAtViewport(page, '.fixed.bottom-20.right-6');
      // MobileNavigation header
      const mobileHeaderVisible = await page.locator('header.md\\:hidden').isVisible().catch(() => false);
      // UnifiedBottomNav
      const bottomNavVisible = await page.locator('nav.md\\:hidden').first().isVisible().catch(() => false);

      // Record findings
      if (fabVisible) {
        findings.push({
          category: 'Navigation',
          severity: 'high',
          title: 'ThumbMenu FAB visible on desktop',
          description: 'The floating action button (ThumbMenu) renders on desktop where the full top nav already exists. This is redundant.',
          files: ['src/components/ThumbMenu.tsx', 'src/App.tsx'],
          recommendation: 'Hide ThumbMenu on md+ viewports or remove it entirely since desktop nav covers all links.',
        });
      }

      // Log for visibility
      console.log(`[Desktop] FAB visible: ${fabVisible}, Mobile header: ${mobileHeaderVisible}, Bottom nav: ${bottomNavVisible}`);

      // Desktop nav should be present
      const desktopNav = await page.locator('nav.hidden.md\\:block').first().isVisible().catch(() => false);
      expect(desktopNav).toBeTruthy();
    });

    test('should count nav elements and detect excessive navigation', async ({ page }) => {
      await navigateAndWait(page, '/');
      const counts = await countNavElements(page);

      console.log(`[Desktop Nav Counts] <nav>: ${counts.navTags}, [role=navigation]: ${counts.navRoles}, link-buttons: ${counts.linkButtons}, total links: ${counts.totalLinks}`);

      // Flag if more than 3 <nav> elements exist (desktop + auth bar is 2 max expected)
      if (counts.navTags > 3) {
        findings.push({
          category: 'Navigation',
          severity: 'medium',
          title: `Excessive <nav> elements: ${counts.navTags} found`,
          description: 'Multiple <nav> elements create accessibility confusion for screen readers.',
          recommendation: 'Consolidate navigation into a single <nav> with labeled regions.',
        });
      }
    });

    test('should detect duplicate link targets in desktop nav', async ({ page }) => {
      await navigateAndWait(page, '/');
      const dupes = await findDuplicateLinks(page);
      const significantDupes = dupes.filter((d) => d.count >= 3 && !d.href.startsWith('#'));

      console.log(`[Desktop Duplicate Links] ${dupes.length} href(s) appear more than once`);
      for (const d of significantDupes) {
        console.log(`  "${d.href}" appears ${d.count}x with texts: ${d.texts.join(' | ')}`);
      }

      if (significantDupes.length > 0) {
        findings.push({
          category: 'Navigation',
          severity: 'high',
          title: `${significantDupes.length} links appear 3+ times on homepage`,
          description: significantDupes.map((d) => `"${d.href}" × ${d.count}`).join('; '),
          recommendation: 'Consolidate duplicate links. Users should not see the same destination in nav, footer, and CTA simultaneously.',
        });
      }
    });

    test('should detect overlapping fixed/sticky elements', async ({ page }) => {
      await navigateAndWait(page, '/');
      const overlaps = await findOverlappingFixedElements(page);

      console.log(`[Desktop Overlaps] ${overlaps.length} overlapping fixed/sticky pairs`);
      for (const o of overlaps) {
        console.log(`  ${o}`);
      }

      if (overlaps.length > 5) {
        findings.push({
          category: 'Navigation',
          severity: 'medium',
          title: `${overlaps.length} overlapping fixed/sticky element pairs`,
          description: 'Too many fixed-position elements compete for screen real estate.',
          recommendation: 'Reduce fixed elements to one top nav and one optional FAB.',
        });
      }
    });
  });

  test.describe('Mobile viewport', () => {
    test.use({ viewport: VIEWPORTS.mobile });

    test('should not render desktop nav on mobile', async ({ page }) => {
      await navigateAndWait(page, '/');

      // Desktop nav has class "hidden md:block"
      const desktopNavVisible = await page.locator('nav.hidden.md\\:block').isVisible().catch(() => false);

      expect(desktopNavVisible).toBeFalsy();
    });

    test('should detect competing mobile navigation systems', async ({ page }) => {
      await navigateAndWait(page, '/');

      // Count all visible navigation-like elements on mobile
      const mobileHeader = await isVisibleAtViewport(page, 'header');
      const bottomNavs = await countVisibleBySelector(page, '[class*="fixed"][class*="bottom"]');
      const fabButton = await isVisibleAtViewport(page, '.fixed.bottom-20.right-6');

      console.log(`[Mobile Nav] Header: ${mobileHeader}, Bottom navs: ${bottomNavs}, FAB: ${fabButton}`);

      // On mobile we should have exactly: 1 header + 1 bottom nav OR 1 FAB, not both
      if (bottomNavs > 0 && fabButton) {
        findings.push({
          category: 'Navigation',
          severity: 'critical',
          title: 'Both bottom nav AND floating FAB visible on mobile',
          description: 'UnifiedBottomNav and ThumbMenu both render as fixed-bottom elements, competing for thumb zone.',
          files: ['src/components/ThumbMenu.tsx', 'src/components/mobile/UnifiedBottomNav.tsx'],
          recommendation: 'Remove ThumbMenu entirely — UnifiedBottomNav already provides the same links in a cleaner format.',
        });
      }

      if (bottomNavs > 1) {
        findings.push({
          category: 'Navigation',
          severity: 'critical',
          title: `${bottomNavs} bottom navigation bars visible simultaneously`,
          description: 'MobileBottomNav and UnifiedBottomNav may both be rendering.',
          files: ['src/components/mobile/MobileBottomNav.tsx', 'src/components/mobile/UnifiedBottomNav.tsx'],
          recommendation: 'Keep only UnifiedBottomNav; delete MobileBottomNav.',
        });
      }
    });

    test('should check hamburger menu opens and has correct links', async ({ page }) => {
      await navigateAndWait(page, '/');

      // Find the hamburger button
      const hamburgerBtn = page.locator('header button').first();
      await expect(hamburgerBtn).toBeVisible();
      await hamburgerBtn.click();

      // Wait for menu to open
      await page.waitForTimeout(500);

      // Count links in the hamburger menu overlay
      const menuLinks = await page.evaluate(() => {
        // Look for the slide-out menu (fixed overlay)
        const overlays = document.querySelectorAll('[class*="fixed"][class*="inset"], [class*="fixed"][class*="left-0"]');
        let linkCount = 0;
        const hrefs: string[] = [];
        overlays.forEach((overlay) => {
          const links = overlay.querySelectorAll('a[href]');
          links.forEach((l) => {
            linkCount++;
            hrefs.push((l as HTMLAnchorElement).pathname);
          });
        });
        return { linkCount, hrefs };
      });

      console.log(`[Mobile Hamburger] ${menuLinks.linkCount} links: ${menuLinks.hrefs.join(', ')}`);

      // Close menu
      await page.keyboard.press('Escape');
    });

    test('should verify consistent link targets between mobile and desktop nav', async ({ page }) => {
      // Collect mobile nav links
      await page.setViewportSize(VIEWPORTS.mobile);
      await navigateAndWait(page, '/');

      // Open hamburger
      const hamburgerBtn = page.locator('header button').first();
      if (await hamburgerBtn.isVisible()) {
        await hamburgerBtn.click();
        await page.waitForTimeout(500);
      }

      const mobileLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map((a) => (a as HTMLAnchorElement).pathname)
          .filter((p) => p.startsWith('/'));
      });

      // Close any overlay
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Switch to desktop
      await page.setViewportSize(VIEWPORTS.desktop);
      await navigateAndWait(page, '/');

      const desktopLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map((a) => (a as HTMLAnchorElement).pathname)
          .filter((p) => p.startsWith('/'));
      });

      const mobileSet = new Set(mobileLinks);
      const desktopSet = new Set(desktopLinks);

      const onlyMobile = [...mobileSet].filter((l) => !desktopSet.has(l));
      const onlyDesktop = [...desktopSet].filter((l) => !mobileSet.has(l));

      console.log(`[Nav Parity] Desktop-only: ${onlyDesktop.join(', ') || 'none'}`);
      console.log(`[Nav Parity] Mobile-only: ${onlyMobile.join(', ') || 'none'}`);

      if (onlyDesktop.length > 3 || onlyMobile.length > 3) {
        findings.push({
          category: 'Navigation',
          severity: 'medium',
          title: 'Mobile/desktop nav link mismatch',
          description: `Desktop-only links: ${onlyDesktop.join(', ')}. Mobile-only links: ${onlyMobile.join(', ')}`,
          recommendation: 'Ensure feature parity between mobile and desktop navigation.',
        });
      }
    });
  });

  test.describe('Tablet viewport', () => {
    test.use({ viewport: VIEWPORTS.tablet });

    test('should have clean navigation at tablet breakpoint', async ({ page }) => {
      await navigateAndWait(page, '/');

      const desktopNav = await page.locator('nav.hidden.md\\:block').isVisible().catch(() => false);
      const mobileHeader = await page.locator('header.md\\:hidden').isVisible().catch(() => false);
      const fab = await isVisibleAtViewport(page, '.fixed.bottom-20.right-6');
      const bottomNavCount = await countVisibleBySelector(page, '[class*="fixed"][class*="bottom"]');

      console.log(`[Tablet] Desktop nav: ${desktopNav}, Mobile header: ${mobileHeader}, FAB: ${fab}, Bottom navs: ${bottomNavCount}`);

      // At 768px we should see exactly one navigation system
      if (desktopNav && mobileHeader) {
        findings.push({
          category: 'Navigation',
          severity: 'high',
          title: 'Both desktop and mobile nav visible at tablet width',
          description: 'At 768px breakpoint, both navigation systems render.',
          recommendation: 'Fix CSS breakpoints so only one nav system is active per viewport.',
        });
      }
    });
  });

  test.afterAll(async () => {
    if (findings.length > 0) {
      console.log('\n══════════════════════════════════════════════════════');
      console.log('  NAVIGATION REDUNDANCY FINDINGS');
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
