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

// Helper to recursively find all video objects in nested JSON
function findVideos(obj: any, videos: Map<string, any>, playlistTitle: string): void {
  if (!obj || typeof obj !== 'object') return;
  
  // Check if this object is a video renderer
  if (obj.videoId && obj.title) {
    const videoId = obj.videoId;
    const title = obj.title?.runs?.[0]?.text || obj.title?.simpleText || obj.title || "Untitled";
    
    if (!videos.has(videoId)) {
      videos.set(videoId, {
        video_id: videoId,
        video_url: `https://www.youtube.com/watch?v=${videoId}`,
        title: typeof title === 'string' ? title : "Untitled",
        playlist_title: playlistTitle,
        position: videos.size,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    return;
  }
  
  // Recursively search arrays and objects
  if (Array.isArray(obj)) {
    for (const item of obj) {
      findVideos(item, videos, playlistTitle);
    }
  } else {
    for (const key of Object.keys(obj)) {
      findVideos(obj[key], videos, playlistTitle);
    }
  }
}

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

    console.log(`Found ${playlistIds.length} playlists: ${playlistIds.join(', ')}`);

    // Step 2: For each playlist, fetch videos directly from playlist page
    for (const playlistId of playlistIds) {
      try {
        console.log(`Fetching playlist: ${playlistId}`);
        
        const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
        const playlistResp = await fetch(playlistUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        });
        
        const playlistHtml = await playlistResp.text();
        
        // Extract playlist title
        const titleMatch = playlistHtml.match(/<title>([^<]+)<\/title>/);
        let playlistTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'Unknown Playlist';
        
        // Extract initial data JSON from the page
        const ytInitialDataMatch = playlistHtml.match(/var ytInitialData = ({.+?});<\/script>/s);
        
        if (ytInitialDataMatch) {
          try {
            const ytData = JSON.parse(ytInitialDataMatch[1]);
            findVideos(ytData, allVideos, playlistTitle);
            console.log(`Found videos in playlist "${playlistTitle}", total now: ${allVideos.size}`);
          } catch (parseErr) {
            console.error(`Failed to parse ytInitialData for ${playlistId}:`, parseErr);
          }
        } else {
          // Fallback: extract video IDs directly from HTML
          const videoIdRegex = /\/watch\?v=([a-zA-Z0-9_-]{11})(?:&amp;|&)list=/g;
          let match;
          while ((match = videoIdRegex.exec(playlistHtml)) !== null) {
            const videoId = match[1];
            if (!allVideos.has(videoId)) {
              allVideos.set(videoId, {
                video_id: videoId,
                video_url: `https://www.youtube.com/watch?v=${videoId}`,
                title: null, // Will need to be fetched separately
                playlist_title: playlistTitle,
                position: allVideos.size,
                published_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
          console.log(`Fallback extraction for "${playlistTitle}", total now: ${allVideos.size}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
        
      } catch (playlistErr) {
        console.error(`Error fetching playlist ${playlistId}:`, playlistErr);
      }
    }

    console.log(`Collected ${allVideos.size} unique videos total`);

    // Step 3: Upsert everything into Supabase
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
      videos: rows.slice(0, 10),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in update-axanar-videos:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
