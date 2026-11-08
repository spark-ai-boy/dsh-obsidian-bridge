/**
 * Minimal OpenAI-compatible embeddings client used by the semantic index.
 *
 * Supported response shapes:
 *   { data: [{ embedding: number[] }] }   OpenAI compatible
 *   { embeddings: number[][] }            Ollama /api/embed
 *   { embedding: number[] }               Ollama /api/embeddings (single)
 */

function normalize(vector) {
  let norm = 0;
  for (const value of vector) norm += value * value;
  norm = Math.sqrt(norm);
  if (!Number.isFinite(norm) || norm === 0) return vector;
  return vector.map((value) => value / norm);
}

function validUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function abortSignal(ms) {
  const timeout = Number(ms) > 0 ? Number(ms) : 90_000;
  if (typeof AbortSignal.timeout === "function") return AbortSignal.timeout(timeout);
  const controller = new AbortController();
  setTimeout(() => controller.abort(new Error("embedding request timed out")), timeout).unref?.();
  return controller.signal;
}

export async function embedTexts(settings, texts, signal) {
  if (!texts.length) return [];
  if (!settings.embeddingUrl || !validUrl(settings.embeddingUrl)) {
    throw new Error("Embedding service URL must be an http(s) endpoint.");
  }
  const url = settings.embeddingUrl.trim();
  const timeout = abortSignal(settings.embeddingTimeoutMs);
  const signals = signal ? [signal, timeout] : [timeout];
  const requestSignal =
    typeof AbortSignal.any === "function" ? AbortSignal.any(signals) : timeout;
  const headers = { "Content-Type": "application/json" };
  if (settings.embeddingApiKey) {
    headers.Authorization = `Bearer ${settings.embeddingApiKey}`;
  }

  const request = async (body) => {
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: requestSignal
      });
    } catch (error) {
      throw new Error(`Embedding request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Embedding service returned HTTP ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ""}`);
    }
    return response.json();
  };

  const oldOllama = /\/api\/embeddings\/?$/i.test(url);
  if (oldOllama) {
    const vectors = [];
    for (const text of texts) {
      const payload = await request({ model: settings.embeddingModel, prompt: text });
      if (!Array.isArray(payload?.embedding)) {
        throw new Error("Embedding service returned no embedding array.");
      }
      vectors.push(payload.embedding);
    }
    return vectors.map((vector) => normalize(vector));
  }

  const payload = await request({
    model: settings.embeddingModel,
    input: texts
  });

  let vectors;
  if (Array.isArray(payload?.data)) {
    vectors = payload.data.map((item) => item?.embedding);
  } else if (Array.isArray(payload?.embeddings)) {
    vectors = payload.embeddings;
  } else if (Array.isArray(payload?.embedding)) {
    vectors = [payload.embedding];
  }
  if (!Array.isArray(vectors) || vectors.length !== texts.length || vectors.some((vector) => !Array.isArray(vector))) {
    throw new Error("Embedding service returned an unexpected response shape.");
  }
  return vectors.map((vector) => normalize(vector));
}

export async function testEmbedding(settings, signal) {
  const [vector] = await embedTexts(settings, ["Vault Studio embedding connection test"], signal);
  return { dimensions: vector.length, sample: vector.slice(0, 3) };
}
