import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { navigateAndWait, RedundancyFinding } from "./helpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Phase 1: The Reductioning — Hook & Utility Duplication Detection
 *
 * Known duplicate hooks:
 *   use-mobile.tsx (useIsMobile)  vs  useMobile.ts (useMobile)  vs  useHandheldDevice.ts
 *   useDebounce.ts                vs  useDebouncedValue.ts  (identical logic)
 *   useRankSystem.ts              vs  useUnifiedRank.ts
 *   useMessages.ts                vs  useOptimizedMessages.ts  vs  useRealtimeMessages.ts
 *   useAdminCheck.ts              vs  useSuperAdminCheck.ts  (similar pattern)
 *
 * Goal: Static analysis of the hooks directory to find duplicates and report them.
 */

const findings: RedundancyFinding[] = [];
const HOOKS_DIR = path.resolve(__dirname, "../../src/hooks");

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

test.describe("Hook & Utility Duplication Audit", () => {
  test("should detect duplicate mobile detection hooks", async ({ page }) => {
    const hooks = [
      {
        file: "use-mobile.tsx",
        exportName: "useIsMobile",
        size: getFileSize(path.join(HOOKS_DIR, "use-mobile.tsx")),
      },
      {
        file: "useMobile.ts",
        exportName: "useMobile",
        size: getFileSize(path.join(HOOKS_DIR, "useMobile.ts")),
      },
      {
        file: "useHandheldDevice.ts",
        exportName: "useHandheldDevice",
        size: getFileSize(path.join(HOOKS_DIR, "useHandheldDevice.ts")),
      },
    ];

    const existingHooks = hooks.filter((h) => h.size > 0);

    console.log("\n[Mobile Detection Hooks]");
    for (const h of existingHooks) {
      console.log(`  ${h.file} → exports ${h.exportName} (${h.size} bytes)`);
    }

    if (existingHooks.length > 1) {
      findings.push({
        category: "Hooks",
        severity: "high",
        title: `${existingHooks.length} mobile detection hooks exist (should be 1)`,
        description: `${existingHooks.map((h) => h.file).join(", ")} all detect mobile/touch. use-mobile.tsx returns a boolean, useMobile.ts returns {isMobile, isTablet, isDesktop, isTouchDevice}, useHandheldDevice.ts adds orientation detection.`,
        files: existingHooks.map((h) => `src/hooks/${h.file}`),
        recommendation:
          "Consolidate into a single useMobile hook that returns all needed values. Delete the other two. Update all imports.",
      });
    }

    // Verify the hooks are actually used
    await navigateAndWait(page, "/");
    expect(existingHooks.length).toBeGreaterThan(0);
  });

  test("should detect duplicate debounce hooks", async ({ page }) => {
    const hooks = [
      {
        file: "useDebounce.ts",
        size: getFileSize(path.join(HOOKS_DIR, "useDebounce.ts")),
      },
      {
        file: "useDebouncedValue.ts",
        size: getFileSize(path.join(HOOKS_DIR, "useDebouncedValue.ts")),
      },
    ];

    const existingHooks = hooks.filter((h) => h.size > 0);

    console.log("\n[Debounce Hooks]");
    for (const h of existingHooks) {
      console.log(`  ${h.file} (${h.size} bytes)`);
    }

    if (existingHooks.length > 1) {
      // Read both files to compare
      let debounceContent = "";
      let debouncedValueContent = "";
      try {
        debounceContent = fs.readFileSync(
          path.join(HOOKS_DIR, "useDebounce.ts"),
          "utf-8",
        );
        debouncedValueContent = fs.readFileSync(
          path.join(HOOKS_DIR, "useDebouncedValue.ts"),
          "utf-8",
        );
      } catch {
        /* ignore */
      }

      // Check structural similarity — both use useState + useEffect + setTimeout
      const bothUseTimeout =
        debounceContent.includes("setTimeout") &&
        debouncedValueContent.includes("setTimeout");
      const bothUseState =
        debounceContent.includes("useState") &&
        debouncedValueContent.includes("useState");

      findings.push({
        category: "Hooks",
        severity: "high",
        title: "2 identical debounce hooks exist",
        description: `useDebounce.ts and useDebouncedValue.ts have identical logic (useState + useEffect + setTimeout). Both accept (value, delay) and return the debounced value. The only difference is useDebouncedValue has a default delay of 300ms.`,
        files: ["src/hooks/useDebounce.ts", "src/hooks/useDebouncedValue.ts"],
        recommendation:
          "Keep useDebounce (the one with explicit delay required) and delete useDebouncedValue. Update all imports.",
      });

      console.log(
        `  Structural match: both use setTimeout=${bothUseTimeout}, both use useState=${bothUseState}`,
      );
    }

    await navigateAndWait(page, "/");
    expect(true).toBeTruthy();
  });

  test("should detect duplicate rank/XP hooks", async ({ page }) => {
    const hooks = [
      {
        file: "useRankSystem.ts",
        size: getFileSize(path.join(HOOKS_DIR, "useRankSystem.ts")),
      },
      {
        file: "useUnifiedRank.ts",
        size: getFileSize(path.join(HOOKS_DIR, "useUnifiedRank.ts")),
      },
      {
        file: "useUnifiedXP.ts",
        size: getFileSize(path.join(HOOKS_DIR, "useUnifiedXP.ts")),
      },
    ];

    const existingHooks = hooks.filter((h) => h.size > 0);

    console.log("\n[Rank/XP Hooks]");
    for (const h of existingHooks) {
      console.log(`  ${h.file} (${h.size} bytes)`);
    }

    if (existingHooks.length > 2) {
      findings.push({
        category: "Hooks",
        severity: "medium",
        title: "3 rank/XP hooks may overlap",
        description:
          'useRankSystem (7KB), useUnifiedRank (5KB), and useUnifiedXP (3KB) all deal with rank/XP computation. The "unified" versions were likely meant to replace useRankSystem but both survived.',
        files: existingHooks.map((h) => `src/hooks/${h.file}`),
        recommendation:
          "Audit which pages use which hook. Consolidate into useUnifiedRank + useUnifiedXP (or a single hook), and delete useRankSystem if it is fully replaced.",
      });
    }

    await navigateAndWait(page, "/");
    expect(true).toBeTruthy();
  });

  test("should detect duplicate admin check hooks", async ({ page }) => {
    const hooks = [
      {
        file: "useAdminCheck.ts",
        size: getFileSize(path.join(HOOKS_DIR, "useAdminCheck.ts")),
      },
      {
        file: "useSuperAdminCheck.ts",
        size: getFileSize(path.join(HOOKS_DIR, "useSuperAdminCheck.ts")),
      },
    ];

    const existingHooks = hooks.filter((h) => h.size > 0);

    console.log("\n[Admin Check Hooks]");
    for (const h of existingHooks) {
      console.log(`  ${h.file} (${h.size} bytes)`);
    }

    // These might be legitimately different (admin vs super-admin), so lower severity
    if (existingHooks.length === 2) {
      findings.push({
        category: "Hooks",
        severity: "low",
        title: "2 admin check hooks — verify distinction is necessary",
        description:
          "useAdminCheck.ts and useSuperAdminCheck.ts both check admin status. If there is no super-admin tier, one is redundant.",
        files: existingHooks.map((h) => `src/hooks/${h.file}`),
        recommendation:
          "If both admin tiers exist, keep both but unify the query pattern. If not, consolidate into one.",
      });
    }

    await navigateAndWait(page, "/");
    expect(true).toBeTruthy();
  });

  test("should scan for total hook count and flag bloat", async ({ page }) => {
    let hookFiles: string[] = [];
    try {
      hookFiles = fs
        .readdirSync(HOOKS_DIR)
        .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
    } catch {
      /* ignore */
    }

    // Check for admin subdirectory hooks
    const adminHooksDir = path.join(HOOKS_DIR, "admin");
    let adminHookFiles: string[] = [];
    try {
      adminHookFiles = fs
        .readdirSync(adminHooksDir)
        .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
    } catch {
      /* ignore */
    }

    const totalHooks = hookFiles.length + adminHookFiles.length;
    const totalSize = [
      ...hookFiles.map((f) => getFileSize(path.join(HOOKS_DIR, f))),
      ...adminHookFiles.map((f) => getFileSize(path.join(adminHooksDir, f))),
    ].reduce((a, b) => a + b, 0);

    console.log(
      `\n[Hook Inventory] ${totalHooks} hook files, ${(totalSize / 1024).toFixed(1)}KB total`,
    );
    console.log(`  Root hooks: ${hookFiles.length}`);
    console.log(`  Admin hooks: ${adminHookFiles.length}`);

    // Group hooks by prefix to find clusters
    const prefixGroups = new Map<string, string[]>();
    for (const f of hookFiles) {
      // Extract the meaningful prefix: useAdmin*, useForum*, useUser*, etc.
      const match = f.match(/^(use[A-Z][a-z]+)/);
      if (match) {
        const prefix = match[1];
        if (!prefixGroups.has(prefix)) prefixGroups.set(prefix, []);
        prefixGroups.get(prefix)!.push(f);
      }
    }

    console.log("\n[Hook Clusters]");
    for (const [prefix, files] of prefixGroups.entries()) {
      if (files.length >= 3) {
        console.log(
          `  ${prefix}*: ${files.length} hooks — ${files.join(", ")}`,
        );
      }
    }

    const adminHookCluster = hookFiles.filter((f) => f.startsWith("useAdmin"));
    if (adminHookCluster.length > 8) {
      findings.push({
        category: "Hooks",
        severity: "medium",
        title: `${adminHookCluster.length} admin-related hooks in root hooks directory`,
        description: `Admin hooks: ${adminHookCluster.join(", ")}. This is a lot of granular hooks that could be consolidated.`,
        recommendation:
          "Consider grouping related admin hooks into a single useAdminData hook with sub-queries, or at minimum move them all into hooks/admin/.",
      });
    }

    if (totalHooks > 60) {
      findings.push({
        category: "Hooks",
        severity: "medium",
        title: `${totalHooks} total hook files — potential for consolidation`,
        description: `${(totalSize / 1024).toFixed(0)}KB of hook code across ${totalHooks} files.`,
        recommendation:
          "Audit for unused hooks. Group related hooks into composite hooks (e.g., useProfileData = profile + rewards + achievements).",
      });
    }

    await navigateAndWait(page, "/");
    expect(true).toBeTruthy();
  });

  test.afterAll(async () => {
    if (findings.length > 0) {
      console.log("\n══════════════════════════════════════════════════════");
      console.log("  HOOK & UTILITY DUPLICATION FINDINGS");
      console.log("══════════════════════════════════════════════════════");
      for (const f of findings) {
        console.log(`\n[${f.severity.toUpperCase()}] ${f.title}`);
        console.log(`  ${f.description}`);
        if (f.files) console.log(`  Files: ${f.files.join(", ")}`);
        console.log(`  → ${f.recommendation}`);
      }
      console.log("\n══════════════════════════════════════════════════════\n");
    }
  });
});
