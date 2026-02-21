require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = "llama-3.3-70b-versatile";

function buildBriefPrompt(sources) {
  const formattedSources = sources
    .map((s, i) => `--- SOURCE ${i + 1}: ${s.title}\nURL: ${s.url}\n\n${s.snippet}\n---`)
    .join("\n\n");

  return `You are a research analyst. Analyze these ${sources.length} sources and produce a structured research brief.

${formattedSources}

Respond ONLY with a valid JSON object in this exact structure (no markdown, no extra text):
{
  "title": "A descriptive title for this research brief",
  "summary": "2-3 paragraph overall summary of all sources combined",
  "keyPoints": [
    {
      "point": "The key insight or finding",
      "sourceIndex": 0,
      "snippet": "A short direct quote or paraphrase from that source (max 100 chars)"
    }
  ],
  "conflictingClaims": [
    {
      "claim": "Description of the conflict",
      "sourceA": 0,
      "sourceB": 1,
      "details": "What source A says vs what source B says"
    }
  ],
  "toVerify": [
    "Claim or fact that should be independently verified",
    "Another item to verify"
  ],
  "tags": ["topic1", "topic2", "topic3"]
}

Rules:
- keyPoints should have 5-10 items
- toVerify should have 3-5 items
- conflictingClaims can be empty array [] if none exist
- sourceIndex is 0-based index into the provided sources
- Keep all text concise and professional
- tags should be 3-5 short topic keywords`;
}

async function generateBrief(sources, attempt = 1) {
  if (attempt === 1) {
    const key = process.env.GROQ_API_KEY;
    console.log("🔑 GROQ_API_KEY:", key ? `set (starts with ${key.substring(0, 8)}...)` : "MISSING!");
  }

  const prompt = buildBriefPrompt(sources);

  try {
    console.log(`🤖 Calling Groq API (attempt ${attempt})...`);

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
      temperature: 0.3,
    });

    const rawText = completion.choices[0]?.message?.content || "";

    const cleaned = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/[\x00-\x1F\x7F]/g, (char) => {
        if (char === "\n" || char === "\r" || char === "\t") return " ";
        return "";
      })
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("LLM did not return valid JSON");

    const brief = JSON.parse(jsonMatch[0]);
    console.log("✅ Brief generated successfully");
    return { brief, error: null };

  } catch (err) {
    console.error(`❌ Failed — Status: ${err?.status} — Message: ${err?.message}`);

    const isRateLimit = err?.status === 429 || err?.message?.includes("rate");
    const isServerError = err?.status >= 500;
    const isAuthError = err?.status === 401 || err?.status === 403;

    if (isAuthError) {
      return { brief: null, error: "Invalid API key — check your GROQ_API_KEY in backend/.env" };
    }

    if ((isRateLimit || isServerError) && attempt < 3) {
      const waitMs = isRateLimit ? 8000 : 3000;
      console.log(`⏳ Retrying in ${waitMs / 1000}s...`);
      await new Promise((res) => setTimeout(res, waitMs));
      return generateBrief(sources, attempt + 1);
    }

    return { brief: null, error: err.message || "LLM generation failed" };
  }
}

async function checkGroqHealth() {
  try {
    const key = process.env.GROQ_API_KEY;
    if (!key || key === "your_groq_api_key_here") return false;
    await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: "Reply with: ok" }],
      max_tokens: 5,
    });
    return true;
  } catch {
    return false;
  }
}

module.exports = { generateBrief, checkGroqHealth };