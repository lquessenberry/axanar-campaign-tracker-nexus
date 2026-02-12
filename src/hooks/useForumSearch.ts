import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";
import { ForumCategory, ForumThread } from "./useForumThreads";

export const useForumSearch = (
  searchQuery: string,
  category: ForumCategory | null,
  sortBy: "new" | "hot" | "top",
) => {
  // Debounce search query to reduce unnecessary API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  return useQuery({
    queryKey: ["forum-search", debouncedSearchQuery, category, sortBy],
    queryFn: async () => {
      let query = supabase.from("forum_threads").select("*");

      // Search filter
      if (debouncedSearchQuery) {
        query = query.or(
          `title.ilike.%${debouncedSearchQuery}%,content.ilike.%${debouncedSearchQuery}%`,
        );
      }

      // Category filter
      if (category) {
        query = query.eq("category", category);
      }

      // Sorting
      switch (sortBy) {
        case "hot":
          query = query.order("like_count", { ascending: false });
          break;
        case "top":
          query = query.order("view_count", { ascending: false });
          break;
        case "new":
        default:
          query = query.order("created_at", { ascending: false });
      }

      // Always prioritize pinned posts
      query = query.order("is_pinned", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data as ForumThread[];
    },
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
};
