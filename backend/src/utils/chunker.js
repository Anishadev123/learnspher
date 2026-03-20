export function chunkText(text, chunkSize = 1500, overlap = 300) {
const chunks = []
let start = 0
while (start < text.length) {
const end = Math.min(start + chunkSize, text.length)
const chunk = text.slice(start, end)
chunks.push(chunk.trim())
if (end === text.length) break
start = Math.max(0, end - overlap)
}
return chunks
}
