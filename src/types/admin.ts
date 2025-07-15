
export interface AdminUser {
  user_id: string;
  email: string;
  is_super_admin: boolean;
  is_content_manager: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
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
  pledge_count?: number;
}

// Re-export enhanced types from adminData
export type { 
  AdminAnalytics, 
  AdminDonor, 
  DonorsResponse, 
  PaginationInfo, 
  DonorStats,
  DonorFilters,
  AdminCampaign,
  AdminReward,
  AdminPledge,
  TopDonor,
  TopCampaign,
  ApiResponse,
  ApiError,
  AdminSearchFilters,
  BulkActionResult
} from './adminData';

export interface CreateCampaignParams {
  name: string;
  description?: string;
  image_url?: string;
  goal_amount: number;
  active: boolean;
  start_date?: string;
  end_date?: string;
  provider?: string;
  status?: string;
  web_url?: string;
}
