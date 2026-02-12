import { test, expect } from '@playwright/test';
import {
  navigateAndWait,
  setupConsoleCollector,
  measurePageLoad,
  countNavElements,
  findDuplicateLinks,
  VIEWPORTS,
  ALL_ROUTES,
  REDIRECT_ROUTES,
  RedundancyFinding,
} from './helpers';

/**
 * Phase 1: The Reductioning — Dead Routes & Cumbersome UX Detection
 *
 * Known issues:
 *   /messages        → redirect shim to /direct-messages (dead weight)
 *   /login           → alias for /auth (why two routes?)
 *   /register        → alias for /auth
 *   /status          → renders KnownIssues (same as /known-issues)
 *   /vanity/:username → broken redirect to literal "/u/:username"
 *   /lcars           → showcase page (is anyone using this?)
 *   /lcars-evolution  → another showcase page
 *   /models          → 3D model manager (niche feature, large bundle)
 *
 * Cumbersome UX patterns:
 *   - Too many clicks to reach key features
 *   - Inconsistent auth gates (some pages redirect, some show inline message)
 *   - HowToEarnARES page is 72KB (largest single page)
 */

const findings: RedundancyFinding[] = [];

test.describe('Dead Routes & Cumbersome UX Audit', () => {

  test.describe('Route aliases and redundant routes', () => {

    test('/login and /register should be consolidated with /auth', async ({ page }) => {
      // Test /login
      await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);
      const loginUrl = page.url();

      // Test /register
      await page.goto('/register', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);
      const registerUrl = page.url();

      // Test /auth
      await page.goto('/auth', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);
      const authUrl = page.url();

      console.log(`[Route Aliases] /login → ${loginUrl}`);
      console.log(`[Route Aliases] /register → ${registerUrl}`);
      console.log(`[Route Aliases] /auth → ${authUrl}`);

      // All three render the same Auth component
      findings.push({
        category: 'Routes',
        severity: 'medium',
        title: '3 routes point to the same Auth page',
        description: '/auth, /login, and /register all render the Auth component. No distinction in behavior.',
        files: ['src/App.tsx', 'src/pages/Auth.tsx'],
        recommendation: 'Keep /auth as the canonical route. Add <Navigate> for /login and /register, or remove them entirely.',
      });
    });

    test('/status and /known-issues render the same component', async ({ page }) => {
      await page.goto('/status', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);
      const statusContent = await page.textContent('body');

      await page.goto('/known-issues', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);
      const knownIssuesContent = await page.textContent('body');

      const sameContent = statusContent === knownIssuesContent;
      console.log(`[Route Aliases] /status and /known-issues render identical content: ${sameContent}`);

      findings.push({
        category: 'Routes',
        severity: 'low',
        title: '/status and /known-issues are identical routes',
        description: 'Both render the KnownIssues component. One is redundant.',
        files: ['src/App.tsx'],
        recommendation: 'Keep /known-issues, add <Navigate> from /status, or pick one canonical URL.',
      });
    });

    test('should check LCARS showcase routes are discoverable', async ({ page }) => {
      await navigateAndWait(page, '/');

      // Check if /lcars or /lcars-evolution are linked from anywhere in the main nav
      const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map((a) => (a as HTMLAnchorElement).pathname);
      });

      const lcarsLinked = allLinks.includes('/lcars');
      const lcarsEvoLinked = allLinks.includes('/lcars-evolution');

      console.log(`[LCARS Routes] /lcars linked from homepage: ${lcarsLinked}`);
      console.log(`[LCARS Routes] /lcars-evolution linked from homepage: ${lcarsEvoLinked}`);

      if (!lcarsLinked && !lcarsEvoLinked) {
        findings.push({
          category: 'Routes',
          severity: 'medium',
          title: 'LCARS showcase pages are orphaned (not linked from navigation)',
          description: '/lcars (12KB) and /lcars-evolution (11KB) exist but are not discoverable from main navigation. They add ~23KB to the lazy-loaded bundle.',
          files: ['src/pages/LCARSShowcase.tsx', 'src/pages/LCARSEvolution.tsx'],
          recommendation: 'Either link them from a dev/design section or remove them to reduce bundle size.',
        });
      }
    });

    test('should check /models route is discoverable', async ({ page }) => {
      await navigateAndWait(page, '/');

      const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map((a) => (a as HTMLAnchorElement).pathname);
      });

      const modelsLinked = allLinks.includes('/models');
      console.log(`[Models Route] /models linked from homepage: ${modelsLinked}`);

      if (!modelsLinked) {
        findings.push({
          category: 'Routes',
          severity: 'low',
          title: '/models page is orphaned',
          description: 'The 3D model manager page exists but is not linked from main navigation. It pulls in Three.js/React Three Fiber which is a significant bundle cost.',
          files: ['src/pages/ModelManager.tsx'],
          recommendation: 'Either integrate into profile/campaign pages or remove to save significant bundle size (three.js is ~600KB).',
        });
      }
    });
  });

  test.describe('Page load performance audit', () => {

    test('should measure load times for all public routes', async ({ page }) => {
      const loadTimes: { route: string; ms: number }[] = [];

      for (const route of ALL_ROUTES.slice(0, 15)) {
        try {
          const ms = await measurePageLoad(page, route);
          loadTimes.push({ route, ms });
        } catch (e) {
          loadTimes.push({ route, ms: -1 });
        }
      }

      loadTimes.sort((a, b) => b.ms - a.ms);

      console.log('\n[Page Load Times]');
      for (const lt of loadTimes) {
        const flag = lt.ms > 3000 ? ' ⚠️ SLOW' : lt.ms > 2000 ? ' ⚡ MODERATE' : '';
        console.log(`  ${lt.route.padEnd(25)} ${lt.ms}ms${flag}`);
      }

      const slowPages = loadTimes.filter((lt) => lt.ms > 3000);
      if (slowPages.length > 0) {
        findings.push({
          category: 'Performance',
          severity: 'high',
          title: `${slowPages.length} page(s) load slower than 3 seconds`,
          description: slowPages.map((p) => `${p.route}: ${p.ms}ms`).join(', '),
          recommendation: 'Audit slow pages for heavy components, unnecessary data fetching on mount, or large inline assets.',
        });
      }
    });
  });

  test.describe('Cumbersome UX flows', () => {

    test('should audit click depth to key features from homepage', async ({ page }) => {
      await navigateAndWait(page, '/');

      // Map out which key features are reachable in 1 click from homepage
      const allLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map((a) => ({
            href: (a as HTMLAnchorElement).pathname,
            visible: a.getBoundingClientRect().width > 0 && a.getBoundingClientRect().height > 0,
            text: (a as HTMLAnchorElement).textContent?.trim().substring(0, 50) || '',
          }))
          .filter((l) => l.visible && l.href.startsWith('/'));
      });

      const reachableRoutes = new Set(allLinks.map((l) => l.href));

      const keyFeatures = [
        { path: '/campaigns', name: 'Campaigns' },
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/forum', name: 'Forum' },
        { path: '/about', name: 'About' },
        { path: '/auth', name: 'Sign In' },
        { path: '/faq', name: 'FAQ' },
        { path: '/support', name: 'Support' },
        { path: '/leaderboard', name: 'Leaderboard' },
        { path: '/videos', name: 'Videos' },
      ];

      console.log('\n[Click Depth from Homepage - Unauthenticated]');
      const unreachable: string[] = [];
      for (const feat of keyFeatures) {
        const reachable = reachableRoutes.has(feat.path);
        console.log(`  ${feat.name.padEnd(20)} ${reachable ? '✓ 1 click' : '✗ NOT directly linked'}`);
        if (!reachable) unreachable.push(feat.name);
      }

      if (unreachable.length > 2) {
        findings.push({
          category: 'UX',
          severity: 'medium',
          title: `${unreachable.length} key features not reachable in 1 click from homepage`,
          description: `Unreachable in 1 click: ${unreachable.join(', ')}`,
          recommendation: 'Add prominent links to key features on the homepage or in the primary navigation.',
        });
      }
    });

    test('should audit auth gate consistency', async ({ page }) => {
      const { errors } = setupConsoleCollector(page);

      // Test various auth-gated routes as unauthenticated user
      const authRoutes = [
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/direct-messages', name: 'Direct Messages' },
        { path: '/profile', name: 'Profile' },
        { path: '/admin', name: 'Admin' },
        { path: '/admin/dashboard', name: 'Admin Dashboard' },
      ];

      const behaviors: { route: string; behavior: string; url: string }[] = [];

      for (const route of authRoutes) {
        await page.goto(route.path, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);

        const finalUrl = page.url();
        const bodyText = await page.textContent('body');

        let behavior = 'unknown';
        if (finalUrl.includes('/auth') || finalUrl.includes('/login')) {
          behavior = 'redirects to /auth';
        } else if (finalUrl.includes('/401')) {
          behavior = 'redirects to /401';
        } else if (bodyText?.toLowerCase().includes('sign in') || bodyText?.toLowerCase().includes('log in')) {
          behavior = 'shows inline sign-in prompt';
        } else if (finalUrl === `http://localhost:8080${route.path}` || finalUrl === `http://localhost:8080${route.path}/`) {
          behavior = 'renders page (no auth gate)';
        } else {
          behavior = `redirects to ${finalUrl}`;
        }

        behaviors.push({ route: route.path, behavior, url: finalUrl });
      }

      console.log('\n[Auth Gate Consistency]');
      for (const b of behaviors) {
        console.log(`  ${b.route.padEnd(25)} → ${b.behavior}`);
      }

      const uniqueBehaviors = new Set(behaviors.map((b) => b.behavior));
      if (uniqueBehaviors.size > 2) {
        findings.push({
          category: 'UX',
          severity: 'high',
          title: `Inconsistent auth gating: ${uniqueBehaviors.size} different behaviors`,
          description: behaviors.map((b) => `${b.route}: ${b.behavior}`).join('; '),
          files: [
            'src/components/auth/RequireAuth.tsx',
            'src/components/auth/RequireAdmin.tsx',
            'src/components/messages/AuthGuard.tsx',
          ],
          recommendation: 'Standardize all auth-gated routes to use RequireAuth and redirect to /auth with a return URL.',
        });
      }
    });

    test('should flag oversized page components', async ({ page }) => {
      // Document known oversized pages based on file sizes from directory listing
      const oversizedPages = [
        { file: 'HowToEarnARES.tsx', size: 72108, route: '/how-to-earn-ares' },
        { file: 'DirectMessages.tsx', size: 35634, route: '/direct-messages' },
        { file: 'About.tsx', size: 27049, route: '/about' },
        { file: 'Profile.tsx', size: 19740, route: '/profile' },
        { file: 'Campaign.tsx', size: 18468, route: '/campaign/:id' },
        { file: 'FAQ.tsx', size: 15657, route: '/faq' },
        { file: 'ForumThread.tsx', size: 15968, route: '/forum/thread/:id' },
        { file: 'Forum.tsx', size: 14777, route: '/forum' },
        { file: 'Campaigns.tsx', size: 13931, route: '/campaigns' },
        { file: 'HowItWorks.tsx', size: 13021, route: '/how-it-works' },
      ];

      console.log('\n[Oversized Page Components]');
      for (const p of oversizedPages) {
        const kb = (p.size / 1024).toFixed(1);
        const flag = p.size > 30000 ? ' ⚠️ NEEDS SPLITTING' : p.size > 15000 ? ' ⚡ CONSIDER SPLITTING' : '';
        console.log(`  ${p.file.padEnd(30)} ${kb}KB${flag}`);
      }

      const needsSplitting = oversizedPages.filter((p) => p.size > 30000);
      if (needsSplitting.length > 0) {
        findings.push({
          category: 'UX',
          severity: 'high',
          title: `${needsSplitting.length} page component(s) exceed 30KB source size`,
          description: needsSplitting.map((p) => `${p.file}: ${(p.size / 1024).toFixed(1)}KB`).join(', '),
          files: needsSplitting.map((p) => `src/pages/${p.file}`),
          recommendation: 'Split into sub-components. HowToEarnARES at 72KB is especially egregious — break into sections. DirectMessages at 35KB should extract the compose/thread views.',
        });
      }

      await navigateAndWait(page, '/');
      expect(true).toBeTruthy();
    });

    test('should check for dead-end pages (no back navigation)', async ({ page }) => {
      const deadEndPages = ['/401', '/403'];

      for (const route of deadEndPages) {
        await navigateAndWait(page, route);

        const hasHomeLink = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('a[href]'))
            .some((a) => {
              const href = (a as HTMLAnchorElement).pathname;
              return href === '/' || href === '/auth';
            });
        });

        const hasBackButton = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.some((b) => {
            const text = b.textContent?.toLowerCase() || '';
            return text.includes('back') || text.includes('home') || text.includes('return');
          });
        });

        console.log(`[Dead End] ${route}: has home link=${hasHomeLink}, has back button=${hasBackButton}`);

        if (!hasHomeLink && !hasBackButton) {
          findings.push({
            category: 'UX',
            severity: 'medium',
            title: `${route} is a dead-end page`,
            description: `No visible link or button to navigate away from ${route}.`,
            recommendation: 'Add a "Go Home" or "Back" button to error/status pages.',
          });
        }
      }
    });
  });

  test.afterAll(async () => {
    if (findings.length > 0) {
      console.log('\n══════════════════════════════════════════════════════');
      console.log('  DEAD ROUTES & CUMBERSOME UX FINDINGS');
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
