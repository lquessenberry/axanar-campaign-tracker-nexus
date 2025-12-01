import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Axanar video scrape...");
    const allVideos = new Map<string, any>();

    // Step 1: Get the channel page to find playlist IDs
    const channelPage = await fetch(`https://www.youtube.com/@AxanarHQ/playlists`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await channelPage.text();

    // Extract playlist IDs from the page HTML
    const playlistIds: string[] = [];
    const playlistRegex = /"playlistId":"(PL[A-Za-z0-9_-]{32,})"/g;
    for (const match of html.matchAll(playlistRegex)) {
      if (!playlistIds.includes(match[1])) {
        playlistIds.push(match[1]);
      }
    }

    console.log(`Found ${playlistIds.length} playlists`);

    // Step 2: Fetch each playlist page and extract videos
    for (const playlistId of playlistIds) {
      console.log(`Fetching playlist: ${playlistId}`);
      
      const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
      const playlistResp = await fetch(playlistUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      
      const playlistHtml = await playlistResp.text();
      
      // Extract title
      const titleMatch = playlistHtml.match(/<title>([^<]+)<\/title>/);
      const playlistTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'Unknown';
      
      // Try to find ytInitialData
      const ytInitialDataMatch = playlistHtml.match(/var ytInitialData = ({.+?});<\/script>/s);
      
      if (ytInitialDataMatch) {
        try {
          const ytData = JSON.parse(ytInitialDataMatch[1]);
          
          // Navigate to playlist content
          const contents = ytData.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;
          
          if (contents) {
            for (const item of contents) {
              const video = item.playlistVideoRenderer;
              if (video && video.videoId) {
                allVideos.set(video.videoId, {
                  video_id: video.videoId,
                  video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
                  title: video.title?.runs?.[0]?.text || "Untitled",
                  playlist_title: playlistTitle,
                  position: parseInt(video.index?.simpleText || "0"),
                  updated_at: new Date().toISOString(),
                });
              }
            }
          }
          
        } catch (parseErr) {
          console.error(`JSON parse error for playlist ${playlistId}:`, parseErr);
        }
      }
      
      console.log(`Found videos in playlist "${playlistTitle}", total now: ${allVideos.size}`);
    }

    console.log(`Collected ${allVideos.size} unique videos`);

    // Step 3: Upsert into Supabase
    const rows = Array.from(allVideos.values());
    if (rows.length > 0) {
      const { error } = await supabase
        .from("axanar_videos")
        .upsert(rows, { onConflict: "video_id" });

      if (error) {
        console.error("Supabase upsert failed:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      playlists_found: playlistIds.length,
      videos_collected: allVideos.size,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
