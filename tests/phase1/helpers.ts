import { Page, expect, Locator } from '@playwright/test';

// ─── Constants ──────────────────────────────────────────────────────────────
export const BASE_URL = 'http://localhost:8080';

export const ALL_ROUTES = [
  '/',
  '/about',
  '/how-it-works',
  '/how-to-earn-ares',
  '/faq',
  '/support',
  '/terms',
  '/privacy',
  '/auth',
  '/login',
  '/register',
  '/auth/reset-password',
  '/campaigns',
  '/forum',
  '/videos',
  '/leaderboard',
  '/lcars',
  '/lcars-evolution',
  '/models',
  '/known-issues',
  '/status',
  '/401',
  '/403',
] as const;

export const AUTH_ROUTES = [
  '/dashboard',
  '/profile',
  '/direct-messages',
  '/messages',
  '/admin',
] as const;

export const REDIRECT_ROUTES = [
  { from: '/messages', to: '/direct-messages' },
  { from: '/login', to: '/auth' },
  { from: '/register', to: '/auth' },
  { from: '/status', to: '/known-issues' },
] as const;

export const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1920, height: 1080 },
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────
export interface RedundancyFinding {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  files?: string[];
  recommendation: string;
}

export interface PageAuditResult {
  route: string;
  loadTimeMs: number;
  navElementsCount: number;
  duplicateLinksCount: number;
  duplicateLinks: string[];
  overlappingElements: string[];
  consoleErrors: string[];
  consoleWarnings: string[];
  accessibilityIssues: string[];
  screenshotPath?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Navigate to a route and wait for network idle */
export async function navigateAndWait(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'networkidle', timeout: 15000 });
  // Give React time to hydrate
  await page.waitForTimeout(500);
}

/** Count all navigation-like elements on page */
export async function countNavElements(page: Page): Promise<{
  navTags: number;
  navRoles: number;
  linkButtons: number;
  totalLinks: number;
}> {
  return page.evaluate(() => {
    const navTags = document.querySelectorAll('nav').length;
    const navRoles = document.querySelectorAll('[role="navigation"]').length;
    const linkButtons = document.querySelectorAll('a button, button a, a[role="button"]').length;
    const totalLinks = document.querySelectorAll('a[href]').length;
    return { navTags, navRoles, linkButtons, totalLinks };
  });
}

/** Find duplicate href links on the page */
export async function findDuplicateLinks(page: Page): Promise<{ href: string; count: number; texts: string[] }[]> {
  return page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const hrefMap = new Map<string, string[]>();

    for (const link of links) {
      const href = (link as HTMLAnchorElement).href;
      const text = (link as HTMLAnchorElement).textContent?.trim() || '';
      if (!hrefMap.has(href)) {
        hrefMap.set(href, []);
      }
      hrefMap.get(href)!.push(text);
    }

    return Array.from(hrefMap.entries())
      .filter(([_, texts]) => texts.length > 1)
      .map(([href, texts]) => ({
        href: href.replace(window.location.origin, ''),
        count: texts.length,
        texts,
      }));
  });
}

/** Find elements that visually overlap */
export async function findOverlappingFixedElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const fixedEls = Array.from(document.querySelectorAll('*')).filter((el) => {
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' || style.position === 'sticky';
    });

    const overlaps: string[] = [];

    for (let i = 0; i < fixedEls.length; i++) {
      for (let j = i + 1; j < fixedEls.length; j++) {
        const a = fixedEls[i].getBoundingClientRect();
        const b = fixedEls[j].getBoundingClientRect();

        const xOverlap = a.left < b.right && a.right > b.left;
        const yOverlap = a.top < b.bottom && a.bottom > b.top;

        if (xOverlap && yOverlap && a.width > 0 && b.width > 0 && a.height > 0 && b.height > 0) {
          const tagA = `${fixedEls[i].tagName.toLowerCase()}${fixedEls[i].className ? '.' + fixedEls[i].className.toString().split(' ').slice(0, 2).join('.') : ''}`;
          const tagB = `${fixedEls[j].tagName.toLowerCase()}${fixedEls[j].className ? '.' + fixedEls[j].className.toString().split(' ').slice(0, 2).join('.') : ''}`;
          overlaps.push(`${tagA} overlaps ${tagB}`);
        }
      }
    }

    return overlaps;
  });
}

/** Collect console errors and warnings */
export function setupConsoleCollector(page: Page) {
  const errors: string[] = [];
  const warnings: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });

  return { errors, warnings };
}

/** Count visible instances of a specific component pattern */
export async function countVisibleBySelector(page: Page, selector: string): Promise<number> {
  return page.evaluate((sel) => {
    return Array.from(document.querySelectorAll(sel)).filter((el) => {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    }).length;
  }, selector);
}

/** Check if an element is visible at a given viewport */
export async function isVisibleAtViewport(page: Page, selector: string): Promise<boolean> {
  const el = page.locator(selector).first();
  try {
    return await el.isVisible({ timeout: 2000 });
  } catch {
    return false;
  }
}

/** Measure time from navigation start to content visible */
export async function measurePageLoad(page: Page, route: string): Promise<number> {
  const start = Date.now();
  await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(300);
  const elapsed = Date.now() - start;
  return elapsed;
}

/** Get all text content for fuzzy duplicate detection */
export async function getPageTextBlocks(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const blocks: string[] = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const el = node as HTMLElement;
          const tag = el.tagName.toLowerCase();
          if (['section', 'article', 'div', 'main', 'aside'].includes(tag)) {
            const text = el.textContent?.trim() || '';
            if (text.length > 50 && text.length < 5000) {
              return NodeFilter.FILTER_ACCEPT;
            }
          }
          return NodeFilter.FILTER_SKIP;
        },
      }
    );

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = (node as HTMLElement).textContent?.trim() || '';
      if (text) blocks.push(text);
    }
    return blocks;
  });
}

/** Simple text similarity (Jaccard index on word sets) */
export function textSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return intersection.size / union.size;
}

/** Generate a findings report as JSON */
export function generateReport(findings: RedundancyFinding[]): string {
  const grouped = findings.reduce(
    (acc, f) => {
      if (!acc[f.category]) acc[f.category] = [];
      acc[f.category].push(f);
      return acc;
    },
    {} as Record<string, RedundancyFinding[]>
  );

  const summary = {
    totalFindings: findings.length,
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
    categories: grouped,
  };

  return JSON.stringify(summary, null, 2);
}
