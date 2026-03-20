// Real YouTube transcript implementation using 'youtubei.js'
// Supports auto-generated captions and is more robust.

import { Innertube } from 'youtubei.js';

let youtube = null;

async function getInnertube() {
  if (!youtube) {
    youtube = await Innertube.create();
  }
  return youtube;
}

export async function getYoutubeTranscript(urlOrId) {
  // extract video id
  const idMatch = urlOrId.match(/([\w-]{11})$/);
  const id = idMatch ? idMatch[1] : urlOrId;

  try {
    const yt = await getInnertube();
    const info = await yt.getInfo(id);

    const transcriptData = await info.getTranscript();

    if (!transcriptData || !transcriptData.transcript) {
      throw new Error("No transcript available");
    }

    // specific to youtubei.js (Innertube) structure
    const lines = transcriptData.transcript.content.body.initial_segments.map(
      (seg) => seg.snippet.text
    );

    return lines;
  } catch (err) {
    console.error("YouTube transcript error:", err.message);
    return null;
  }
}
