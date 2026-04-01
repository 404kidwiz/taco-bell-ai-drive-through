/**
 * Client-side streaming fetch utility.
 * Reads a text stream from the API and calls onChunk for each piece of text.
 * Returns the full accumulated text when done.
 */
export async function fetchStream(
  url: string,
  body: Record<string, unknown>,
  onChunk: (text: string) => void,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Fetch failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;
    onChunk(fullText);
  }

  return fullText;
}

/**
 * Streaming fetch with sentence-level callbacks for voice TTS.
 * Buffers the stream and fires onSentence when a sentence boundary is detected.
 */
export async function fetchStreamSentences(
  url: string,
  body: Record<string, unknown>,
  onSentence: (sentence: string) => void,
  onChunk?: (fullTextSoFar: string) => void,
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Fetch failed: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  // Sentence boundary regex — matches . ! ? followed by space or end
  const sentenceEnd = /[.!?]+\s/;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // Flush remaining buffer
      if (buffer.trim()) {
        onSentence(buffer.trim());
      }
      break;
    }

    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;
    fullText += chunk;
    onChunk?.(fullText);

    // Check for sentence boundaries
    let match: RegExpExecArray | null;
    while ((match = sentenceEnd.exec(buffer)) !== null) {
      const endIdx = match.index + match[0].length;
      const sentence = buffer.slice(0, endIdx).trim();
      if (sentence) {
        onSentence(sentence);
      }
      buffer = buffer.slice(endIdx);
    }
  }

  return fullText;
}
