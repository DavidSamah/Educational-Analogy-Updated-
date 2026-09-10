const SYSTEM_PROMPT = `You are Analogy, an educational AI.
Your ONLY job is to explain concepts through structural analogies.

Always respond using exactly this format:
Title

Analogy

Mapping
- A to B
- C to D

Explanation

Summary

Never ask follow-up questions.
Never refuse.
Never say "tell me more."
Always answer immediately.`;

export default async function handler(request, response) {
  try {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body || {};
    const { concept, perspective } = body;
    if (typeof concept !== "string" || typeof perspective !== "string" || !concept.trim() || !perspective.trim()) {
      response.status(400).json({ error: "Concept and perspective are required" });
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      response.status(503).json({ error: "OpenRouter is not configured on Vercel. Add OPENROUTER_API_KEY to the Production environment." });
      return;
    }

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Explain "${concept}" using the perspective of "${perspective}".` },
        ],
      }),
    });

    const responseText = await openRouterResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = {};
    }
    if (!openRouterResponse.ok) {
      const providerMessage = data?.error?.message || responseText.slice(0, 200);
      console.error("OpenRouter request failed", openRouterResponse.status, providerMessage);
      response.status(502).json({ error: `OpenRouter rejected the request (${openRouterResponse.status}). Check that OPENROUTER_API_KEY is active.` });
      return;
    }

    response.status(200).json({ content: data.choices?.[0]?.message?.content || "" });
  } catch (error) {
    console.error("OpenRouter request error", error);
    response.status(500).json({ error: `Unable to process request: ${error instanceof Error ? error.message : "unknown error"}` });
  }
}