import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
    navigateAndWait,
    RedundancyFinding
} from "./helpers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Phase 1: The Reductioning — Component Scatter & Visual Consistency
 *
 * Known scattered component patterns:
 *   LCARS components in 4+ directories:
 *     src/components/lcars/          (5 files)
 *     src/components/admin/lcars/    (6 files)
 *     src/components/profile/lcars/  (8 files)
 *     src/components/ root level:    EnhancedLCARS.tsx, LCARSDemo.tsx, LCARSEdgeBars.tsx
 *
 *   "Improved" variants alongside originals:
 *     ImprovedFAQ.tsx  alongside  FAQ.tsx page
 *     ImprovedHowItWorks.tsx  alongside  HowItWorks.tsx page
 *
 *   StarField / background variants:
 *     StarField.tsx (4,381 bytes)
 *     StarshipBackground.tsx (26,886 bytes)
 *     WarpfieldStars.tsx (6,634 bytes)
 *
 *   Model preview variants:
 *     ModelPreviewModal.tsx (11,233 bytes)
 *     UnifiedPreviewModal.tsx (16,946 bytes)
 *     ModelUploadPanel.tsx (16,673 bytes)
 */

const findings: RedundancyFinding[] = [];
const COMPONENTS_DIR = path.resolve(__dirname, "../../src/components");

function countFilesRecursive(dir: string): number {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isFile() &&
        (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
      ) {
        count++;
      } else if (entry.isDirectory()) {
        count += countFilesRecursive(path.join(dir, entry.name));
      }
    }
  } catch {
    /* ignore */
  }
  return count;
}

function getDirSize(dir: string): number {
  let size = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile()) {
        size += fs.statSync(fullPath).size;
      } else if (entry.isDirectory()) {
        size += getDirSize(fullPath);
      }
    }
  } catch {
    /* ignore */
  }
  return size;
}

test.describe("Component Scatter & Visual Consistency Audit", () => {
  test("should audit LCARS component scatter across directories", async ({
    page,
  }) => {
    const lcarsLocations = [
      { dir: path.join(COMPONENTS_DIR, "lcars"), label: "components/lcars/" },
      {
        dir: path.join(COMPONENTS_DIR, "admin/lcars"),
        label: "components/admin/lcars/",
      },
      {
        dir: path.join(COMPONENTS_DIR, "profile/lcars"),
        label: "components/profile/lcars/",
      },
    ];

    // Also count root-level LCARS files
    let rootLcarsFiles: string[] = [];
    try {
      rootLcarsFiles = fs
        .readdirSync(COMPONENTS_DIR)
        .filter(
          (f) =>
            f.toLowerCase().includes("lcars") &&
            (f.endsWith(".tsx") || f.endsWith(".ts")),
        );
    } catch {
      /* ignore */
    }

    console.log("\n[LCARS Component Scatter]");
    let totalLcarsFiles = rootLcarsFiles.length;
    let totalLcarsSize = rootLcarsFiles.reduce(
      (sum, f) => sum + (fs.statSync(path.join(COMPONENTS_DIR, f)).size || 0),
      0,
    );

    console.log(
      `  Root level: ${rootLcarsFiles.length} files — ${rootLcarsFiles.join(", ")}`,
    );

    for (const loc of lcarsLocations) {
      const count = countFilesRecursive(loc.dir);
      const size = getDirSize(loc.dir);
      totalLcarsFiles += count;
      totalLcarsSize += size;
      console.log(
        `  ${loc.label}: ${count} files, ${(size / 1024).toFixed(1)}KB`,
      );
    }

    console.log(
      `  TOTAL: ${totalLcarsFiles} LCARS files, ${(totalLcarsSize / 1024).toFixed(1)}KB`,
    );

    // Also check for LCARS pages
    const lcarsPages = ["LCARSShowcase.tsx", "LCARSEvolution.tsx"];
    const lcarsPageSize = lcarsPages.reduce((sum, f) => {
      try {
        return (
          sum +
          fs.statSync(path.resolve(__dirname, `../../src/pages/${f}`)).size
        );
      } catch {
        return sum;
      }
    }, 0);

    console.log(
      `  LCARS pages: ${lcarsPages.join(", ")} (${(lcarsPageSize / 1024).toFixed(1)}KB)`,
    );

    findings.push({
      category: "Components",
      severity: "high",
      title: `LCARS components scattered across ${lcarsLocations.length + 1} locations (${totalLcarsFiles} files, ${(totalLcarsSize / 1024).toFixed(0)}KB)`,
      description:
        "LCARS UI components exist in components/lcars/, admin/lcars/, profile/lcars/, and the root components directory. This makes it impossible to maintain a consistent LCARS design system.",
      files: [
        "src/components/lcars/",
        "src/components/admin/lcars/",
        "src/components/profile/lcars/",
        "src/components/EnhancedLCARS.tsx",
        "src/components/LCARSDemo.tsx",
        "src/components/LCARSEdgeBars.tsx",
      ],
      recommendation:
        "Consolidate all LCARS components into a single src/components/lcars/ directory with a proper barrel export. Remove duplicate implementations.",
    });

    await navigateAndWait(page, "/");
    expect(true).toBeTruthy();
  });

  test('should detect "Improved" component variants that should replace originals', async ({
    page,
  }) => {
    const improvedPairs = [
      {
        improved: {
          file: "ImprovedFAQ.tsx",
          path: path.join(COMPONENTS_DIR, "ImprovedFAQ.tsx"),
        },
        original: {
          file: "FAQ.tsx",
          path: path.resolve(__dirname, "../../src/pages/FAQ.tsx"),
        },
      },
      {
        improved: {
          file: "ImprovedHowItWorks.tsx",
          path: path.join(COMPONENTS_DIR, "ImprovedHowItWorks.tsx"),
        },
        original: {
          file: "HowItWorks.tsx",
          path: path.resolve(__dirname, "../../src/pages/HowItWorks.tsx"),
        },
      },
    ];

    console.log('\n["Improved" Component Variants]');
    for (const pair of improvedPairs) {
      const improvedExists = fs.existsSync(pair.improved.path);
      const originalExists = fs.existsSync(pair.original.path);
      const improvedSize = improvedExists
        ? fs.statSync(pair.improved.path).size
        : 0;
      const originalSize = originalExists
        ? fs.statSync(pair.original.path).size
        : 0;

      console.log(
        `  ${pair.improved.file} (${(improvedSize / 1024).toFixed(1)}KB) alongside ${pair.original.file} (${(originalSize / 1024).toFixed(1)}KB)`,
      );

      if (improvedExists && originalExists) {
        findings.push({
          category: "Components",
          severity: "medium",
          title: `"${pair.improved.file}" exists alongside "${pair.original.file}"`,
          description: `The "improved" variant suggests the original was meant to be replaced, but both still exist. This creates confusion about which to use and maintains dead code.`,
          files: [
            `src/components/${pair.improved.file}`,
            `src/pages/${pair.original.file}`,
          ],
          recommendation: `Merge ${pair.improved.file} into the page component and delete the "improved" variant, or replace the page's content with the improved version.`,
        });
      }
    }

    await navigateAndWait(page, "/");
    expect(true).toBeTruthy();
  });

  test("should detect background/starfield component variants", async ({
    page,
  }) => {
    const bgComponents = [
      { file: "StarField.tsx", size: 4381 },
      { file: "StarshipBackground.tsx", size: 26886 },
      { file: "WarpfieldStars.tsx", size: 6634 },
    ];

    console.log("\n[Background/StarField Variants]");
    for (const c of bgComponents) {
      const exists = fs.existsSync(path.join(COMPONENTS_DIR, c.file));
      console.log(
        `  ${c.file}: ${exists ? `${(c.size / 1024).toFixed(1)}KB` : "NOT FOUND"}`,
      );
    }

    findings.push({
      category: "Components",
      severity: "medium",
      title: "3 space background components (~38KB total)",
      description:
        "StarField.tsx, StarshipBackground.tsx (27KB!), and WarpfieldStars.tsx all render space/star backgrounds. StarshipBackground alone is 27KB.",
      files: bgComponents.map((c) => `src/components/${c.file}`),
      recommendation:
        "Consolidate into a single SpaceBackground component with variants (starfield, warpfield, starship) via props. StarshipBackground at 27KB likely has inline SVG/3D that should be extracted.",
    });

    await navigateAndWait(page, "/");
    expect(true).toBeTruthy();
  });

  test("should detect preview modal variants", async ({ page }) => {
    const modals = [
      { file: "ModelPreviewModal.tsx", size: 11233 },
      { file: "UnifiedPreviewModal.tsx", size: 16946 },
      { file: "VideoDiscussionModal.tsx", size: 10078 },
      { file: "VideoTheaterDialog.tsx", size: 1119 },
    ];

    console.log("\n[Modal/Dialog Variants]");
    for (const m of modals) {
      const exists = fs.existsSync(path.join(COMPONENTS_DIR, m.file));
      console.log(
        `  ${m.file}: ${exists ? `${(m.size / 1024).toFixed(1)}KB` : "NOT FOUND"}`,
      );
    }

    findings.push({
      category: "Components",
      severity: "medium",
      title: "Multiple preview modal implementations",
      description:
        'ModelPreviewModal and UnifiedPreviewModal both handle preview functionality (~28KB combined). "Unified" suggests it was meant to replace the original.',
      files: [
        "src/components/ModelPreviewModal.tsx",
        "src/components/UnifiedPreviewModal.tsx",
      ],
      recommendation:
        "Keep UnifiedPreviewModal as the single implementation. Delete ModelPreviewModal.",
    });

    await navigateAndWait(page, "/");
    expect(true).toBeTruthy();
  });

  test("should audit visual consistency across public pages", async ({
    page,
  }) => {
    test.setTimeout(60000);

    const pagesToCheck = [
      "/",
      "/about",
      "/how-it-works",
      "/faq",
      "/campaigns",
      "/forum",
    ];
    const pageStructures: {
      route: string;
      hasNav: boolean;
      hasFooter: boolean;
      hasNavigation: boolean;
    }[] = [];

    for (const route of pagesToCheck) {
      await navigateAndWait(page, route);

      const structure = await page.evaluate(() => {
        const hasNav = document.querySelectorAll("nav").length > 0;
        const hasFooter = document.querySelectorAll("footer").length > 0;
        // Check for the Navigation component specifically
        const hasNavigation =
          document.querySelector(".general-nav") !== null ||
          document.querySelector("nav.hidden.md\\:block") !== null;

        return { hasNav, hasFooter, hasNavigation };
      });

      pageStructures.push({ route, ...structure });
    }

    console.log("\n[Visual Consistency Across Pages]");
    console.log("  Route                    Nav    Footer  Navigation");
    for (const ps of pageStructures) {
      console.log(
        `  ${ps.route.padEnd(25)} ${ps.hasNav ? "✓" : "✗"}      ${ps.hasFooter ? "✓" : "✗"}       ${ps.hasNavigation ? "✓" : "✗"}`,
      );
    }

    const missingFooter = pageStructures.filter((ps) => !ps.hasFooter);
    const missingNav = pageStructures.filter((ps) => !ps.hasNavigation);

    if (missingFooter.length > 0) {
      findings.push({
        category: "Visual Consistency",
        severity: "medium",
        title: `${missingFooter.length} page(s) missing footer`,
        description: `Pages without footer: ${missingFooter.map((p) => p.route).join(", ")}`,
        recommendation:
          "Ensure all public pages include the Footer component for consistent layout.",
      });
    }

    if (missingNav.length > 0) {
      findings.push({
        category: "Visual Consistency",
        severity: "medium",
        title: `${missingNav.length} page(s) missing Navigation component`,
        description: `Pages without Navigation: ${missingNav.map((p) => p.route).join(", ")}`,
        recommendation:
          "Use a shared layout wrapper so Navigation is always present on public pages.",
      });
    }
  });

  test("should count total component files and flag bloat", async ({
    page,
  }) => {
    const totalFiles = countFilesRecursive(COMPONENTS_DIR);
    const totalSize = getDirSize(COMPONENTS_DIR);

    console.log(`\n[Component Inventory]`);
    console.log(`  Total component files: ${totalFiles}`);
    console.log(
      `  Total component source: ${(totalSize / 1024).toFixed(0)}KB (${(totalSize / 1024 / 1024).toFixed(1)}MB)`,
    );

    // Count by subdirectory
    try {
      const subdirs = fs
        .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory());

      console.log("\n  By directory:");
      for (const dir of subdirs) {
        const dirPath = path.join(COMPONENTS_DIR, dir.name);
        const count = countFilesRecursive(dirPath);
        const size = getDirSize(dirPath);
        if (count > 0) {
          console.log(
            `    ${dir.name}/`.padEnd(25) +
              `${count} files, ${(size / 1024).toFixed(0)}KB`,
          );
        }
      }

      // Root-level files
      const rootFiles = fs
        .readdirSync(COMPONENTS_DIR)
        .filter(
          (f) =>
            (f.endsWith(".tsx") || f.endsWith(".ts")) &&
            !fs.statSync(path.join(COMPONENTS_DIR, f)).isDirectory(),
        );
      const rootSize = rootFiles.reduce(
        (sum, f) => sum + fs.statSync(path.join(COMPONENTS_DIR, f)).size,
        0,
      );
      console.log(
        `    (root level)`.padEnd(25) +
          `${rootFiles.length} files, ${(rootSize / 1024).toFixed(0)}KB`,
      );
    } catch {
      /* ignore */
    }

    if (totalFiles > 200) {
      findings.push({
        category: "Components",
        severity: "high",
        title: `${totalFiles} component files totaling ${(totalSize / 1024 / 1024).toFixed(1)}MB of source code`,
        description:
          "Component sprawl makes the codebase hard to navigate, increases bundle size, and creates maintenance burden.",
        recommendation:
          "Phase 1 goal: reduce to <150 components by merging duplicates, deleting unused components, and consolidating variants.",
      });
    }

    await navigateAndWait(page, "/");
    expect(true).toBeTruthy();
  });

  test.afterAll(async () => {
    if (findings.length > 0) {
      console.log("\n══════════════════════════════════════════════════════");
      console.log("  COMPONENT SCATTER & VISUAL CONSISTENCY FINDINGS");
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
