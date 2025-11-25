# User Issues Report - November 2025

## Critical Issues Identified

### 1. ❌ **Address Update Functionality Not Working**
**Status:** INVESTIGATING - System appears functional but users report failures
**Affected Users:** Westy, John, multiple others
**Reported:** Nov 19-21, 2025

**Issue Details:**
- Users cannot save shipping address updates
- Form appears to validate but doesn't persist changes
- System shows "Email was recognized but I had to create an account" message

**Technical Analysis:**
- ✅ Database function `upsert_user_address` exists and is well-structured
- ✅ Frontend hook `useUpdateAddress` properly calls the function
- ✅ Validation logic in place
- ⚠️ Need to check RLS policies and donor record linkage

**Resolution Steps:**
1. Check if donor records are properly linked to auth users
2. Verify RLS policies allow authenticated users to update their addresses
3. Add better error logging to track failures
4. Implement address verification in admin panel

---

### 2. ❌ **Missing/Incomplete Contribution History**
**Status:** DATA INTEGRITY ISSUE
**Affected Users:** Multiple (GlenWuthrich, Mark Randin, others)
**Reported:** Nov 10-23, 2025

**Issue Details:**
- Upgraded pledges only show original amounts ($25 instead of $75)
- Some contributions showing as $0
- Store purchases not tracked (confirmed - only Kickstarter/Indiegogo imported)
- Data mapping errors between campaigns

**Examples:**
- GlenWuthrich: Upgraded to $75 BluRay but shows $25
- User report: "Prelude shows $0, Axanar shows Prelude amount"
- Store purchases (labels, $450 follow-on) not in system

**Resolution Steps:**
1. Run data reconciliation on pledge amounts
2. Check pledge history for upgrade transactions
3. Verify campaign-pledge associations are correct
4. Document that store purchases require separate import

---

### 3. ⚠️ **Perks Tracking Access Issues**
**Status:** UI/PERMISSION ISSUE
**Affected Users:** John, others
**Reported:** Nov 10, 2025

**Issue Details:**
- Users can't access "perks tracking" section
- Some perk information visible in Profile but not detailed
- Dashboard links to campaigns may be involved

**Resolution Steps:**
1. Check perks table RLS policies
2. Verify user-perk associations
3. Add clearer navigation to perks section
4. Consider adding perks summary to dashboard

---

### 4. ✅ **Broken Kickstarter Campaign URLs** - FIXED
**Status:** FIXED IN DATABASE
**Affected Users:** All (reported by brassaf)
**Reported:** Nov 10, 2025

**Issue Details:**
- Kickstarter URLs were truncated in user reports
- URLs should be: `https://www.kickstarter.com/projects/194429923/star-trek-prelude-to-axanar`
- Users reported: `https://www.kickstarter.com/projects/19442992` (truncated)

**Current Status:**
✅ Database verification shows correct URLs:
- Prelude: https://www.kickstarter.com/projects/194429923/star-trek-prelude-to-axanar
- Axanar: https://www.kickstarter.com/projects/194429923/star-trek-axanar

**Action:** URLs are correct in database. Issue may be UI rendering or cached data.

---

### 5. ⚠️ **Email Change Requests**
**Status:** MANUAL PROCESS REQUIRED
**User:** doehlerm (Mike Doehler)
**Reported:** Nov 19, 2025

**Request:**
Change from: geoffrey_pipes@yahoo.com
To: mike.doehler@gmail.com

**Note:** Email changes require admin intervention for security

---

## Support Email Issues

⚠️ **support@axanardonors.com** - Email bouncing
- Reported by GlenWuthrich
- Users cannot reach support via this address
- Need to verify correct support email

---

## System Status

### Working Systems ✅
- Authentication/Login
- Forum (recently upgraded with cosmic UI)
- Direct messaging (optimized performance)
- Profile viewing
- Campaign display
- Leaderboard

### Needs Attention ⚠️
- Address update persistence
- Pledge history accuracy
- Perks tracking access
- Support email delivery

### Known Limitations 📝
- Store purchases not yet integrated (only Kickstarter/Indiegogo)
- Some legacy data may require manual reconciliation
- Email address changes require admin action

---

## Recommendations

### Immediate Actions
1. **Debug address update flow** - Add comprehensive logging
2. **Data reconciliation audit** - Check all pledge amounts against source data
3. **Support email** - Verify and publicize correct support email
4. **User communication** - Post update in forum about known issues

### Short-term Improvements
1. Add admin tools for manual pledge correction
2. Implement address verification in admin panel
3. Create "View All Perks" page with better accessibility
4. Add data integrity checks for pledge imports

### Long-term Features
1. Store purchase integration
2. Automated pledge upgrade detection
3. Self-service email change (with verification)
4. Enhanced error reporting for users

---

## User Communication Template

```
**Platform Status Update - November 25, 2025**

We're aware of several issues affecting contributors:

✅ **Fixed:**
- Campaign URLs now resolve correctly
- Forum performance significantly improved
- Messaging system optimized

🔧 **Under Investigation:**
- Address update persistence - working on fix
- Pledge history accuracy - conducting data audit
- Perks tracking access - improving navigation

📝 **Known Limitations:**
- Store purchases require separate import (coming soon)
- Email changes require admin assistance for security

**Need Help?**
Post in the Support forum thread or DM @lee directly.

We appreciate your patience as we continue improving the platform!
```

---

*Report Generated: November 25, 2025*
*Next Review: Check resolution of address updates and pledge reconciliation*
