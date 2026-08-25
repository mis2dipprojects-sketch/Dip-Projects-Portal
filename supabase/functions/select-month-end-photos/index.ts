import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_VISION_MODEL = "qwen/qwen3.6-27b"; // current Groq-recommended vision model
const MAX_IMAGES_PER_CALL = 5; // hard Groq API limit
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function scoreOneBatch(batch: { index: number; dataUrl: string }[], apiKey: string, picksFromBatch: number) {
  const content = [
    {
      type: "text",
      text: `You are reviewing ${batch.length} construction site photos (indexed ${batch.map((p) => p.index).join(", ")}). Pick the best ${picksFromBatch} that represent this month's progress well — prefer clear, informative, non-duplicate shots. Respond with ONLY a JSON object: {"selected_indices": [array of integers, using the exact indices given above]}. No other text.`,
    },
    ...batch.map((p) => ({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${p.dataUrl}` } })),
  ];

  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_VISION_MODEL,
      messages: [{ role: "user", content }],
      temperature: 0.2,
      max_tokens: 300,
      response_format: { type: "json_object" },
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Groq API error (${resp.status}): ${errText.substring(0, 300)}`);
  }

  const data = await resp.json();
  const text = data?.choices?.[0]?.message?.content?.trim() || "";
  const parsed = JSON.parse(text);
  return Array.isArray(parsed.selected_indices) ? parsed.selected_indices : [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), { status: 500, headers: corsHeaders });
    }
    const { photos, targetCount = 10 } = await req.json();
    if (!Array.isArray(photos) || !photos.length) {
      return new Response(JSON.stringify({ error: "No photos provided" }), { status: 400, headers: corsHeaders });
    }

    // Groq allows at most 5 images per request, so split into batches and
    // ask each batch for a proportional share of the final target count.
    const batches: typeof photos[] = [];
    for (let i = 0; i < photos.length; i += MAX_IMAGES_PER_CALL) {
      batches.push(photos.slice(i, i + MAX_IMAGES_PER_CALL));
    }
    const picksPerBatch = Math.max(1, Math.ceil(targetCount / batches.length));

    let selected: number[] = [];
    for (const batch of batches) {
      try {
        const picks = await scoreOneBatch(batch, GROQ_API_KEY, Math.min(picksPerBatch, batch.length));
        selected.push(...picks);
      } catch (e) {
        console.warn("Batch scoring failed, skipping batch:", e.message);
      }
    }

    return new Response(JSON.stringify({ selected_indices: selected.slice(0, targetCount * 2) }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Unexpected error" }), { status: 500, headers: corsHeaders });
  }
});