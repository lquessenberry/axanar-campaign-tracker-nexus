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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Axanar video scrape...");
    const allVideos = new Map<string, any>();

    // Step 1: Get every playlist ID belonging to the channel
    const playlistPage = await fetch(`https://www.youtube.com/@AxanarHQ/playlists`);
    const html = await playlistPage.text();

    const playlistIds: string[] = [];
    const playlistRegex = /"playlistId":"(PL[^\"]{32,})"/g;
    for (const match of html.matchAll(playlistRegex)) {
      if (!playlistIds.includes(match[1])) {
        playlistIds.push(match[1]);
      }
    }

    console.log(`Found ${playlistIds.length} playlists`);

    // Step 2: Walk every playlist and pull every video
    for (const playlistId of playlistIds) {
      let continuation: string | null = null;
      let playlistTitle = "Unknown Playlist";

      do {
        const body = {
          context: {
            client: { clientName: "WEB", clientVersion: "2.20241201.00.00" },
          },
          ...(continuation ? { continuation } : { playlistId }),
        };

        const resp = await fetch(
          "https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        const data = await resp.json();

        // Grab playlist title on first page
        if (!continuation) {
          const header = data.header?.playlistHeaderRenderer;
          if (header) playlistTitle = header.title?.runs?.[0]?.text || "Unknown Playlist";
        }

        const items = data.onResponseReceivedActions?.[0]
          ?.appendContinuationItemsAction?.continuationItems
          || data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents
          || [];

        for (const item of items) {
          const video = item.playlistVideoRenderer;
          if (!video || !video.videoId) continue;

          const videoId = video.videoId;
          const title = video.title?.runs?.[0]?.text || "Untitled";

          allVideos.set(videoId, {
            video_id: videoId,
            video_url: `https://www.youtube.com/watch?v=${videoId}`,
            title,
            playlist_title: playlistTitle,
            position: video.index?.simpleText ? parseInt(video.index.simpleText) : 0,
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        // Get next continuation token
        continuation = items?.slice(-1)[0]
          ?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token
          || null;

      } while (continuation);
    }

    console.log(`Collected ${allVideos.size} unique videos`);

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

    // Return JSON summary
    return new Response(JSON.stringify({
      success: true,
      playlists_found: playlistIds.length,
      videos_collected: allVideos.size,
      videos: rows.slice(0, 10), // Return first 10 as sample
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
