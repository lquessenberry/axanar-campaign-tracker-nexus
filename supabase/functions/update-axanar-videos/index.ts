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
    console.log("Starting Axanar video scrape - DEBUG MODE...");
    const allVideos = new Map<string, any>();
    const debugInfo: any = { playlists: [] };

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

    // Just fetch ONE playlist for debugging
    if (playlistIds.length > 0) {
      const playlistId = playlistIds[0];
      console.log(`DEBUG: Fetching first playlist: ${playlistId}`);
      
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
          
          // Log the top-level keys
          console.log("ytInitialData top-level keys:", Object.keys(ytData));
          
          // Try to navigate to playlist content
          const contents = ytData.contents;
          if (contents) {
            console.log("contents keys:", Object.keys(contents));
            
            const twoColumn = contents.twoColumnBrowseResultsRenderer;
            if (twoColumn) {
              console.log("twoColumnBrowseResultsRenderer keys:", Object.keys(twoColumn));
              
              const tabs = twoColumn.tabs;
              if (tabs && tabs[0]) {
                const tabContent = tabs[0].tabRenderer?.content;
                if (tabContent) {
                  console.log("tab content keys:", Object.keys(tabContent));
                  
                  const sectionList = tabContent.sectionListRenderer;
                  if (sectionList) {
                    console.log("sectionListRenderer keys:", Object.keys(sectionList));
                    
                    const sectionContents = sectionList.contents;
                    if (sectionContents && sectionContents[0]) {
                      console.log("first section keys:", Object.keys(sectionContents[0]));
                      
                      const itemSection = sectionContents[0].itemSectionRenderer;
                      if (itemSection) {
                        console.log("itemSectionRenderer keys:", Object.keys(itemSection));
                        
                        const itemContents = itemSection.contents;
                        if (itemContents && itemContents[0]) {
                          console.log("first item keys:", Object.keys(itemContents[0]));
                          
                          const playlistVideoList = itemContents[0].playlistVideoListRenderer;
                          if (playlistVideoList) {
                            console.log("playlistVideoListRenderer keys:", Object.keys(playlistVideoList));
                            
                            const videos = playlistVideoList.contents;
                            if (videos) {
                              console.log(`Found ${videos.length} video items`);
                              
                              // Log first video structure
                              if (videos[0]) {
                                console.log("First video item keys:", Object.keys(videos[0]));
                                const firstVideo = videos[0].playlistVideoRenderer;
                                if (firstVideo) {
                                  console.log("playlistVideoRenderer keys:", Object.keys(firstVideo));
                                  console.log("First video data:", JSON.stringify(firstVideo).slice(0, 500));
                                  
                                  // Extract all videos
                                  for (const item of videos) {
                                    const video = item.playlistVideoRenderer;
                                    if (video && video.videoId) {
                                      allVideos.set(video.videoId, {
                                        video_id: video.videoId,
                                        video_url: `https://www.youtube.com/watch?v=${video.videoId}`,
                                        title: video.title?.runs?.[0]?.text || "Untitled",
                                        playlist_title: playlistTitle,
                                        position: parseInt(video.index?.simpleText || "0"),
                                        published_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                      });
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          
          debugInfo.ytDataKeys = Object.keys(ytData);
          debugInfo.hasContents = !!ytData.contents;
          
        } catch (parseErr) {
          console.error("JSON parse error:", parseErr);
          debugInfo.parseError = parseErr.message;
        }
      } else {
        console.log("No ytInitialData found in page");
        
        // Show a sample of the HTML to see what we got
        const htmlSample = playlistHtml.slice(0, 2000);
        console.log("HTML sample:", htmlSample);
        
        debugInfo.noYtInitialData = true;
        debugInfo.htmlLength = playlistHtml.length;
        debugInfo.htmlSample = htmlSample;
      }
    }

    console.log(`Collected ${allVideos.size} unique videos`);

    // Upsert if we found any
    const rows = Array.from(allVideos.values());
    if (rows.length > 0) {
      const { error } = await supabase
        .from("axanar_videos")
        .upsert(rows, { onConflict: "video_id" });

      if (error) {
        console.error("Supabase upsert failed:", error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      playlists_found: playlistIds.length,
      playlist_ids: playlistIds,
      videos_collected: allVideos.size,
      videos: rows.slice(0, 5),
      debug: debugInfo,
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
