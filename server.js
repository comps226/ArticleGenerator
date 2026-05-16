import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const PROVIDER = process.env.PROVIDER || "anthropic"; // "anthropic" or "ollama"

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const FRAMEWORK = `You are an article writing assistant. Follow this exact structure:

Step 1: Identify the target audience and tone (1-2 sentences)
Step 2: Create a 5-point outline (numbered list)
Step 3: Write an engaging introduction (1 paragraph)
Step 4: Develop each of the 5 points with examples and analysis (one section per point, with a bold heading)
Step 5: Write a conclusion that ties the themes together (1 paragraph)
Step 6: Add a call-to-action (1-2 sentences, italicized using markdown)

Respond ONLY in JSON with this exact shape, no preamble, no markdown fences:
{
  "audience": "string",
  "tone": "string",
  "outline": ["string","string","string","string","string"],
  "introduction": "string",
  "sections": [
    {"heading": "string", "body": "string"},
    {"heading": "string", "body": "string"},
    {"heading": "string", "body": "string"},
    {"heading": "string", "body": "string"},
    {"heading": "string", "body": "string"}
  ],
  "conclusion": "string",
  "cta": "string"
}`;

// ─── Anthropic ───────────────────────────────────────────────────────────────

async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set in .env");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: FRAMEWORK,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();

  if (data.error) throw new Error(`Anthropic error: ${data.error.message}`);
  if (data.stop_reason === "max_tokens") throw new Error("Response cut off — try a shorter topic.");

  return data.content?.map((b) => b.text || "").join("") || "";
}

// ─── Ollama ──────────────────────────────────────────────────────────────────

async function callOllama(prompt) {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "llama3";

  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      stream: false,
      messages: [
        { role: "system", content: FRAMEWORK },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.message?.content || "";
}

// ─── Route ───────────────────────────────────────────────────────────────────

app.post("/api/generate", async (req, res) => {
  const { topic, stance } = req.body;

  if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
    return res.status(400).json({ error: "topic is required" });
  }
  if (!stance || typeof stance !== "string") {
    return res.status(400).json({ error: "stance is required" });
  }

  const prompt = `Write a structured article about the following topic: "${topic.trim()}"\n\nThe article should take a ${stance} perspective/stance.\n\nFollow the framework exactly and return only valid JSON.`;

  try {
    let raw = "";

    if (PROVIDER === "ollama") {
      console.log(`Using Ollama (${process.env.OLLAMA_MODEL || "llama3"})`);
      raw = await callOllama(prompt);
    } else {
      console.log("Using Anthropic (claude-sonnet-4)");
      raw = await callAnthropic(prompt);
    }

    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("JSON parse failed. Raw preview:", clean.slice(0, 300));
      return res.status(502).json({ error: "Model returned invalid JSON. Try again." });
    }

    return res.json(parsed);
  } catch (err) {
    console.error("Generation error:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
});

app.get("/health", (_req, res) =>
  res.json({ status: "ok", provider: PROVIDER })
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Provider: ${PROVIDER}`);
});
