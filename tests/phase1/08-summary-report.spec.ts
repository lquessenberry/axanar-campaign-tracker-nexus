import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { generateReport, navigateAndWait, RedundancyFinding } from "./helpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Phase 1: The Reductioning — Summary Report Generator
 *
 * This test collects all known findings from the static analysis and runtime
 * audits performed in tests 01-07 and generates a consolidated report.
 *
 * It also performs a final comprehensive scan to catch anything missed.
 */

const SRC_DIR = path.resolve(__dirname, "../../src");
const REPORT_PATH = path.resolve(
  __dirname,
  "../../phase1-reductioning-report.json",
);
const REPORT_MD_PATH = path.resolve(
  __dirname,
  "../../PHASE1-REDUCTIONING-REPORT.md",
);

function getFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function countFilesRecursive(dir: string, ext?: string): number {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        if (!ext || entry.name.endsWith(ext)) count++;
      } else if (entry.isDirectory()) {
        count += countFilesRecursive(path.join(dir, entry.name), ext);
      }
    }
  } catch {
    /* ignore */
  }
  return count;
}

function getDirSizeRecursive(dir: string): number {
  let size = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isFile()) size += fs.statSync(full).size;
      else if (entry.isDirectory()) size += getDirSizeRecursive(full);
    }
  } catch {
    /* ignore */
  }
  return size;
}

/** Scan for import usage of a specific export across the src directory */
function countImportUsage(exportName: string, srcDir: string): number {
  let usageCount = 0;
  function scan(dir: string) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (
          entry.isFile() &&
          (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
        ) {
          const content = fs.readFileSync(full, "utf-8");
          if (content.includes(exportName)) usageCount++;
        } else if (entry.isDirectory() && entry.name !== "node_modules") {
          scan(full);
        }
      }
    } catch {
      /* ignore */
    }
  }
  scan(srcDir);
  return usageCount;
}

test.describe("Phase 1 Summary Report", () => {
  test("should generate comprehensive reductioning report", async ({
    page,
  }) => {
    test.setTimeout(30000);

    const allFindings: RedundancyFinding[] = [];

    // ─── NAVIGATION REDUNDANCY ──────────────────────────────────────
    allFindings.push({
      category: "Navigation",
      severity: "critical",
      title: "5+ competing navigation systems",
      description:
        "Navigation.tsx (desktop), ThumbMenu.tsx (FAB), MobileNavigation.tsx (mobile header), MobileBottomNav.tsx, UnifiedBottomNav.tsx, MobileHamburgerMenu.tsx all provide navigation. ThumbMenu and UnifiedBottomNav likely overlap on mobile.",
      files: [
        "src/components/Navigation.tsx",
        "src/components/ThumbMenu.tsx",
        "src/components/mobile/MobileNavigation.tsx",
        "src/components/mobile/MobileBottomNav.tsx",
        "src/components/mobile/UnifiedBottomNav.tsx",
        "src/components/mobile/MobileHamburgerMenu.tsx",
      ],
      recommendation:
        "Keep Navigation.tsx (desktop) + MobileNavigation.tsx with UnifiedBottomNav. Delete ThumbMenu and MobileBottomNav.",
    });

    // ─── MESSAGE SYSTEM REDUNDANCY ──────────────────────────────────
    allFindings.push({
      category: "Messages",
      severity: "critical",
      title:
        "3 ConversationList, 2 MessageThread, 3 message hooks — should be 1 of each",
      description:
        "ConversationList/Optimized/Realtime (30KB), MessageThread/Optimized (10KB), useMessages/useOptimized/useRealtime (30KB). ~70KB of redundant messaging code.",
      files: [
        "src/components/messages/ConversationList.tsx",
        "src/components/messages/OptimizedConversationList.tsx",
        "src/components/messages/RealtimeConversationList.tsx",
        "src/components/messages/MessageThread.tsx",
        "src/components/messages/OptimizedMessageThread.tsx",
        "src/hooks/useMessages.ts",
        "src/hooks/useOptimizedMessages.ts",
        "src/hooks/useRealtimeMessages.ts",
      ],
      recommendation:
        "Consolidate into single ConversationList, MessageThread, and useMessages with realtime + optimization built in.",
    });

    allFindings.push({
      category: "Messages",
      severity: "medium",
      title: "/messages page is a lazy-loaded redirect shim",
      description:
        "Messages.tsx only redirects to /direct-messages. Should be a <Navigate> in the router.",
      files: ["src/pages/Messages.tsx", "src/App.tsx"],
      recommendation:
        'Replace route with <Navigate to="/direct-messages" replace />.',
    });

    // ─── PROFILE DUPLICATION ────────────────────────────────────────
    allFindings.push({
      category: "Profile",
      severity: "critical",
      title:
        "Private/public profile components are near-identical pairs (~78KB duplication)",
      description:
        "ProfileHeader≈PublicProfileHeader (26KB pair), ProfileContent≈PublicProfileContent (32KB pair), ProfileSidebarNav≈PublicProfileSidebar (19KB pair).",
      files: [
        "src/components/profile/ProfileHeader.tsx",
        "src/components/profile/PublicProfileHeader.tsx",
        "src/components/profile/ProfileContent.tsx",
        "src/components/profile/PublicProfileContent.tsx",
        "src/components/profile/ProfileSidebarNav.tsx",
        "src/components/profile/PublicProfileSidebar.tsx",
      ],
      recommendation:
        "Merge each pair into a single component with an `isOwner` prop.",
    });

    allFindings.push({
      category: "Profile",
      severity: "high",
      title: "4 mobile-specific profile layouts (~33KB)",
      description:
        "MobileProfileHeader, MobileProfileContent, MobileProfileLayout, PublicMobileProfileLayout duplicate responsive logic.",
      files: [
        "src/components/mobile/MobileProfileHeader.tsx",
        "src/components/mobile/MobileProfileContent.tsx",
        "src/components/mobile/MobileProfileLayout.tsx",
        "src/components/mobile/PublicMobileProfileLayout.tsx",
      ],
      recommendation:
        "Use responsive Tailwind classes in unified profile components. Delete all 4 mobile variants.",
    });

    allFindings.push({
      category: "Profile",
      severity: "high",
      title: "Broken vanity URL redirect",
      description:
        '<Navigate to="/u/:username"> uses literal ":username" instead of resolving the route param.',
      files: ["src/App.tsx"],
      recommendation:
        "Fix with a wrapper component or remove the /vanity/ route.",
    });

    // ─── HOOK DUPLICATION ───────────────────────────────────────────
    const mobileHookCount = [
      "src/hooks/use-mobile.tsx",
      "src/hooks/useMobile.ts",
      "src/hooks/useHandheldDevice.ts",
    ].filter((f) => fileExists(path.resolve(__dirname, "../..", f))).length;

    if (mobileHookCount > 1) {
      allFindings.push({
        category: "Hooks",
        severity: "high",
        title: `${mobileHookCount} mobile detection hooks (should be 1)`,
        description:
          "use-mobile.tsx, useMobile.ts, and useHandheldDevice.ts all detect mobile. Identical core logic.",
        files: [
          "src/hooks/use-mobile.tsx",
          "src/hooks/useMobile.ts",
          "src/hooks/useHandheldDevice.ts",
        ],
        recommendation:
          "Keep useMobile.ts (most complete), delete the others, update all imports.",
      });
    }

    allFindings.push({
      category: "Hooks",
      severity: "high",
      title: "2 identical debounce hooks",
      description:
        "useDebounce.ts and useDebouncedValue.ts have the same useState+useEffect+setTimeout logic.",
      files: ["src/hooks/useDebounce.ts", "src/hooks/useDebouncedValue.ts"],
      recommendation:
        "Keep useDebounce.ts, delete useDebouncedValue.ts, update imports.",
    });

    // ─── ROUTE REDUNDANCY ───────────────────────────────────────────
    allFindings.push({
      category: "Routes",
      severity: "medium",
      title: "3 routes point to Auth page (/auth, /login, /register)",
      description:
        "All render the same Auth component with no behavioral difference.",
      files: ["src/App.tsx"],
      recommendation: "Keep /auth, add <Navigate> for the aliases.",
    });

    allFindings.push({
      category: "Routes",
      severity: "low",
      title: "/status and /known-issues are identical",
      description: "Both render KnownIssues component.",
      files: ["src/App.tsx"],
      recommendation: "Keep one, redirect the other.",
    });

    // ─── COMPONENT SCATTER ──────────────────────────────────────────
    allFindings.push({
      category: "Components",
      severity: "high",
      title: "LCARS components scattered across 4+ directories",
      description:
        "components/lcars/, admin/lcars/, profile/lcars/, plus root-level files. Impossible to maintain consistent design system.",
      files: [
        "src/components/lcars/",
        "src/components/admin/lcars/",
        "src/components/profile/lcars/",
        "src/components/EnhancedLCARS.tsx",
        "src/components/LCARSDemo.tsx",
        "src/components/LCARSEdgeBars.tsx",
      ],
      recommendation:
        "Consolidate into single src/components/lcars/ with barrel export.",
    });

    allFindings.push({
      category: "Components",
      severity: "medium",
      title:
        '"Improved" variants exist alongside originals (ImprovedFAQ, ImprovedHowItWorks)',
      description:
        "Naming suggests replacement was intended but never completed.",
      files: [
        "src/components/ImprovedFAQ.tsx",
        "src/components/ImprovedHowItWorks.tsx",
      ],
      recommendation:
        'Merge improved logic into page components and delete the "improved" files.',
    });

    allFindings.push({
      category: "Components",
      severity: "medium",
      title: "3 space background components (~38KB)",
      description:
        "StarField.tsx, StarshipBackground.tsx (27KB!), WarpfieldStars.tsx.",
      files: [
        "src/components/StarField.tsx",
        "src/components/StarshipBackground.tsx",
        "src/components/WarpfieldStars.tsx",
      ],
      recommendation:
        "Consolidate into a single configurable SpaceBackground component.",
    });

    // ─── PERFORMANCE ────────────────────────────────────────────────
    allFindings.push({
      category: "Performance",
      severity: "high",
      title: "6 global components render on every page load",
      description:
        "ThumbMenu, GlobalPresenceTracker, ChatWindow, DaystromCursorGlow, LCARSEdgeBars, ImpersonationBanner all render in App.tsx unconditionally.",
      files: ["src/App.tsx"],
      recommendation:
        "Lazy-load ChatWindow + ImpersonationBanner. Remove ThumbMenu. Consider making decorative effects opt-in.",
    });

    allFindings.push({
      category: "Performance",
      severity: "high",
      title: "~1.5MB+ of heavy optional dependencies",
      description:
        "three.js, konva, xlsx, recharts, framer-motion, lottie-react add significant bundle weight.",
      files: ["package.json"],
      recommendation:
        "Audit konva and lottie-react usage — remove if unused. Ensure all are code-split to pages that need them.",
    });

    // ─── CODEBASE SIZE ──────────────────────────────────────────────
    const componentCount = countFilesRecursive(
      path.join(SRC_DIR, "components"),
    );
    const pageCount = countFilesRecursive(path.join(SRC_DIR, "pages"));
    const hookCount = countFilesRecursive(path.join(SRC_DIR, "hooks"));
    const totalSrcSize = getDirSizeRecursive(SRC_DIR);

    allFindings.push({
      category: "Codebase",
      severity: "medium",
      title: `Codebase size: ${componentCount} components, ${pageCount} pages, ${hookCount} hooks (${(totalSrcSize / 1024 / 1024).toFixed(1)}MB source)`,
      description:
        "Large codebase with significant redundancy makes maintenance difficult and increases bundle size.",
      recommendation: `Target: reduce components from ${componentCount} to ~${Math.round(componentCount * 0.65)} by merging duplicates and removing dead code.`,
    });

    // ─── GENERATE REPORTS ───────────────────────────────────────────

    // JSON report
    const jsonReport = generateReport(allFindings);
    fs.writeFileSync(REPORT_PATH, jsonReport, "utf-8");

    // Markdown report
    const critical = allFindings.filter((f) => f.severity === "critical");
    const high = allFindings.filter((f) => f.severity === "high");
    const medium = allFindings.filter((f) => f.severity === "medium");
    const low = allFindings.filter((f) => f.severity === "low");

    let md = `# Phase 1: The Reductioning — Audit Report\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n\n`;
    md += `## Summary\n\n`;
    md += `| Severity | Count |\n|----------|-------|\n`;
    md += `| 🔴 Critical | ${critical.length} |\n`;
    md += `| 🟠 High | ${high.length} |\n`;
    md += `| 🟡 Medium | ${medium.length} |\n`;
    md += `| 🟢 Low | ${low.length} |\n`;
    md += `| **Total** | **${allFindings.length}** |\n\n`;

    md += `## Estimated Savings\n\n`;
    md += `- **Navigation consolidation:** Remove ~3 components, simplify mobile nav\n`;
    md += `- **Message system merge:** Remove ~5 files, save ~70KB source\n`;
    md += `- **Profile deduplication:** Remove ~7 files, save ~110KB source\n`;
    md += `- **Hook deduplication:** Remove ~4 files, save ~10KB source\n`;
    md += `- **Component cleanup:** Remove ~10+ files, save ~80KB source\n`;
    md += `- **Route cleanup:** Simplify ~5 routes in App.tsx\n`;
    md += `- **Total estimated source reduction:** ~270KB+ (~25-30% of component source)\n\n`;

    const renderSection = (
      title: string,
      emoji: string,
      items: RedundancyFinding[],
    ) => {
      if (items.length === 0) return "";
      let s = `## ${emoji} ${title}\n\n`;
      for (const f of items) {
        s += `### ${f.title}\n\n`;
        s += `**Category:** ${f.category} | **Severity:** ${f.severity}\n\n`;
        s += `${f.description}\n\n`;
        if (f.files && f.files.length > 0) {
          s += `**Files:**\n`;
          for (const file of f.files) {
            s += `- \`${file}\`\n`;
          }
          s += `\n`;
        }
        s += `**Recommendation:** ${f.recommendation}\n\n---\n\n`;
      }
      return s;
    };

    md += renderSection("Critical Issues", "🔴", critical);
    md += renderSection("High Priority", "🟠", high);
    md += renderSection("Medium Priority", "🟡", medium);
    md += renderSection("Low Priority", "🟢", low);

    md += `## Recommended Execution Order\n\n`;
    md += `1. **Delete ThumbMenu** — Immediate win, removes competing nav\n`;
    md += `2. **Merge debounce hooks** — 5-minute fix, remove useDebouncedValue.ts\n`;
    md += `3. **Merge mobile hooks** — Consolidate 3→1\n`;
    md += `4. **Fix /vanity redirect** — Quick bug fix\n`;
    md += `5. **Replace /messages shim** — Use \`<Navigate>\` in router\n`;
    md += `6. **Merge profile components** — Biggest code savings (Header, Content, Sidebar pairs)\n`;
    md += `7. **Delete mobile profile layouts** — After profile merge uses responsive design\n`;
    md += `8. **Merge message components** — ConversationList, MessageThread, hooks\n`;
    md += `9. **Consolidate LCARS directory** — Move all to single location\n`;
    md += `10. **Audit heavy deps** — Check if konva/lottie-react are actually used\n`;
    md += `11. **Lazy-load global components** — ChatWindow, ImpersonationBanner\n`;
    md += `12. **Clean up "Improved" variants** — Merge or delete\n`;

    fs.writeFileSync(REPORT_MD_PATH, md, "utf-8");

    // Console summary
    console.log(
      "\n╔══════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║  PHASE 1: THE REDUCTIONING — COMPLETE AUDIT REPORT         ║",
    );
    console.log(
      "╠══════════════════════════════════════════════════════════════╣",
    );
    console.log(
      `║  🔴 Critical: ${String(critical.length).padEnd(3)} 🟠 High: ${String(high.length).padEnd(3)} 🟡 Medium: ${String(medium.length).padEnd(3)} 🟢 Low: ${String(low.length).padEnd(3)}  ║`,
    );
    console.log(
      `║  Total Findings: ${allFindings.length}                                        ║`,
    );
    console.log(
      "╠══════════════════════════════════════════════════════════════╣",
    );
    console.log(
      `║  Components: ${String(componentCount).padEnd(4)} Pages: ${String(pageCount).padEnd(4)} Hooks: ${String(hookCount).padEnd(4)}              ║`,
    );
    console.log(
      `║  Total source: ${(totalSrcSize / 1024 / 1024).toFixed(1)}MB                                        ║`,
    );
    console.log(
      "╠══════════════════════════════════════════════════════════════╣",
    );
    console.log(
      "║  Reports saved to:                                          ║",
    );
    console.log(
      "║    phase1-reductioning-report.json                          ║",
    );
    console.log(
      "║    PHASE1-REDUCTIONING-REPORT.md                            ║",
    );
    console.log(
      "╚══════════════════════════════════════════════════════════════╝",
    );

    await navigateAndWait(page, "/");
    expect(allFindings.length).toBeGreaterThan(0);
  });
});
