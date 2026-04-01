// YouTube transcript extraction with fallback support
// Primary: youtubei.js | Fallback: direct InnerTube API fetch

import { Innertube } from 'youtubei.js';

let youtube = null;

async function getInnertube() {
  if (!youtube) {
    youtube = await Innertube.create();
  }
  return youtube;
}

// ✅ Proper video ID extraction — handles all YouTube URL formats
function extractVideoId(urlOrId) {
  if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;

  try {
    const url = new URL(urlOrId);
    if (url.searchParams.has('v')) return url.searchParams.get('v');
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0];
    const embedMatch = url.pathname.match(/\/embed\/([\w-]{11})/);
    if (embedMatch) return embedMatch[1];
  } catch (_) {
    const match = urlOrId.match(/([\w-]{11})/);
    if (match) return match[1];
  }

  return urlOrId;
}

// ✅ Fallback: Direct InnerTube API call (no external package needed)
async function fallbackTranscript(videoId) {
  try {
    console.log("🔄 Trying direct InnerTube API fallback for:", videoId);

    // Step 1: Get caption tracks via InnerTube player API
    const playerRes = await fetch(
      "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14)",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "ANDROID",
              clientVersion: "20.10.38",
            },
          },
          videoId,
        }),
      }
    );

    if (!playerRes.ok) {
      throw new Error(`Player API returned ${playerRes.status}`);
    }

    const playerData = await playerRes.json();
    const captionTracks =
      playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
      throw new Error("No caption tracks available");
    }

    // Step 2: Fetch the transcript XML from the first track
    const trackUrl = captionTracks[0].baseUrl;
    const trackRes = await fetch(trackUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36",
      },
    });

    if (!trackRes.ok) {
      throw new Error(`Track fetch returned ${trackRes.status}`);
    }

    const xml = await trackRes.text();

    // Step 3: Parse the XML transcript
    const lines = [];
    // Try new format first: <p t="offset" d="duration">...<s>text</s>...</p>
    const pRegex = /<p\s+t="(\d+)"\s+d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    let match;
    while ((match = pRegex.exec(xml)) !== null) {
      const innerHtml = match[3];
      // Extract text from <s> tags or raw text
      const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
      let text = "";
      let sMatch;
      while ((sMatch = sRegex.exec(innerHtml)) !== null) {
        text += sMatch[1];
      }
      if (!text) text = innerHtml.replace(/<[^>]+>/g, "");
      text = decodeEntities(text).trim();
      if (text) lines.push(text);
    }

    // Fallback: old format <text start="..." dur="...">content</text>
    if (lines.length === 0) {
      const textRegex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
      while ((match = textRegex.exec(xml)) !== null) {
        const text = decodeEntities(match[3]).trim();
        if (text) lines.push(text);
      }
    }

    if (lines.length === 0) {
      throw new Error("Could not parse transcript XML");
    }

    console.log("✅ Transcript fetched via InnerTube API, lines:", lines.length);
    return lines;
  } catch (err) {
    console.error("❌ InnerTube API fallback failed:", err.message);
    return null;
  }
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) =>
      String.fromCodePoint(parseInt(dec, 10))
    );
}

export async function getYoutubeTranscript(urlOrId) {
  const id = extractVideoId(urlOrId);
  console.log("🎥 Extracted YouTube video ID:", id, "from:", urlOrId);

  // Primary: youtubei.js
  try {
    const yt = await getInnertube();
    const info = await yt.getInfo(id);
    const transcriptData = await info.getTranscript();

    if (!transcriptData || !transcriptData.transcript) {
      throw new Error("No transcript available via youtubei.js");
    }

    const lines = transcriptData.transcript.content.body.initial_segments.map(
      (seg) => seg.snippet.text
    );

    console.log("✅ Transcript fetched via youtubei.js, lines:", lines.length);
    return lines;
  } catch (err) {
    console.warn("⚠️ youtubei.js failed:", err.message);
    return await fallbackTranscript(id);
  }
}
