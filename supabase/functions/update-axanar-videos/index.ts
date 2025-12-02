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

// Delay helper with jitter
function delay(ms: number): Promise<void> {
  const jitter = Math.random() * 1000; // Add 0-1 second jitter
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
}

// Check if a URL is already archived on archive.today
async function checkArchiveExists(videoUrl: string, retries = 3): Promise<string | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const archiveLookupUrl = `https://archive.today/${encodeURIComponent(videoUrl)}`;
      const response = await fetch(archiveLookupUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        redirect: 'manual',
      });
      
      // Rate limited - back off exponentially
      if (response.status === 429) {
        const backoffMs = Math.pow(2, attempt) * 10000; // 10s, 20s, 40s
        console.log(`Rate limited on lookup, backing off ${backoffMs}ms...`);
        await delay(backoffMs);
        continue;
      }
      
      // If we get a redirect to an archive page, it exists
      if (response.status === 302 || response.status === 301) {
        const location = response.headers.get('location');
        if (location && (location.includes('archive.today') || location.includes('archive.ph') || location.includes('archive.is'))) {
          console.log(`Archive exists for ${videoUrl}: ${location}`);
          return location;
        }
      }
      
      // Also check if it returns 200 directly
      if (response.status === 200) {
        console.log(`Archive exists for ${videoUrl}: ${archiveLookupUrl}`);
        return archiveLookupUrl;
      }
      
      // No archive found
      return null;
    } catch (error) {
      console.error(`Error checking archive for ${videoUrl} (attempt ${attempt + 1}):`, error);
      if (attempt < retries - 1) {
        await delay(5000);
      }
    }
  }
  return null;
}

// Submit a URL to archive.today for archiving with exponential backoff
async function submitToArchive(videoUrl: string, retries = 3): Promise<string | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Submitting ${videoUrl} to archive.today (attempt ${attempt + 1})...`);
      
      const submitUrl = 'https://archive.today/submit/';
      const formData = new URLSearchParams();
      formData.append('url', videoUrl);
      
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        body: formData.toString(),
        redirect: 'manual',
      });
      
      console.log(`Archive submission response status: ${response.status}`);
      
      // Rate limited - back off exponentially
      if (response.status === 429) {
        const backoffMs = Math.pow(2, attempt) * 30000; // 30s, 60s, 120s
        console.log(`Rate limited on submit, backing off ${backoffMs}ms...`);
        await delay(backoffMs);
        continue;
      }
      
      // archive.today typically redirects to the archive page or a processing page
      const location = response.headers.get('location');
      if (location) {
        // Check if it's a valid archive URL (not just a redirect to submit page)
        if (location.includes('/wip/') || location.match(/archive\.(today|ph|is)\/[a-zA-Z0-9]+/)) {
          console.log(`Archive submitted for ${videoUrl}, location: ${location}`);
          return location;
        }
      }
      
      // If no redirect, try to get the URL from the response body
      if (response.status === 200) {
        const text = await response.text();
        const archiveMatch = text.match(/https:\/\/archive\.(today|ph|is)\/[a-zA-Z0-9]+/);
        if (archiveMatch) {
          console.log(`Archive created for ${videoUrl}: ${archiveMatch[0]}`);
          return archiveMatch[0];
        }
      }
      
      // Submission didn't work this time
      return null;
    } catch (error) {
      console.error(`Error submitting to archive for ${videoUrl} (attempt ${attempt + 1}):`, error);
      if (attempt < retries - 1) {
        await delay(10000);
      }
    }
  }
  return null;
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
  
  return newArchive;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for options
    let archiveMode = 'smart'; // 'smart', 'lookup-only', 'submit-only', 'skip'
    let batchSize = 10; // Process only this many unarchived videos per run
    let refreshPlaylists = true; // Whether to re-scrape YouTube
    
    try {
      const body = await req.json();
      if (body.archiveMode) archiveMode = body.archiveMode;
      if (body.batchSize) batchSize = parseInt(body.batchSize) || 10;
      if (body.refreshPlaylists !== undefined) refreshPlaylists = body.refreshPlaylists;
    } catch {
      // No body or invalid JSON, use defaults
    }

    console.log(`Starting Axanar video update - mode: ${archiveMode}, batch: ${batchSize}, refresh: ${refreshPlaylists}`);
    
    // Step 1: Get existing videos from database
    const { data: existingVideos, error: fetchError } = await supabase
      .from('axanar_videos')
      .select('video_id, archive_url');
    
    if (fetchError) {
      console.error('Error fetching existing videos:', fetchError);
    }
    
    const existingArchives = new Map<string, string | null>();
    for (const v of existingVideos || []) {
      existingArchives.set(v.video_id, v.archive_url);
    }
    console.log(`Found ${existingArchives.size} existing videos in database`);

    const allVideos = new Map<string, any>();

    // Step 2: Optionally refresh playlist data from YouTube
    if (refreshPlaylists) {
      console.log('Scraping YouTube playlists and streams...');
      
      // First, scrape the streams page for live/past streams
      console.log('Fetching streams page...');
      try {
        const streamsPage = await fetch(`https://www.youtube.com/@AxanarHQ/streams`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        });
        const streamsHtml = await streamsPage.text();
        
        // Extract ytInitialData from streams page
        const streamsDataMatch = streamsHtml.match(/var ytInitialData = ({.+?});<\/script>/s);
        if (streamsDataMatch) {
          try {
            const ytData = JSON.parse(streamsDataMatch[1]);
            // Navigate to the video grid in streams tab
            const tabs = ytData.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
            for (const tab of tabs) {
              const tabContent = tab.tabRenderer?.content?.richGridRenderer?.contents || [];
              for (const item of tabContent) {
                const video = item.richItemRenderer?.content?.videoRenderer;
                if (video && video.videoId) {
                  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
                  const existingArchiveUrl = existingArchives.get(video.videoId);
                  
                  allVideos.set(video.videoId, {
                    video_id: video.videoId,
                    video_url: videoUrl,
                    title: video.title?.runs?.[0]?.text || "Untitled Stream",
                    playlist_title: "Live Streams",
                    position: 0,
                    updated_at: new Date().toISOString(),
                    archive_url: existingArchiveUrl || null,
                  });
                }
              }
            }
            console.log(`Found streams, total videos now: ${allVideos.size}`);
          } catch (parseErr) {
            console.error('Error parsing streams data:', parseErr);
          }
        }
        await delay(1000); // Delay before fetching playlists
      } catch (streamsErr) {
        console.error('Error fetching streams page:', streamsErr);
      }
      
      // Then scrape playlists
      console.log('Fetching playlists page...');
      const channelPage = await fetch(`https://www.youtube.com/@AxanarHQ/playlists`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      const html = await channelPage.text();

      // Extract playlist IDs
      const playlistIds: string[] = [];
      const playlistRegex = /"playlistId":"(PL[A-Za-z0-9_-]{32,})"/g;
      for (const match of html.matchAll(playlistRegex)) {
        if (!playlistIds.includes(match[1])) {
          playlistIds.push(match[1]);
        }
      }

      console.log(`Found ${playlistIds.length} playlists`);

      // Fetch each playlist
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
        
        const titleMatch = playlistHtml.match(/<title>([^<]+)<\/title>/);
        const playlistTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'Unknown';
        
        const ytInitialDataMatch = playlistHtml.match(/var ytInitialData = ({.+?});<\/script>/s);
        
        if (ytInitialDataMatch) {
          try {
            const ytData = JSON.parse(ytInitialDataMatch[1]);
            const contents = ytData.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents?.[0]?.playlistVideoListRenderer?.contents;
            
            if (contents) {
              for (const item of contents) {
                const video = item.playlistVideoRenderer;
                if (video && video.videoId) {
                  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
                  // Preserve existing archive_url if we have one
                  const existingArchiveUrl = existingArchives.get(video.videoId);
                  
                  allVideos.set(video.videoId, {
                    video_id: video.videoId,
                    video_url: videoUrl,
                    title: video.title?.runs?.[0]?.text || "Untitled",
                    playlist_title: playlistTitle,
                    position: parseInt(video.index?.simpleText || "0"),
                    updated_at: new Date().toISOString(),
                    archive_url: existingArchiveUrl || null,
                  });
                }
              }
            }
          } catch (parseErr) {
            console.error(`JSON parse error for playlist ${playlistId}:`, parseErr);
          }
        }
        
        console.log(`Found videos in playlist "${playlistTitle}", total now: ${allVideos.size}`);
        await delay(500); // Small delay between playlist fetches
      }
    } else {
      // Just use existing videos from database
      for (const v of existingVideos || []) {
        allVideos.set(v.video_id, {
          video_id: v.video_id,
          archive_url: v.archive_url,
        });
      }
    }

    console.log(`Total videos to process: ${allVideos.size}`);

    // Step 3: Process archives based on mode
    let archiveSuccesses = 0;
    let archiveAttempts = 0;
    
    if (archiveMode !== 'skip') {
      // Find videos that need archiving (no archive_url yet)
      const videosToArchive = Array.from(allVideos.entries())
        .filter(([_, data]) => !data.archive_url)
        .slice(0, batchSize); // Limit to batch size
      
      console.log(`Found ${videosToArchive.length} videos to archive (batch limit: ${batchSize})`);
      
      for (const [videoId, videoData] of videosToArchive) {
        archiveAttempts++;
        console.log(`Processing archive ${archiveAttempts}/${videosToArchive.length}: ${videoId}`);
        
        let archiveUrl: string | null = null;
        
        switch (archiveMode) {
          case 'lookup-only':
            archiveUrl = await checkArchiveExists(videoData.video_url);
            await delay(2000); // 2 second delay for lookups
            break;
          case 'submit-only':
            archiveUrl = await submitToArchive(videoData.video_url);
            await delay(45000); // 45 second delay between submissions
            break;
          case 'smart':
          default:
            archiveUrl = await getOrCreateArchive(videoData.video_url);
            await delay(30000); // 30 second delay for smart mode
            break;
        }
        
        if (archiveUrl) {
          videoData.archive_url = archiveUrl;
          archiveSuccesses++;
          
          // Immediately update this video in the database
          const { error: updateError } = await supabase
            .from('axanar_videos')
            .update({ archive_url: archiveUrl, updated_at: new Date().toISOString() })
            .eq('video_id', videoId);
          
          if (updateError) {
            console.error(`Failed to update archive_url for ${videoId}:`, updateError);
          } else {
            console.log(`✓ Saved archive_url for ${videoId}`);
          }
        }
      }
    }

    // Step 4: Upsert all video metadata (if we refreshed playlists)
    if (refreshPlaylists) {
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
    }

    const totalArchived = Array.from(allVideos.values()).filter(r => r.archive_url).length;
    const pendingCount = allVideos.size - totalArchived;

    return new Response(JSON.stringify({
      success: true,
      videos_total: allVideos.size,
      videos_archived: totalArchived,
      videos_pending: pendingCount,
      batch_attempted: archiveAttempts,
      batch_succeeded: archiveSuccesses,
      archive_mode: archiveMode,
      message: archiveMode === 'skip' 
        ? 'Playlist data refreshed without archiving' 
        : `Processed ${archiveAttempts} videos, ${archiveSuccesses} archived successfully. ${pendingCount} still pending.`,
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
