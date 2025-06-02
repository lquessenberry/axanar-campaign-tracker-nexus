import { supabase } from '@/integrations/supabase/client';

// Types
export type PledgeStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export type SortablePledgeColumns = 
  | 'created_at' 
  | 'amount' 
  | 'status'
  | 'campaign_name'
  | 'donor_name';

export type SortOrder = 'asc' | 'desc';

export interface Pledge {
  id: string;
  donor_id: string;
  campaign_id: string;
  reward_id: string | null;
  amount: number;
  status: PledgeStatus;
  created_at: string;
  updated_at: string;
  transaction_id: string | null;
  provider: string | null;
  notes: string | null;
  
  // Join fields from related tables
  donor_name?: string;
  donor_email?: string;
  campaign_name?: string;
  reward_name?: string;
}

/**
 * Fetches pledges with filtering, pagination, and sorting
 */
export async function fetchPledges({
  page = 1,
  pageSize = 10,
  searchQuery = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
  donorId = undefined,
  campaignId = undefined,
  status = undefined,
}: {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: SortablePledgeColumns;
  sortOrder?: SortOrder;
  donorId?: string;
  campaignId?: string;
  status?: PledgeStatus;
} = {}): Promise<{ pledges: Pledge[]; total: number }> {
  try {
    // Try to use the vw_donor_pledge_summary view first for better performance
    let query = supabase
      .from('vw_donor_pledge_summary')
      .select('pledge_id, donor_id, donor_full_name, donor_email, pledge_amount, pledge_date, pledge_status, campaign_id, campaign_name, reward_id, reward_name, reward_description, reward_price', {
        count: 'exact',
      });
    
    // Apply filters
    if (searchQuery) {
      query = query.or(
        `donor_full_name.ilike.%${searchQuery}%,donor_email.ilike.%${searchQuery}%,campaign_name.ilike.%${searchQuery}%`
      );
    }
    
    if (donorId) {
      query = query.eq('donor_id', donorId);
    }
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    if (status) {
      query = query.eq('pledge_status', status);
    }
    
    // Apply sorting
    const sortColumnMap: Record<SortablePledgeColumns, string> = {
      'created_at': 'pledge_date',
      'amount': 'pledge_amount',
      'status': 'pledge_status',
      'campaign_name': 'campaign_name',
      'donor_name': 'donor_full_name'
    };
    
    query = query.order(sortColumnMap[sortBy] || 'pledge_date', {
      ascending: sortOrder === 'asc',
    });
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data: viewData, error: viewError, count } = await query;
    
    if (viewError) {
      console.error('Error fetching from view:', viewError);
      // Fall back to the pledges table with joins if the view is not available
      return await fetchPledgesFromTables({
        page, pageSize, searchQuery, sortBy, sortOrder, donorId, campaignId, status
      });
    }
    
    // Map view data to Pledge interface
    const pledges: Pledge[] = viewData.map(row => ({
      id: row.pledge_id,
      donor_id: row.donor_id,
      campaign_id: row.campaign_id,
      reward_id: row.reward_id,
      amount: row.pledge_amount,
      status: row.pledge_status as PledgeStatus,
      created_at: row.pledge_date,
      updated_at: row.pledge_date, // The view might not have updated_at
      transaction_id: null, // The view might not include this
      provider: null, // The view might not include this
      notes: null, // The view might not include this
      donor_name: row.donor_full_name,
      donor_email: row.donor_email,
      campaign_name: row.campaign_name,
      reward_name: row.reward_name
    }));
    
    return {
      pledges,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error in fetchPledges:', error);
    throw error;
  }
}

/**
 * Fallback function to fetch pledges directly from tables with joins
 */
async function fetchPledgesFromTables({
  page = 1,
  pageSize = 10,
  searchQuery = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
  donorId = undefined,
  campaignId = undefined,
  status = undefined,
}: {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  sortBy?: SortablePledgeColumns;
  sortOrder?: SortOrder;
  donorId?: string;
  campaignId?: string;
  status?: PledgeStatus;
} = {}): Promise<{ pledges: Pledge[]; total: number }> {
  try {
    // Base query joining pledges with donors and campaigns
    let query = supabase
      .from('pledges')
      .select(`
        *,
        donors:donor_id (id, email, first_name, last_name, full_name, donor_name),
        campaigns:campaign_id (id, name, start_date, end_date, status, goal_amount),
        rewards:reward_id (id, name, description, minimum_amount)
      `, {
        count: 'exact',
      });
    
    // Apply filters
    if (donorId) {
      query = query.eq('donor_id', donorId);
    }
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (searchQuery) {
      // We need to handle the search differently since we need to search in joined tables
      // This approach might vary based on your database capabilities
      // For Supabase, we might need to use a stored procedure or a different approach
      // For simplicity, we'll just continue and filter in memory after fetching
    }
    
    // Apply sorting directly on the pledges table where possible
    // For donor_name and campaign_name, we'll need to sort in memory after fetching
    if (['created_at', 'amount', 'status'].includes(sortBy)) {
      query = query.order(sortBy, {
        ascending: sortOrder === 'asc',
      });
    }
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data: rawPledges, error, count } = await query;
    
    if (error) {
      console.error('Error fetching pledges from tables:', error);
      throw error;
    }
    
    // Transform the data to match the Pledge interface
    let pledges: Pledge[] = rawPledges.map(row => ({
      id: row.id,
      donor_id: row.donor_id,
      campaign_id: row.campaign_id,
      reward_id: row.reward_id,
      amount: row.amount,
      status: row.status as PledgeStatus,
      created_at: row.created_at,
      updated_at: row.updated_at || row.created_at,
      transaction_id: row.transaction_id,
      provider: row.provider,
      notes: row.notes,
      donor_name: row.donors?.full_name || `${row.donors?.first_name || ''} ${row.donors?.last_name || ''}`.trim() || row.donors?.donor_name,
      donor_email: row.donors?.email,
      campaign_name: row.campaigns?.name,
      reward_name: row.rewards?.name
    }));
    
    // Apply in-memory filtering for searchQuery if needed
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      pledges = pledges.filter(pledge => 
        (pledge.donor_name?.toLowerCase().includes(searchLower)) ||
        (pledge.donor_email?.toLowerCase().includes(searchLower)) ||
        (pledge.campaign_name?.toLowerCase().includes(searchLower)) ||
        (pledge.reward_name?.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply in-memory sorting for donor_name and campaign_name if needed
    if (sortBy === 'donor_name') {
      pledges.sort((a, b) => {
        const nameA = a.donor_name?.toLowerCase() || '';
        const nameB = b.donor_name?.toLowerCase() || '';
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else if (sortBy === 'campaign_name') {
      pledges.sort((a, b) => {
        const nameA = a.campaign_name?.toLowerCase() || '';
        const nameB = b.campaign_name?.toLowerCase() || '';
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    }
    
    return {
      pledges,
      total: count || pledges.length, // Use the count from the DB or the filtered length
    };
  } catch (error) {
    console.error('Error in fetchPledgesFromTables:', error);
    throw error;
  }
}

/**
 * Fetches a single pledge by its ID with all related details
 */
export async function fetchPledgeById(pledgeId: string): Promise<Pledge | null> {
  try {
    // Try to get the pledge with all related data
    const { data, error } = await supabase
      .from('pledges')
      .select(`
        *,
        donors:donor_id (id, email, first_name, last_name, full_name, donor_name),
        campaigns:campaign_id (id, name, start_date, end_date, status, goal_amount),
        rewards:reward_id (id, name, description, minimum_amount)
      `)
      .eq('id', pledgeId)
      .single();
    
    if (error) {
      console.error('Error fetching pledge:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Transform to Pledge interface
    return {
      id: data.id,
      donor_id: data.donor_id,
      campaign_id: data.campaign_id,
      reward_id: data.reward_id,
      amount: data.amount,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at,
      transaction_id: data.transaction_id,
      provider: data.provider,
      notes: data.notes,
      donor_name: data.donors?.full_name || `${data.donors?.first_name || ''} ${data.donors?.last_name || ''}`.trim() || data.donors?.donor_name,
      donor_email: data.donors?.email,
      campaign_name: data.campaigns?.name,
      reward_name: data.rewards?.name
    };
  } catch (error) {
    console.error('Error in fetchPledgeById:', error);
    throw error;
  }
}

/**
 * Creates a new pledge
 */
export async function createPledge(pledge: Omit<Pledge, 'id' | 'created_at' | 'updated_at'>): Promise<Pledge | null> {
  try {
    const { data, error } = await supabase
      .from('pledges')
      .insert([
        {
          donor_id: pledge.donor_id,
          campaign_id: pledge.campaign_id,
          reward_id: pledge.reward_id,
          amount: pledge.amount,
          status: pledge.status,
          transaction_id: pledge.transaction_id,
          provider: pledge.provider,
          notes: pledge.notes
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating pledge:', error);
      throw error;
    }
    
    return fetchPledgeById(data.id);
  } catch (error) {
    console.error('Error in createPledge:', error);
    throw error;
  }
}

/**
 * Updates an existing pledge
 */
export async function updatePledge(id: string, updates: Partial<Omit<Pledge, 'id' | 'created_at' | 'updated_at' | 'donor_name' | 'donor_email' | 'campaign_name' | 'reward_name'>>): Promise<Pledge | null> {
  try {
    const { error } = await supabase
      .from('pledges')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating pledge:', error);
      throw error;
    }
    
    return fetchPledgeById(id);
  } catch (error) {
    console.error('Error in updatePledge:', error);
    throw error;
  }
}

/**
 * Deletes a pledge
 */
export async function deletePledge(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('pledges')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting pledge:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deletePledge:', error);
    throw error;
  }
}
