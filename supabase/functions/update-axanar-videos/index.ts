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

// Fetch actual publish date from video page
async function fetchVideoPublishDate(videoId: string, debug = false): Promise<string | null> {
  try {
    const resp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const html = await resp.text();
    
    if (debug) {
      // Log all date-like patterns we find
      const datePatterns = html.match(/"(date|publish|upload)[^"]*"\s*:\s*"[^"]+"/gi);
      console.log(`Debug ${videoId} - date patterns found:`, datePatterns?.slice(0, 10));
    }
    
    // Pattern 1: "datePublished":"2024-01-15"
    const datePublished = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
    if (datePublished) {
      return new Date(datePublished[1]).toISOString();
    }
    
    // Pattern 2: "uploadDate":"2024-01-15"
    const uploadDate = html.match(/"uploadDate"\s*:\s*"([^"]+)"/);
    if (uploadDate) {
      return new Date(uploadDate[1]).toISOString();
    }
    
    // Pattern 3: "publishDate":"2024-01-15T..."
    const publishDate = html.match(/"publishDate"\s*:\s*"([^"]+)"/);
    if (publishDate) {
      return new Date(publishDate[1]).toISOString();
    }
    
    // Pattern 4: Look in ytInitialPlayerResponse
    const playerMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/s);
    if (playerMatch) {
      try {
        const playerData = JSON.parse(playerMatch[1]);
        const microformat = playerData?.microformat?.playerMicroformatRenderer;
        if (microformat?.publishDate) {
          return new Date(microformat.publishDate).toISOString();
        }
        if (microformat?.uploadDate) {
          return new Date(microformat.uploadDate).toISOString();
        }
      } catch (e) {
        // ignore parse errors
      }
    }
    
    return null;
  } catch (e) {
    console.error(`Error fetching date for ${videoId}:`, e);
    return null;
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
                  published_at: null,
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

    console.log(`Collected ${allVideos.size} unique videos, now fetching publish dates...`);

    // Step 3: Test with ONE video first to debug
    const videoIds = Array.from(allVideos.keys());
    if (videoIds.length > 0) {
      console.log(`Testing date fetch on first video: ${videoIds[0]}`);
      const testDate = await fetchVideoPublishDate(videoIds[0], true);
      console.log(`Test result: ${testDate}`);
    }

    // Step 4: Fetch dates in batches
    const batchSize = 10;
    let datesFound = 0;
    
    for (let i = 0; i < videoIds.length; i += batchSize) {
      const batch = videoIds.slice(i, i + batchSize);
      console.log(`Fetching dates batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(videoIds.length/batchSize)}`);
      
      const dateResults = await Promise.all(batch.map(async (videoId) => {
        const date = await fetchVideoPublishDate(videoId);
        return { videoId, date };
      }));
      
      for (const { videoId, date } of dateResults) {
        if (date) {
          const video = allVideos.get(videoId);
          if (video) {
            video.published_at = date;
            datesFound++;
          }
        }
      }
      
      if (i + batchSize < videoIds.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`Got publish dates for ${datesFound}/${videoIds.length} videos`);

    // Step 5: Upsert into Supabase
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
      videos_with_dates: datesFound,
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
