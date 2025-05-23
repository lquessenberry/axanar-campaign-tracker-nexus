
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  goal_amount: number;
  current_amount: number;
  backers_count: number;
  status: string;
  end_date: string;
  featured: boolean;
  creator_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
  } | null;
}

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          profiles:creator_id (
            username,
            full_name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
  });
};

export const useFeaturedCampaign = () => {
  return useQuery({
    queryKey: ['featured-campaign'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          profiles:creator_id (
            username,
            full_name
          )
        `)
        .eq('featured', true)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (error) throw error;
      return data as Campaign;
    },
  });
};
