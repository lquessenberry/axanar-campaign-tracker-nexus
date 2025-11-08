# Profile Component Consolidation Plan

## Summary
Consolidating redundant profile components into unified, privacy-aware versions:

### Components Being Merged:
1. **ProfileHeader** + **PublicProfileHeader** → **ProfileHeader** (with `isOwnProfile` prop)
2. **ProfileContent** + **PublicProfileContent** → **ProfileContent** (with `isOwnProfile` prop)
3. **ProfileSidebar** + **PublicProfileSidebar** → **ProfileSidebar** (with `isOwnProfile` prop)
4. **MobileProfileLayout** + **PublicMobileProfileLayout** → **MobileProfileLayout** (with `isOwnProfile` prop)

### Hooks Being Merged:
- **useUnifiedRank** + **useUnifiedXP** + **useForumRank** → **useRankSystem** ✅ (Created)

### Key Changes:
- All components now accept `isOwnProfile?: boolean` prop (defaults to `false`)
- Privacy settings are respected when `isOwnProfile = false`
- Editing functionality only shown when `isOwnProfile = true`
- Unified rank system via `useRankSystem` hook

### Files to Delete After Migration:
- src/hooks/useUnifiedRank.ts
- src/hooks/useUnifiedXP.ts  
- src/hooks/useForumRank.ts
- src/components/profile/PublicProfileHeader.tsx
- src/components/profile/PublicProfileContent.tsx
- src/components/profile/PublicProfileSidebar.tsx
- src/components/mobile/PublicMobileProfileLayout.tsx

## Implementation Status:
✅ Step 1: Created unified useRankSystem hook
⏳ Step 2: Update ProfileHeader (in progress)
⏳ Step 3: Update ProfileContent
⏳ Step 4: Update ProfileSidebar
⏳ Step 5: Update MobileProfileLayout
⏳ Step 6: Update MobileProfileHeader
⏳ Step 7: Update MobileProfileContent
⏳ Step 8: Update all files using old hooks
⏳ Step 9: Delete obsolete files
