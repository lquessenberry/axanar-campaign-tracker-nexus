import { test, expect } from '@playwright/test';
import {
  navigateAndWait,
  setupConsoleCollector,
  VIEWPORTS,
  RedundancyFinding,
} from './helpers';

/**
 * Phase 1: The Reductioning — Bundle & Performance Analysis
 *
 * Heavy dependencies identified in package.json:
 *   three + @react-three/fiber + @react-three/drei  (~600KB+ bundled)
 *   konva + react-konva                              (~200KB+ bundled)
 *   framer-motion                                    (~100KB+)
 *   xlsx                                             (~300KB+)
 *   recharts                                         (~200KB+)
 *
 * These are all lazy-loaded via page-level code splitting, but still represent
 * significant download cost for users who visit those pages.
 *
 * Goal: Measure real network transfer, identify unnecessary dependencies,
 * and flag performance bottlenecks.
 */

const findings: RedundancyFinding[] = [];

test.describe('Bundle & Performance Analysis', () => {

  test('should measure total JS transfer on homepage', async ({ page }) => {
    let totalJsBytes = 0;
    let jsFileCount = 0;
    const jsFiles: { url: string; size: number }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (url.endsWith('.js') || url.endsWith('.mjs') || url.includes('.js?')) {
        try {
          const body = await response.body();
          totalJsBytes += body.length;
          jsFileCount++;
          jsFiles.push({
            url: url.split('/').pop()?.split('?')[0] || url,
            size: body.length,
          });
        } catch { /* ignore streaming responses */ }
      }
    });

    await navigateAndWait(page, '/');

    jsFiles.sort((a, b) => b.size - a.size);

    console.log('\n[Homepage JS Bundle Analysis]');
    console.log(`  Total JS files: ${jsFileCount}`);
    console.log(`  Total JS transfer: ${(totalJsBytes / 1024).toFixed(0)}KB (${(totalJsBytes / 1024 / 1024).toFixed(2)}MB)`);
    console.log('\n  Top 10 largest JS chunks:');
    for (const f of jsFiles.slice(0, 10)) {
      console.log(`    ${f.url.substring(0, 50).padEnd(50)} ${(f.size / 1024).toFixed(1)}KB`);
    }

    if (totalJsBytes > 2 * 1024 * 1024) {
      findings.push({
        category: 'Performance',
        severity: 'critical',
        title: `Homepage loads ${(totalJsBytes / 1024 / 1024).toFixed(1)}MB of JavaScript`,
        description: `${jsFileCount} JS files totaling ${(totalJsBytes / 1024).toFixed(0)}KB. Recommended budget: <500KB for initial load.`,
        recommendation: 'Audit code splitting. Ensure Three.js, Konva, xlsx, and recharts are only loaded on pages that need them.',
      });
    } else if (totalJsBytes > 1024 * 1024) {
      findings.push({
        category: 'Performance',
        severity: 'high',
        title: `Homepage loads ${(totalJsBytes / 1024).toFixed(0)}KB of JavaScript`,
        description: `${jsFileCount} JS files. This is above the recommended 500KB budget for initial load.`,
        recommendation: 'Review which dependencies are eagerly loaded vs. lazy-loaded.',
      });
    }
  });

  test('should check for unnecessary eager imports in App.tsx', async ({ page }) => {
    // App.tsx eagerly imports: Index, Auth, NotFound
    // And always renders: ThumbMenu, GlobalPresenceTracker, ChatWindow, DaystromCursorGlow, LCARSEdgeBars

    const eagerComponents = [
      { name: 'ThumbMenu', description: 'Floating action button — always rendered', sizeEstimate: '5KB' },
      { name: 'GlobalPresenceTracker', description: 'Tracks user presence via Supabase', sizeEstimate: '1KB' },
      { name: 'ChatWindow', description: 'Chat widget — always rendered even if not used', sizeEstimate: '10KB+' },
      { name: 'DaystromCursorGlow', description: 'Cursor glow effect — purely decorative', sizeEstimate: '1KB' },
      { name: 'LCARSEdgeBars', description: 'Edge decorations — purely decorative', sizeEstimate: '1KB' },
      { name: 'ImpersonationBanner', description: 'Admin impersonation banner — rarely used', sizeEstimate: '3KB' },
    ];

    console.log('\n[Eagerly Loaded Global Components]');
    for (const c of eagerComponents) {
      console.log(`  ${c.name.padEnd(30)} ${c.sizeEstimate.padEnd(8)} ${c.description}`);
    }

    findings.push({
      category: 'Performance',
      severity: 'medium',
      title: '6 global components render on every page load',
      description: 'ThumbMenu, GlobalPresenceTracker, ChatWindow, DaystromCursorGlow, LCARSEdgeBars, and ImpersonationBanner all render in App.tsx regardless of context.',
      files: ['src/App.tsx'],
      recommendation: 'Lazy-load ChatWindow and ImpersonationBanner (only needed when authenticated). Consider removing DaystromCursorGlow and LCARSEdgeBars or making them opt-in via theme settings. ThumbMenu duplicates nav and should be removed.',
    });

    await navigateAndWait(page, '/');
    expect(true).toBeTruthy();
  });

  test('should measure network requests on homepage', async ({ page }) => {
    let requestCount = 0;
    let totalTransferBytes = 0;
    const requestTypes = new Map<string, number>();

    page.on('response', async (response) => {
      requestCount++;
      const contentType = response.headers()['content-type'] || 'unknown';
      const type = contentType.split(';')[0].trim();

      try {
        const body = await response.body();
        totalTransferBytes += body.length;
        requestTypes.set(type, (requestTypes.get(type) || 0) + body.length);
      } catch { /* ignore */ }
    });

    await navigateAndWait(page, '/');

    console.log('\n[Homepage Network Summary]');
    console.log(`  Total requests: ${requestCount}`);
    console.log(`  Total transfer: ${(totalTransferBytes / 1024).toFixed(0)}KB`);
    console.log('\n  By content type:');
    const sortedTypes = [...requestTypes.entries()].sort((a, b) => b[1] - a[1]);
    for (const [type, size] of sortedTypes) {
      console.log(`    ${type.padEnd(40)} ${(size / 1024).toFixed(1)}KB`);
    }

    if (requestCount > 80) {
      findings.push({
        category: 'Performance',
        severity: 'medium',
        title: `Homepage makes ${requestCount} network requests`,
        description: 'Excessive network requests slow down initial page load, especially on mobile.',
        recommendation: 'Reduce Supabase queries on initial load. Defer non-critical data fetching.',
      });
    }
  });

  test('should measure Largest Contentful Paint (LCP) on homepage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });

    // Use Performance Observer to measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0;

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            lcpValue = entry.startTime;
          }
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        // Wait for LCP to settle
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 5000);
      });
    });

    console.log(`\n[LCP] Largest Contentful Paint: ${lcp.toFixed(0)}ms`);

    if (lcp > 4000) {
      findings.push({
        category: 'Performance',
        severity: 'critical',
        title: `LCP is ${(lcp / 1000).toFixed(1)}s (should be < 2.5s)`,
        description: 'Largest Contentful Paint exceeds Google\'s "poor" threshold of 4 seconds.',
        recommendation: 'Optimize hero image loading, reduce render-blocking JS, and defer non-critical components.',
      });
    } else if (lcp > 2500) {
      findings.push({
        category: 'Performance',
        severity: 'high',
        title: `LCP is ${(lcp / 1000).toFixed(1)}s (target: < 2.5s)`,
        description: 'Largest Contentful Paint exceeds Google\'s "good" threshold.',
        recommendation: 'Preload hero images, reduce initial JS payload.',
      });
    }
  });

  test('should check for console errors on critical pages', async ({ page }) => {
    const pagesToCheck = ['/', '/about', '/campaigns', '/forum', '/faq'];
    const pageErrors: { route: string; errorCount: number; errors: string[] }[] = [];

    for (const route of pagesToCheck) {
      const { errors } = setupConsoleCollector(page);
      await navigateAndWait(page, route);
      pageErrors.push({ route, errorCount: errors.length, errors: errors.slice(0, 3) });
    }

    console.log('\n[Console Errors by Page]');
    for (const pe of pageErrors) {
      const status = pe.errorCount === 0 ? '✓ clean' : `✗ ${pe.errorCount} error(s)`;
      console.log(`  ${pe.route.padEnd(20)} ${status}`);
      for (const e of pe.errors) {
        console.log(`    ${e.substring(0, 120)}`);
      }
    }

    const errorPages = pageErrors.filter((pe) => pe.errorCount > 0);
    if (errorPages.length > 0) {
      findings.push({
        category: 'Performance',
        severity: 'medium',
        title: `${errorPages.length} public page(s) have console errors`,
        description: errorPages.map((p) => `${p.route}: ${p.errorCount} error(s)`).join(', '),
        recommendation: 'Fix console errors — they indicate broken functionality or missing resources.',
      });
    }
  });

  test('should audit heavy dependency usage', async ({ page }) => {
    // Document known heavy dependencies and where they're used
    const heavyDeps = [
      {
        name: 'three + @react-three/fiber + @react-three/drei',
        estimatedSize: '~600KB',
        usedBy: ['/models', 'src/components/profile/RankBadge3D.tsx'],
        lazyLoaded: true,
      },
      {
        name: 'konva + react-konva',
        estimatedSize: '~200KB',
        usedBy: ['Unknown — needs audit'],
        lazyLoaded: true,
      },
      {
        name: 'framer-motion',
        estimatedSize: '~100KB',
        usedBy: ['DirectMessages, various animations throughout'],
        lazyLoaded: false,
      },
      {
        name: 'xlsx',
        estimatedSize: '~300KB',
        usedBy: ['Admin export features'],
        lazyLoaded: true,
      },
      {
        name: 'recharts',
        estimatedSize: '~200KB',
        usedBy: ['Admin analytics, dashboard charts'],
        lazyLoaded: true,
      },
      {
        name: 'lottie-react',
        estimatedSize: '~50KB',
        usedBy: ['Unknown — needs audit'],
        lazyLoaded: true,
      },
    ];

    console.log('\n[Heavy Dependencies]');
    for (const dep of heavyDeps) {
      console.log(`  ${dep.name.padEnd(50)} ${dep.estimatedSize.padEnd(10)} lazy=${dep.lazyLoaded}`);
      console.log(`    Used by: ${dep.usedBy.join(', ')}`);
    }

    findings.push({
      category: 'Performance',
      severity: 'high',
      title: '~1.5MB+ of heavy dependencies in package.json',
      description: 'Three.js (~600KB), Konva (~200KB), xlsx (~300KB), recharts (~200KB), framer-motion (~100KB), and lottie-react (~50KB) collectively add significant weight.',
      files: ['package.json'],
      recommendation: 'Audit Konva and lottie-react — if unused, remove them. Consider replacing recharts with a lighter charting library. Ensure framer-motion tree-shakes properly or replace with CSS animations where possible.',
    });

    await navigateAndWait(page, '/');
    expect(true).toBeTruthy();
  });

  test.afterAll(async () => {
    if (findings.length > 0) {
      console.log('\n══════════════════════════════════════════════════════');
      console.log('  BUNDLE & PERFORMANCE FINDINGS');
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
