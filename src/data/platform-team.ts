/**
 * 🖖 Platform Team - Appointed Fleet Admirals
 * 
 * These individuals are the core team behind the Axanar Campaign Tracker
 * and Axanar Productions. They are always Fleet Admiral rank regardless
 * of XP, as recognition of their leadership and contributions.
 */

export interface TeamMember {
  name: string;
  email?: string; // For matching auth users
  role: string;
  title: string;
  bio: string;
  contributions: string[];
  emoji: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export const PLATFORM_TEAM: TeamMember[] = [
  {
    name: "Lee Quessenberry",
    email: "lee@axanar.com", // Update with actual email
    role: "Platform Director & Lead Developer",
    title: "Fleet Admiral ⭐",
    bio: "Architected and built the entire Axanar Campaign Tracker platform. Responsible for platform migration, system architecture, and full-stack development.",
    contributions: [
      "Platform architecture and design",
      "Full-stack development (React/TypeScript/Supabase)",
      "Data migration from Laravel/Artisan",
      "Security implementation and optimization",
      "Forum system design and emoji integration",
      "Dual economy rank system",
      "E2E testing infrastructure"
    ],
    emoji: "🖖",
    socialLinks: {
      // Add actual links
      linkedin: "https://linkedin.com/in/leequessenberry"
    }
  },
  {
    name: "Alec Peters",
    email: "alec@axanar.com", // Update with actual email
    role: "Axanar Creator & Executive Producer",
    title: "Fleet Admiral 🚀",
    bio: "Creator of the Axanar universe and executive producer of Axanar Productions. Visionary leader bringing the Four Years War to life.",
    contributions: [
      "Created the Axanar story and universe",
      "Executive producer of all Axanar productions",
      "Led crowdfunding campaigns raising $1.1M+",
      "Built and nurtured the Axanar community",
      "Production oversight and creative direction",
      "Industry relationships and partnerships"
    ],
    emoji: "🚀"
  },
  {
    name: "James Simpson",
    email: "james@axanar.com", // Update with actual email
    role: "Special Consult Technical Manager",
    title: "Fleet Admiral 🎬",
    bio: "Provides specialized technical consulting and management for Axanar Productions. Expert guidance on technical aspects of production and platform operations.",
    contributions: [
      "Technical consulting and advisory",
      "Production technical management",
      "Quality assurance and technical review",
      "Technical documentation and standards",
      "Platform technical guidance",
      "Strategic technical planning"
    ],
    emoji: "🎬"
  }
];

/**
 * Check if an email belongs to a platform team member
 */
export const isPlatformTeamEmail = (email: string): boolean => {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  return PLATFORM_TEAM.some(
    member => member.email?.toLowerCase() === normalizedEmail
  );
};

/**
 * Get team member by email
 */
export const getTeamMemberByEmail = (email: string): TeamMember | undefined => {
  if (!email) return undefined;
  const normalizedEmail = email.toLowerCase().trim();
  return PLATFORM_TEAM.find(
    member => member.email?.toLowerCase() === normalizedEmail
  );
};

/**
 * Get team member by name
 */
export const getTeamMemberByName = (name: string): TeamMember | undefined => {
  if (!name) return undefined;
  const normalizedName = name.toLowerCase().trim();
  return PLATFORM_TEAM.find(
    member => member.name.toLowerCase() === normalizedName
  );
};

/**
 * Format for display in landing pages
 */
export const getTeamForDisplay = () => {
  return PLATFORM_TEAM.map(member => ({
    name: member.name,
    role: member.role,
    bio: member.bio,
    icon: member.emoji
  }));
};

export default PLATFORM_TEAM;
