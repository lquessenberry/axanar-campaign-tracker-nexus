# Phase 1: The Reductioning — Completion Report

**Date:** 2026-02-11
**Result:** 38 files changed, +2,498 / -5,057 lines (net **-2,559 lines**)
**Stability:** `tsc --noEmit` clean, Playwright 46/46 passed

---

## Wave 1 — Dead Code & Easy Kills

| Action | File |
|--------|------|
| Deleted | `src/hooks/useDebouncedValue.ts` (replaced by `useDebounce`) |
| Deleted | `src/hooks/useHandheldDevice.ts` (replaced by `useMobile`) |
| Deleted | `src/pages/Messages.tsx` (duplicate of DirectMessages) |
| Fixed | `src/hooks/useForumSearch.ts` — swapped `useDebouncedValue` → `useDebounce` |
| Fixed | `src/components/mobile/index.ts` — removed dead barrel re-export |
| Removed | `konva` + `react-konva` from `package.json` (zero imports) |
| Cleaned | `src/App.tsx` — removed ThumbMenu, dead Messages lazy import, collapsed redirect routes |

## Wave 2 — Hook Consolidation

| Action | File |
|--------|------|
| Consolidated | `src/hooks/use-mobile.tsx` → merged into `src/hooks/useMobile.ts` (added `useIsMobile` export) |
| Deleted | `src/hooks/use-mobile.tsx` |
| Deleted | `src/hooks/useUnifiedRank.ts` (dead code, zero imports) |
| Deleted | `src/hooks/useUnifiedXP.ts` (dead code, zero imports) |
| Updated | 5 consumers repointed: `sidebar.tsx`, `MobileProfileLayout.tsx`, `Profile.tsx`, `PublicProfile.tsx`, `AuthLayout.tsx` |

## Wave 3 — Component Cleanup

| Action | File |
|--------|------|
| Deleted | `src/components/StarshipBackground.tsx` (redundant with StarField) |
| Renamed | `src/components/ImprovedFAQ.tsx` → `FAQAccordion.tsx` |
| Deleted | `src/components/ImprovedHowItWorks.tsx` → renamed to `HowItWorksSteps.tsx`, then deleted (usage removed) |
| Removed from App.tsx | `DaystromCursorGlow` (decorative cursor effect) |
| Removed from App.tsx | `LCARSEdgeBars` (decorative edge bars) |
| Lazy-loaded | `ChatWindow` + `ImpersonationBanner` with `Suspense` wrappers |

## Wave 4 — Auth Gate Standardization

| Action | File |
|--------|------|
| Fixed | `src/components/auth/RequireAuth.tsx` — redirect `/401` → `/auth` (matches RequireAdmin) |
| Fixed | `src/pages/Profile.tsx` — replaced inline sign-in prompt with `<Navigate to="/auth">` |
| **Skipped** | Profile header/content/sidebar merges — components are intentionally different (edit panel vs hero banner, owner vs public) |
| **Deferred** | Mobile profile layout deletion — requires responsive rewrite first |

## Wave 5 — Message System & LCARS Consolidation

| Action | File |
|--------|------|
| Deleted | `src/components/messages/ConversationList.tsx` (dead, zero imports) |
| Deleted | `src/components/messages/RealtimeConversationList.tsx` (dead, zero imports) |
| Deleted | `src/components/messages/MessageThread.tsx` (dead, zero imports) |
| Deleted | `src/hooks/useMessages.ts` (dead, zero imports) |
| Renamed | `OptimizedConversationList.tsx` → `ConversationList.tsx` |
| Renamed | `OptimizedMessageThread.tsx` → `MessageThread.tsx` |
| Renamed | `OptimizedMessageList.tsx` → `MessageList.tsx` |
| Renamed | `useOptimizedMessages.ts` → `useMessages.ts` |
| Deleted | `src/components/LCARSEdgeBars.tsx` (dead after W3 removal) |
| Deleted | `src/components/EnhancedLCARS.tsx` (dead, zero imports) |
| Deleted | `src/components/LCARSDemo.tsx` (dead, zero imports) |
| Deleted | `src/components/DaystromCursorGlow.tsx` (dead after W3 removal) |
| **Kept** | `lottie-react` — 7 animations across About + Campaign pages, all meaningful content |

---

## Total Files Deleted: 17

1. `src/hooks/useDebouncedValue.ts`
2. `src/hooks/useHandheldDevice.ts`
3. `src/hooks/use-mobile.tsx`
4. `src/hooks/useUnifiedRank.ts`
5. `src/hooks/useUnifiedXP.ts`
6. `src/pages/Messages.tsx`
7. `src/components/StarshipBackground.tsx`
8. `src/components/ImprovedFAQ.tsx` (renamed to FAQAccordion.tsx)
9. `src/components/ImprovedHowItWorks.tsx` / `HowItWorksSteps.tsx`
10. `src/components/DaystromCursorGlow.tsx`
11. `src/components/LCARSEdgeBars.tsx`
12. `src/components/EnhancedLCARS.tsx`
13. `src/components/LCARSDemo.tsx`
14. `src/components/messages/ConversationList.tsx` (original)
15. `src/components/messages/RealtimeConversationList.tsx`
16. `src/components/messages/MessageThread.tsx` (original)
17. `src/hooks/useMessages.ts` (original)

## Remaining Opportunities (Future Work)

- **Mobile profile layouts** — `MobileProfileLayout.tsx` and `PublicMobileProfileLayout.tsx` duplicate desktop logic; replace with responsive Tailwind on the desktop components
- **Profile component merges** — if design converges, ProfileHeader/PublicProfileHeader could share a base component
- **Flaky Playwright test** — `01-navigation-redundancy.spec.ts:206` hamburger menu test occasionally fails due to Vite error overlay intercepting clicks on mobile viewport
- **FAQ captcha warning** — `/faq` page has 2 console errors related to captcha container limits (pre-existing)
