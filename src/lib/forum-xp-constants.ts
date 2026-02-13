/**
 * 🎮 Forum XP System - Boosted Incentives
 *
 * MAJOR UPDATE: Doubled base XP and enhanced quality bonuses
 * to make community path competitive with donor ranks.
 *
 * Captain rank (100k XP) now achievable in 3-4 years of quality engagement!
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE ACTION XP (DOUBLED FROM ORIGINAL)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FORUM_XP = {
  // Core actions
  CREATE_THREAD: 100, // was 50
  POST_REPLY: 20, // was 10
  RECEIVE_LIKE: 10, // was 5
  RECEIVE_THANK: 20, // was 10

  // Thread performance
  HOT_THREAD_BONUS: 50, // 100+ views, was 25
  VIRAL_THREAD_BONUS: 100, // 500+ views, NEW!
  THREAD_PINNED_BONUS: 200, // was 100

  // Engagement bonuses
  FIRST_REPLY_BONUS: 10, // NEW!
  THREAD_STARTER_BONUS: 25, // Thread gets 5+ replies, NEW!
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUALITY BONUSES (ENHANCED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const QUALITY_XP = {
  // Content quality
  ORIGINAL_CONTENT_MIN: 200, // was 100
  ORIGINAL_CONTENT_MAX: 1000, // was 500
  HELPFUL_ANSWER_MOD: 100, // Marked by mod, was 50
  BEST_ANSWER_AUTO: 50, // Upvoted by community, NEW! AUTOMATED!

  // Recognition
  THREAD_OF_WEEK: 500, // was 200
  POST_OF_MONTH: 1000, // NEW!
  POPULAR_POST: 200, // 50+ likes, was 100
  LEGENDARY_POST: 500, // 100+ likes, NEW!

  // Content types
  FAN_ART_VIDEO_MIN: 300, // NEW!
  FAN_ART_VIDEO_MAX: 800, // NEW!
  LONG_FORM_GUIDE: 400, // 500+ words, NEW!
  WELCOMING_MEMBERS: 50, // 5+ welcomes, NEW!
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STREAK BONUSES (IMPROVED)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const STREAK_XP = {
  SEVEN_DAY: 100, // was 50
  THIRTY_DAY: 500, // was 250
  NINETY_DAY: 1000, // NEW!
  ONE_EIGHTY_DAY: 2000, // NEW!
  THREE_SIXTY_FIVE_DAY: 5000, // was 1000

  // Activity bonuses
  WEEKLY_ACTIVE: 50, // 5+ posts/week, NEW!
  MONTHLY_ACTIVE: 250, // 20+ posts/month, NEW!
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROFILE COMPLETENESS (ONE-TIME)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PROFILE_XP = {
  AVATAR_UPLOADED: 150, // was 100
  BIO_FILLED: 100, // was 50
  CUSTOM_SIGNATURE: 100, // was 50
  SOCIAL_LINK: 50, // Each link, was 25
  FAVORITE_TREK_SERIES: 50, // NEW!
  LOCATION_TIMEZONE: 50, // NEW!
  PROFILE_VIEWS_100: 100, // NEW!
  COMPLETE_ALL_FIELDS: 300, // Bonus for 100% complete, NEW!
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUALITY MULTIPLIERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const QUALITY_MULTIPLIERS = {
  // Word count bonuses
  WORDS_100_PLUS: 1.5, // Posts with 100+ words
  WORDS_500_PLUS: 2.0, // Posts with 500+ words (guides)

  // Rich content
  HAS_MEDIA: 1.2, // Images, videos, or external links

  // Diminishing returns for spam prevention
  POSTS_PER_DAY: {
    TIER_1: { max: 10, multiplier: 1.0 }, // Full XP
    TIER_2: { max: 20, multiplier: 0.5 }, // Half XP
    TIER_3: { max: 999, multiplier: 0.25 }, // Quarter XP
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SPECIAL EVENTS & CHALLENGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const EVENT_XP = {
  WEEKLY_THEMED_DISCUSSION: 200,
  MONTHLY_FAN_CONTEST: 1000,
  ANNUAL_COMMUNITY_AWARD: 5000,
  WATCH_PARTY_PARTICIPATION: 500,
  FAN_THEORY_CONTEST: 300,
  WEEKEND_DOUBLE_XP: 2.0, // Multiplier
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANTI-BURNOUT FEATURES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const STREAK_PROTECTION = {
  GRACE_PERIOD_DAYS: 1, // Miss 1 day, no penalty
  FREEZE_TOKEN_COOLDOWN: 30, // Earn 1 freeze token per 30 days
  BROKEN_STREAK_XP_SAVED: 0.5, // Save 50% of accumulated streak XP
  VACATION_MODE_MAX_DAYS: 28, // Max 4 weeks
  WELCOME_BACK_BONUS: 500, // After 30+ days inactive
  CATCHUP_BONUS_MULTIPLIER: 0.5, // 50% credit for missed week if doubled next week
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DONOR XP CALCULATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DONOR_XP_MULTIPLIER = 100; // $1 = 100 XP

export const calculateDonorXP = (totalPledged: number): number => {
  return totalPledged * DONOR_XP_MULTIPLIER;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UNIFIED XP CALCULATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate unified XP using the dual-path economy formula:
 *   ARES = MAX(donationXP, participationXP) + dualPathBonus
 *
 * @param donationXP     - Total donation ARES ($1 = 100 ARES)
 * @param participationXP - Sum of forum_xp + profile_xp + achievement_xp + recruitment_xp + title buffs
 */
export const calculateUnifiedXP = (
  donationXP: number,
  participationXP: number,
): number => {
  const base = Math.max(donationXP, participationXP);
  const dualPathBonus =
    donationXP > 0 && participationXP > 0
      ? Math.floor(Math.min(donationXP, participationXP) * 0.1)
      : 0;
  return base + dualPathBonus;
};

/**
 * @deprecated Use calculateUnifiedXP instead — kept for backward compatibility
 */
export const calculateHybridXP = calculateUnifiedXP;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST XP CALCULATION WITH QUALITY MULTIPLIERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PostMetrics {
  wordCount: number;
  hasMedia: boolean;
  postNumberToday: number; // 1-based
}

export const calculatePostXP = (
  baseXP: number,
  metrics: PostMetrics,
): number => {
  let multiplier = 1.0;

  // Word count bonus
  if (metrics.wordCount >= 500) {
    multiplier *= QUALITY_MULTIPLIERS.WORDS_500_PLUS;
  } else if (metrics.wordCount >= 100) {
    multiplier *= QUALITY_MULTIPLIERS.WORDS_100_PLUS;
  }

  // Media bonus
  if (metrics.hasMedia) {
    multiplier *= QUALITY_MULTIPLIERS.HAS_MEDIA;
  }

  // Diminishing returns for spam
  const { POSTS_PER_DAY } = QUALITY_MULTIPLIERS;
  if (metrics.postNumberToday <= POSTS_PER_DAY.TIER_1.max) {
    multiplier *= POSTS_PER_DAY.TIER_1.multiplier;
  } else if (metrics.postNumberToday <= POSTS_PER_DAY.TIER_2.max) {
    multiplier *= POSTS_PER_DAY.TIER_2.multiplier;
  } else {
    multiplier *= POSTS_PER_DAY.TIER_3.multiplier;
  }

  return Math.floor(baseXP * multiplier);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate total profile completion XP
 */
export const calculateProfileCompletionXP = (profile: {
  hasAvatar: boolean;
  hasBio: boolean;
  hasSignature: boolean;
  socialLinksCount: number;
  hasFavoriteSeries: boolean;
  hasLocation: boolean;
  profileViews: number;
}): number => {
  let total = 0;

  if (profile.hasAvatar) total += PROFILE_XP.AVATAR_UPLOADED;
  if (profile.hasBio) total += PROFILE_XP.BIO_FILLED;
  if (profile.hasSignature) total += PROFILE_XP.CUSTOM_SIGNATURE;
  if (profile.hasFavoriteSeries) total += PROFILE_XP.FAVORITE_TREK_SERIES;
  if (profile.hasLocation) total += PROFILE_XP.LOCATION_TIMEZONE;

  total += profile.socialLinksCount * PROFILE_XP.SOCIAL_LINK;

  if (profile.profileViews >= 100) {
    total += PROFILE_XP.PROFILE_VIEWS_100;
  }

  // Check if 100% complete
  const isComplete =
    profile.hasAvatar &&
    profile.hasBio &&
    profile.hasSignature &&
    profile.hasFavoriteSeries &&
    profile.hasLocation &&
    profile.socialLinksCount > 0;

  if (isComplete) {
    total += PROFILE_XP.COMPLETE_ALL_FIELDS;
  }

  return total;
};

/**
 * Calculate streak XP based on consecutive days
 */
export const calculateStreakXP = (consecutiveDays: number): number => {
  if (consecutiveDays >= 365) return STREAK_XP.THREE_SIXTY_FIVE_DAY;
  if (consecutiveDays >= 180) return STREAK_XP.ONE_EIGHTY_DAY;
  if (consecutiveDays >= 90) return STREAK_XP.NINETY_DAY;
  if (consecutiveDays >= 30) return STREAK_XP.THIRTY_DAY;
  if (consecutiveDays >= 7) return STREAK_XP.SEVEN_DAY;
  return 0;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXAMPLE CALCULATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Example: Active member over 1 year
 */
export const EXAMPLE_ACTIVE_MEMBER_1_YEAR = {
  posts: 365,
  threads: 50,
  likesReceived: 200,

  calculation: {
    postXP: 365 * FORUM_XP.POST_REPLY, // 7,300
    threadXP: 50 * FORUM_XP.CREATE_THREAD, // 5,000
    likeXP: 200 * FORUM_XP.RECEIVE_LIKE, // 2,000
    streakXP: 12 * STREAK_XP.THIRTY_DAY, // 6,000 (30-day streaks)
    weeklyBonuses: 52 * STREAK_XP.WEEKLY_ACTIVE, // 2,600
    profileXP: 1000, // Complete profile
    total: 23900, // Lieutenant Commander!
  },
};

/**
 * Example: Super contributor over 2 years
 */
export const EXAMPLE_SUPER_CONTRIBUTOR_2_YEARS = {
  qualityPosts: 730,
  popularThreads: 100,
  originalContent: 20,
  postOfMonth: 12,
  legendaryPosts: 5,

  calculation: {
    postXP: 730 * FORUM_XP.POST_REPLY, // 14,600
    threadXP: 100 * FORUM_XP.CREATE_THREAD, // 10,000
    originalContentXP: 20 * 600, // 12,000 (avg)
    postOfMonthXP: 12 * QUALITY_XP.POST_OF_MONTH, // 12,000
    legendaryXP: 5 * QUALITY_XP.LEGENDARY_POST, // 2,500
    yearStreakXP: 2 * STREAK_XP.THREE_SIXTY_FIVE_DAY, // 10,000
    monthlyBonuses: 24 * STREAK_XP.MONTHLY_ACTIVE, // 6,000
    guides: 5000, // Long-form content
    total: 72100, // Commander+ (approaching Captain!)
  },
};

export default {
  FORUM_XP,
  QUALITY_XP,
  STREAK_XP,
  PROFILE_XP,
  QUALITY_MULTIPLIERS,
  EVENT_XP,
  STREAK_PROTECTION,
  DONOR_XP_MULTIPLIER,
  calculateDonorXP,
  calculateUnifiedXP,
  calculateHybridXP,
  calculatePostXP,
  calculateProfileCompletionXP,
  calculateStreakXP,
};
