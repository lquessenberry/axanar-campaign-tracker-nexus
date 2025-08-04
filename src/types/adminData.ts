// Enhanced admin data types with comprehensive typing

export interface AdminAnalytics {
  overview: {
    totalDonors: number;
    activeDonors: number;
    totalRaised: number;
    conversionRate: number;
    averageDonation: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalRewards: number;
    totalPledges: number;
  };
  trends: {
    donorsGrowth: number;
    revenueGrowth: number;
    pledgeGrowth: number;
  };
  topMetrics: {
    topDonors: TopDonor[];
    topCampaigns: TopCampaign[];
  };
}

export interface TopDonor {
  id: string;
  name: string;
  email?: string;
  totalDonated: number;
  pledgeCount: number;
  authUserId?: string | null;
}

export interface TopCampaign {
  id: string;
  name: string;
  totalRaised: number;
  donorCount: number;
  goalAmount: number;
}

export interface AdminDonor {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  donor_name: string | null;
  email: string;
  auth_user_id: string | null;
  created_at: string | null;
  last_login: string | null;
  email_verified_at: string | null;
  totalPledges: number;
  pledgeCount: number;
  hasAuthAccount: boolean;
  isActive: boolean;
}

export interface DonorsResponse {
  donors: AdminDonor[];
  pagination: PaginationInfo;
  stats: DonorStats;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
}

export interface DonorStats {
  totalDonors: number;
  activeDonors: number;
  totalRaised: number;
  averageDonation: number;
}

export interface DonorFilters {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: string;
  page?: number;
  limit?: number;
}

export interface AdminCampaign {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  goal_amount: number;
  current_amount: number;
  active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  provider?: string;
  status?: string;
  web_url?: string;
  legacy_id?: number;
  pledge_count: number;
  donor_count: number;
  completion_percentage: number;
  days_remaining?: number;
  performance_score: number;
}

export interface AdminReward {
  id: string;
  name: string | null;
  description: string | null;
  minimum_amount: number | null;
  campaign_id: string | null;
  campaign_name?: string;
  claim_count: number;
  total_claimed_amount: number;
  available: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminPledge {
  id: string;
  amount: number;
  status: string | null;
  created_at: string | null;
  donor_id: string | null;
  donor_name?: string;
  donor_email?: string;
  campaign_id: string | null;
  campaign_name?: string;
  reward_id: string | null;
  reward_name?: string;
}

export interface AdminUser {
  user_id: string;
  email: string;
  is_super_admin: boolean;
  is_content_manager: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in?: string;
  email_confirmed?: boolean;
}

// API Response wrapper types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

// Search and filter types
export interface AdminSearchFilters {
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  statusFilter?: 'all' | 'active' | 'inactive';
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface BulkActionResult {
  success: boolean;
  processedCount: number;
  errorCount: number;
  errors?: string[];
  message: string;
}