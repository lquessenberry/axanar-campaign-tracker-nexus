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

// Check if a URL is already archived on archive.today
async function checkArchiveExists(videoUrl: string): Promise<string | null> {
  try {
    const archiveLookupUrl = `https://archive.today/${encodeURIComponent(videoUrl)}`;
    const response = await fetch(archiveLookupUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'manual', // Don't follow redirects automatically
    });
    
    // If we get a redirect to an archive page, it exists
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      if (location && location.includes('archive.today')) {
        console.log(`Archive exists for ${videoUrl}: ${location}`);
        return location;
      }
    }
    
    // Also check if it returns 200 directly (sometimes archive.today does this)
    if (response.status === 200) {
      console.log(`Archive exists for ${videoUrl}: ${archiveLookupUrl}`);
      return archiveLookupUrl;
    }
    
    return null;
  } catch (error) {
    console.error(`Error checking archive for ${videoUrl}:`, error);
    return null;
  }
}

// Submit a URL to archive.today for archiving
async function submitToArchive(videoUrl: string): Promise<string | null> {
  try {
    console.log(`Submitting ${videoUrl} to archive.today...`);
    
    // archive.today uses a form submission
    const submitUrl = 'https://archive.today/submit/';
    const formData = new URLSearchParams();
    formData.append('url', videoUrl);
    
    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      redirect: 'manual',
    });
    
    // archive.today typically redirects to the archive page or a processing page
    const location = response.headers.get('location');
    if (location) {
      console.log(`Archive submitted for ${videoUrl}, location: ${location}`);
      return location;
    }
    
    // If no redirect, try to get the URL from the response
    if (response.status === 200) {
      const text = await response.text();
      // Look for the archive URL in the response
      const archiveMatch = text.match(/https:\/\/archive\.today\/[a-zA-Z0-9]+/);
      if (archiveMatch) {
        console.log(`Archive created for ${videoUrl}: ${archiveMatch[0]}`);
        return archiveMatch[0];
      }
    }
    
    console.log(`Archive submission response status: ${response.status}`);
    return null;
  } catch (error) {
    console.error(`Error submitting to archive for ${videoUrl}:`, error);
    return null;
  }
}

// Smart archive: lookup first, submit if missing
async function getOrCreateArchive(videoUrl: string): Promise<string | null> {
  // First, check if archive already exists
  const existingArchive = await checkArchiveExists(videoUrl);
  if (existingArchive) {
    return existingArchive;
  }
  
  // If not archived, submit for archiving
  console.log(`No archive found for ${videoUrl}, submitting...`);
  const newArchive = await submitToArchive(videoUrl);
  
  // Small delay to be respectful to archive.today
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return newArchive;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for options
    let archiveMode = 'smart'; // Default to smart mode
    try {
      const body = await req.json();
      if (body.archiveMode) {
        archiveMode = body.archiveMode; // 'smart', 'lookup-only', 'submit-only', 'skip'
      }
    } catch {
      // No body or invalid JSON, use defaults
    }

    console.log(`Starting Axanar video scrape with archive mode: ${archiveMode}...`);
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
                const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
                allVideos.set(video.videoId, {
                  video_id: video.videoId,
                  video_url: videoUrl,
                  title: video.title?.runs?.[0]?.text || "Untitled",
                  playlist_title: playlistTitle,
                  position: parseInt(video.index?.simpleText || "0"),
                  updated_at: new Date().toISOString(),
                  archive_url: null, // Will be populated later if archiving is enabled
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

    // Step 3: Process archives based on mode
    if (archiveMode !== 'skip') {
      console.log(`Processing archives in ${archiveMode} mode...`);
      let processed = 0;
      
      for (const [videoId, videoData] of allVideos) {
        processed++;
        console.log(`Processing archive ${processed}/${allVideos.size}: ${videoId}`);
        
        let archiveUrl: string | null = null;
        
        switch (archiveMode) {
          case 'lookup-only':
            archiveUrl = await checkArchiveExists(videoData.video_url);
            break;
          case 'submit-only':
            archiveUrl = await submitToArchive(videoData.video_url);
            // Add delay between submissions
            await new Promise(resolve => setTimeout(resolve, 3000));
            break;
          case 'smart':
          default:
            archiveUrl = await getOrCreateArchive(videoData.video_url);
            break;
        }
        
        if (archiveUrl) {
          videoData.archive_url = archiveUrl;
        }
        
        // Rate limiting to be respectful
        if (archiveMode !== 'lookup-only') {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Step 4: Upsert into Supabase
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

    const archivedCount = rows.filter(r => r.archive_url).length;

    return new Response(JSON.stringify({
      success: true,
      playlists_found: playlistIds.length,
      videos_collected: allVideos.size,
      videos_archived: archivedCount,
      archive_mode: archiveMode,
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
