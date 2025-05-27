import { createClient } from '@supabase/supabase-js';

// Get environment variables from Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || import.meta.env.SUPABASE_SERVICE_KEY;

// Create Supabase client with service role key to bypass RLS
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Key is missing. Please check your .env file.');
  // Depending on your setup, you might want to throw an error here
  // or ensure createClient handles undefined values gracefully.
  // For now, we'll use non-null assertions assuming they should be present.
}
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// Define valid sortable columns and order directions
export type SortableDonorColumns = 'email' | 'first_name' | 'last_name' | 'donor_name' | 'full_name' | 'last_login' | 'created_at' | 'pledge_count' | 'total_donated';
export type SortOrder = 'asc' | 'desc';

// Function to fetch donors with pagination, search, and sorting
export async function fetchDonors(
  page: number, 
  pageSize: number, 
  searchQuery?: string,
  sortBy: SortableDonorColumns = 'total_donated', // Default sort column
  sortOrder: SortOrder = 'desc' // Default sort order
) {
  console.log('Server-side donor fetch:', { page, pageSize, searchQuery, sortBy, sortOrder });
  try {
    // STEP 1: Get ALL basic donor profiles matching the search query (no initial pagination here)
    let donorsQuery = supabase
      .from('donors')
      .select('id, email, first_name, last_name, donor_name, full_name, last_login, created_at, updated_at', { count: 'exact' }); // count: 'exact' for total potential donors

    if (searchQuery) {
      donorsQuery = donorsQuery.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,donor_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    // Execute query to get all matching donors and the total count
    const { data: allMatchingDonors, error: donorsError, count: totalCount } = await donorsQuery;

    if (donorsError) {
      console.error('Error fetching all matching donor profiles:', donorsError);
      throw donorsError;
    }

    if (!allMatchingDonors || allMatchingDonors.length === 0) {
      console.log('No donors found for the current query.');
      return { data: [], count: 0 }; // Return 0 for count if no donors match query
    }

    console.log(`Fetched ${allMatchingDonors.length} total matching basic donor profiles.`);

    const donorIds = allMatchingDonors.map(donor => donor.id);

    // STEP 2: Get pledge counts from the pledge_count_by_donor view for all matching donors
    const { data: pledgeCountsData, error: pledgeCountError } = await supabase
      .from('pledge_count_by_donor')
      .select('donor_id, count')
      .in('donor_id', donorIds);

    if (pledgeCountError) {
      console.error('Error fetching pledge counts:', pledgeCountError);
      // Continue, counts will default to 0
    }

    const pledgeCountMap = new Map<string, number>();
    if (pledgeCountsData) {
      pledgeCountsData.forEach(item => {
        pledgeCountMap.set(item.donor_id, Number(item.count) || 0);
      });
    }
    console.log(`Fetched pledge counts for ${pledgeCountMap.size} donors out of ${allMatchingDonors.length} matching.`);

    // STEP 3: Get pre-summed total donations from the pledges_by_donor view
    // This assumes 'pledges_by_donor' view now has 'donor_id' and 'total_donated'
    const { data: pledgeTotalsData, error: pledgeTotalError } = await supabase
      .from('pledges_by_donor') // This view should now provide pre-summed totals
      .select('donor_id, total_donated') // Expecting 'total_donated' directly from the view
      .in('donor_id', donorIds);

    if (pledgeTotalError) {
      console.error('Error fetching pledge totals:', pledgeTotalError);
      // Continue, totals will default to 0
    }

    const pledgeTotalMap = new Map<string, number>();
    if (pledgeTotalsData) {
      pledgeTotalsData.forEach(item => {
        // Ensure 'total_donated' is treated as a number
        pledgeTotalMap.set(item.donor_id, Number(item.total_donated) || 0);
      });
    }
    console.log(`Fetched pledge totals for ${pledgeTotalMap.size} donors out of ${allMatchingDonors.length} matching.`);

    // STEP 4: Combine donor profiles with their pledge stats
    const enhancedDonors = allMatchingDonors.map(donor => ({
      ...donor,
      pledge_count: pledgeCountMap.get(donor.id) || 0,
      total_donated: pledgeTotalMap.get(donor.id) || 0,
    }));

    // STEP 5: Sort the enhanced donors
    enhancedDonors.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle null or undefined values for sorting, typically placing them at the end or beginning
      if (valA == null) valA = sortBy === 'total_donated' || sortBy === 'pledge_count' ? (sortOrder === 'asc' ? Infinity : -Infinity) : '';
      if (valB == null) valB = sortBy === 'total_donated' || sortBy === 'pledge_count' ? (sortOrder === 'asc' ? Infinity : -Infinity) : '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      } else {
        // Fallback for mixed types or other types - convert to string for comparison
        return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      }
    });

    console.log(`Sorted ${enhancedDonors.length} donors by ${sortBy} ${sortOrder}.`);

    // STEP 6: Apply pagination to the sorted list
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const paginatedDonors = enhancedDonors.slice(from, to);

    console.log(`Returning page ${page} with ${paginatedDonors.length} donors. Total matching donors: ${totalCount || allMatchingDonors.length}`);
    
    // Log a few samples to verify sorting and pagination
    paginatedDonors.slice(0, 3).forEach(d => console.log(`- ${d.email}, Pledges: ${d.pledge_count}, Total: $${d.total_donated.toFixed(2)}`));

    return { data: paginatedDonors, count: totalCount || allMatchingDonors.length }; // Return total count of all matching donors for pagination UI

  } catch (error) {
    console.error('Unhandled error in fetchDonors:', error);
    // Ensure a consistent return type on error for the calling UI
    return { data: [], count: 0 };
  }
}

// Function to fetch a single donor by ID
export async function fetchDonorById(donorId: string) {
  console.log('Server-side donor fetch by ID:', donorId);
  try {
    const { data, error } = await supabase
      .from('donors')
      .select('id, email, first_name, last_name, donor_name, full_name, last_login, created_at, updated_at') // Customize fields as needed
      .eq('id', donorId)
      .single(); // .single() expects exactly one row or throws an error

    if (error) {
      console.error('Supabase error fetching donor by ID:', error);
      // PostgREST error 'PGRST116' means 0 rows were found, which .single() treats as an error.
      if (error.code === 'PGRST116') {
        console.log(`No donor found with ID: ${donorId}`);
        return null; // Return null if donor not found
      }
      throw error; // Re-throw other errors
    }

    // Note: If .single() is used and no row is found, it throws an error (PGRST116).
    // So, an explicit `if (!data)` check after a successful .single() call is usually redundant
    // unless you've configured Supabase client differently or are not using .single().
    // However, it doesn't hurt as a safeguard.
    if (!data) {
        console.log(`No donor found with ID (fallback check): ${donorId}`);
        return null;
    }
    
    // TODO: Optionally, fetch and attach pledge details for this single donor
    // This would involve querying 'pledge_count_by_donor' and 'pledges_by_donor'
    // similar to the logic in fetchDonors, but filtered for this single donorId.
    // For example:
    // const { data: countData } = await supabase.from('pledge_count_by_donor').select('count').eq('donor_id', donorId).single();
    // const { data: totalData } = await supabase.from('pledges_by_donor').select('amount').eq('donor_id', donorId); // Sum these amounts
    // data.pledge_count = countData ? countData.count : 0;
    // data.total_donated = /* sum of amounts from totalData */;


    console.log(`Successfully fetched donor: ${data.email}`);
    return data;

  } catch (error) {
    // Catch errors from .single() if no row is found, or other Supabase/network errors
    console.error('Error in fetchDonorById:', error);
    // If it's a PostgrestError and code is PGRST116, it means not found.
    // You might have already handled this above, but this is a final catch.
    if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        console.log(`No donor found with ID (error catch): ${donorId}`);
        return null;
    }
    throw error; // Re-throw other errors to be handled by the caller
  }
}
