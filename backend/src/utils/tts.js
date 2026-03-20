// Real Text-To-Speech using OpenAI Audio API
// Requires OPENAI_API_KEY in .env

import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { uploadToCloudinary } from "./cloudinary.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function textToSpeechAndStore(text, notebookId) {
  const filename = `audio_${notebookId}_${Date.now()}.mp3`
  const outPath = path.join('/tmp', filename)

  // Generate speech from OpenAI
  const speech = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "alloy",      // default OpenAI voice
    input: text
  })

  // Convert to buffer and save
  const buffer = Buffer.from(await speech.arrayBuffer())
  fs.writeFileSync(outPath, buffer)

const upload = await uploadToCloudinary(outPath, "audio");
return upload.url;
}
