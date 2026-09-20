import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini initialization with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Fallback architect engine for deterministic prompt compilation
function deterministicArchitect(manifest: any) {
  const actId = manifest.actId || manifest.id || "ACT_SUPER_PUFF";
  const title = manifest.title || "Super Puff Act";
  const visuals = manifest.visuals || "";
  const gag = manifest.gag || "";
  const audio = manifest.audio || "";
  const stageDirections = manifest.stageDirections || "";
  const performanceScript = manifest.performanceScript || manifest.dialogue || "";
  const cycle = manifest.dragon9Cycle || "Cycle 09 // D9-HR 04.22";

  // Core aesthetic lock-ins from user prompt
  const coreAesthetics = [
    "4K anime styling",
    "glassmorphism overlays",
    "liquid chrome physics",
    "neon aqua and violet highlights",
    "volumetric lighting",
    "vector graphic style",
    "high contrast cel-shaded reflections",
    "octane render precision",
    "cyberpunk streetwear aesthetic",
    "iridescent chromatic textures"
  ];

  // Synthesize Image Prompt
  const cleanVisuals = visuals ? visuals.trim().replace(/\.$/, "") : "Super Puff in oversized hoodie with glowing chrome trims twisting an invisible dial in mid-air";
  const cleanGag = gag ? `, comedic gag element: ${gag.trim().replace(/\.$/, "")}` : "";
  const rawImagePrompt = `${cleanVisuals}${cleanGag}, ${coreAesthetics.join(", ")}`;
  const midjourneyPrompt = `/imagine prompt: ${rawImagePrompt} --ar 16:9 --v 6.1 --stylize 280 --chaos 12 --q 2`;
  const sdPrompt = `${rawImagePrompt}, masterpiece, best quality, ultra-detailed anime vector art`;
  const sdNegativePrompt = "lowres, bad anatomy, blurry, dull colors, photorealistic skin, grainy, watermark, oversaturated, deformed hands, missing fingers";

  // Synthesize Audio & SFX Prompt
  const musicGenPrompt = `Tempo: 84 BPM, lo-fi cyberpunk trap instrumental with heavy 808 sub-drop tuned to 432Hz resonance, filtered Rhodes keys, submerged synths, vinyl crackle warmth. Context: ${audio}`;
  const audioLdmSfxPrompt = `Crisp bubbling water fading into low-pass vinyl crackle, heavy 808 sub-bass drop at 432Hz frequency, celestial dial mechanical click, analog CRT static fizz, liquid chrome splash sound effect. Stage direction: ${stageDirections}`;
  const audioMastering = "Tuning: 432Hz harmonic reference; Sub: Heavy 808 sub-bass (30Hz - 60Hz shelf); Foley: Binaural panning with analog tape saturation.";

  // Synthesize Voice Direction
  const voiceDeliveryNotes = "Hyper-confident, bilingual swagger, deep resonant voice, dropping the tempo on punchlines, comedic deadpan timing with playful urban inflection, sudden sub-bass vocal drops.";
  const voiceActorSettings = {
    stability: 45,
    claritySimilarity: 85,
    styleExaggeration: 30,
    speakerBoost: true,
  };

  const fullPromptDeck = `================================================================================
DRAGON 9 ASSET ARCHITECT // PRODUCTION PROMPTS
PROTOCOL: DRAGON 9 (54-MIN HR / 26.66-HR CYCLE) // ${actId.toUpperCase()} - ${title.toUpperCase()}
================================================================================

[1. IMAGE GENERATION PROMPTS (MIDJOURNEY / STABLE DIFFUSION)]
--------------------------------------------------------------------------------
• RAW COMMA-SEPARATED PROMPT:
${rawImagePrompt}

• MIDJOURNEY V6.1 COMMAND:
${midjourneyPrompt}

• STABLE DIFFUSION XL PROMPT:
${sdPrompt}
NEGATIVE PROMPT:
${sdNegativePrompt}

[2. AUDIO & SFX PROMPTS (MUSICGEN / AUDIOLDM / ELEVENLABS)]
--------------------------------------------------------------------------------
• MUSICGEN COMPOSITION PROMPT:
${musicGenPrompt}

• AUDIOLDM / SFX TEXT:
${audioLdmSfxPrompt}

• FREQUENCY & MASTERING SPECS:
${audioMastering}

[3. VOICE DIRECTION (AI VOICE CLONING / ELEVENLABS)]
--------------------------------------------------------------------------------
• EXTRACTED PERFORMANCE SCRIPT:
"${performanceScript}"

• DELIVERY & EMOTIONAL TONAL NOTES:
${voiceDeliveryNotes}

• RECOMMENDED ELEVENLABS SETTINGS:
Stability: ${voiceActorSettings.stability}% | Clarity & Similarity: ${voiceActorSettings.claritySimilarity}% | Style Exaggeration: ${voiceActorSettings.styleExaggeration}% | Speaker Boost: Enabled
================================================================================`;

  return {
    actId,
    title,
    dragon9Cycle: cycle,
    image: {
      rawPrompt: rawImagePrompt,
      midjourney: midjourneyPrompt,
      stableDiffusion: sdPrompt,
      negativePrompt: sdNegativePrompt,
      aestheticLockIns: [
        "4K anime styling",
        "glassmorphism overlays",
        "liquid chrome physics",
        "neon aqua/violet highlights",
        "volumetric lighting",
        "vector graphic style"
      ]
    },
    audio: {
      musicGen: musicGenPrompt,
      audioLdm: audioLdmSfxPrompt,
      mastering: audioMastering,
      frequencies: ["432Hz Harmonic Resonance", "Heavy 808 Sub-Drop (32Hz-55Hz)", "Low-Pass Vinyl Crackle (2.4kHz cut)"]
    },
    voice: {
      script: performanceScript,
      deliveryNotes: voiceDeliveryNotes,
      voiceSettings: voiceActorSettings,
      pacingCues: performanceScript
        ? performanceScript.replace(/\./g, " [beat] ").replace(/\?/g, " [tempo drop]? ")
        : ""
    },
    fullPromptDeck
  };
}

// Primary single-act processor helper with model fallback
async function architectSingleAct(parsedManifest: any, customDirectives: string = "", ai: any) {
  if (!ai) {
    return {
      source: "deterministic_compiler",
      data: deterministicArchitect(parsedManifest)
    };
  }

  const systemInstruction = `You are the Dragon 9 Asset Architect, a specialized AI designed to process JSON manifests for the "Super Puff" multimedia project and output highly detailed, production-ready prompts for generative AI audio and visual tools.

Your temporal framework operates on the Dragon 9 Protocol (54-minute hours / 26.66-hour cycles).

When the user provides a JSON block representing an "Act" from the Super Puff manifest, you must break it down and generate the following exact outputs:

1. IMAGE GENERATION PROMPTS (For Midjourney / Stable Diffusion)
   - Translate the "visuals" and "gag" fields into raw, comma-separated image prompts.
   - Core aesthetic lock-ins to include: 4K anime styling, glassmorphism overlays, liquid chrome physics, neon aqua/violet highlights, volumetric lighting, vector graphic style.
   - Ensure the prompt captures the specific action (e.g., "Super Puff, a streetwear dragon in an oversized hoodie with glowing chrome trims, twisting an invisible dial in mid-air, CRT scanlines peeling back to reveal a boundless starry void").

2. AUDIO & SFX PROMPTS (For MusicGen / AudioLDM / ElevenLabs)
   - Translate the "audio" and "stageDirections" fields into precise audio-generation text.
   - Note specific frequencies (e.g., 432Hz resonance, heavy 808 sub-drop).
   - Detail the SFX (e.g., "crisp bubbling bong water fading into a low-pass vinyl crackle").

3. VOICE DIRECTION (For AI Voice Cloning)
   - Extract the "performanceScript".
   - Provide emotional/tonal delivery notes (e.g., "Hyper-confident, bilingual swagger, deep resonant voice, dropping the tempo, comedic timing").

Do not generate conversational filler. Output only the structured outputs.`;

  const userPrompt = `Process this Super Puff Act manifest under the Dragon 9 Protocol and return structured JSON matching this schema:
{
  "actId": "string",
  "title": "string",
  "dragon9Cycle": "string",
  "image": {
    "rawPrompt": "raw comma-separated prompt containing visuals, gag, 4K anime styling, glassmorphism overlays, liquid chrome physics, neon aqua/violet highlights, volumetric lighting, vector graphic style",
    "midjourney": "/imagine prompt: [raw prompt with --ar 16:9 --v 6.1 --stylize 250]",
    "stableDiffusion": "detailed SDXL prompt",
    "negativePrompt": "negative prompt for SDXL",
    "aestheticLockIns": ["4K anime styling", "glassmorphism overlays", "liquid chrome physics", "neon aqua/violet highlights", "volumetric lighting", "vector graphic style"]
  },
  "audio": {
    "musicGen": "precise prompt noting tempo, vibe, 432Hz resonance, 808 sub-drop",
    "audioLdm": "detailed SFX prompt (e.g., crisp bubbling bong water fading into low-pass vinyl crackle, mechanical dial clicks, sub drops)",
    "mastering": "frequency guidelines and technical notes",
    "frequencies": ["list of explicit frequency specs like 432Hz, 30-55Hz sub"]
  },
  "voice": {
    "script": "extracted performanceScript text",
    "deliveryNotes": "hyper-confident bilingual swagger, deep resonant voice, tempo drops, comedic timing",
    "voiceSettings": {
      "stability": 45,
      "claritySimilarity": 85,
      "styleExaggeration": 30,
      "speakerBoost": true
    },
    "pacingCues": "script annotated with [tempo drop], [beat], [sub-bass resonance]"
  },
  "fullPromptDeck": "The exact full structured prompt block ready for direct copy-pasting into generators with zero conversational filler."
}

ACT MANIFEST TO PROCESS:
${JSON.stringify(parsedManifest, null, 2)}

${customDirectives ? `ADDITIONAL CREATIVE DIRECTIVES: ${customDirectives}` : ""}`;

  const candidateModels = ["gemini-2.5-flash", "gemini-2.5-pro"];
  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text || "";
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        if (parsed && parsed.image && parsed.audio && parsed.voice) {
          return {
            source: modelName,
            data: parsed
          };
        }
      }
    } catch (genError: any) {
      console.warn(`Model ${modelName} unavailable, attempting fallback...`);
    }
  }

  return {
    source: "deterministic_compiler",
    data: deterministicArchitect(parsedManifest)
  };
}

// Health route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", protocol: "Dragon 9 (54-min hour / 26.66-hr cycle)" });
});

// Single or Auto-Array Architect Endpoint
app.post("/api/architect", async (req, res) => {
  try {
    const { manifest, customDirectives } = req.body;

    if (!manifest) {
      return res.status(400).json({ error: "Missing JSON manifest payload." });
    }

    let parsedManifest: any;
    if (typeof manifest === "string") {
      try {
        parsedManifest = JSON.parse(manifest);
      } catch {
        return res.status(400).json({ error: "Invalid JSON format in manifest string." });
      }
    } else {
      parsedManifest = manifest;
    }

    const ai = getGeminiClient();

    // Check if the payload is an array of acts or an object with an acts array
    const actsList = Array.isArray(parsedManifest) 
      ? parsedManifest 
      : Array.isArray(parsedManifest?.acts) 
        ? parsedManifest.acts 
        : Array.isArray(parsedManifest?.manifests) 
          ? parsedManifest.manifests 
          : null;

    if (actsList && actsList.length > 0) {
      const results = [];
      for (const act of actsList) {
        const result = await architectSingleAct(act, customDirectives || "", ai);
        results.push(result.data);
      }
      return res.json({
        success: true,
        isBatch: true,
        count: results.length,
        results
      });
    }

    // Single act processing
    const singleResult = await architectSingleAct(parsedManifest, customDirectives || "", ai);
    return res.json({
      success: true,
      source: singleResult.source,
      data: singleResult.data
    });
  } catch (error: any) {
    try {
      const manifest = req.body?.manifest;
      const parsed = typeof manifest === "string" ? JSON.parse(manifest) : (manifest || {});
      const actsList = Array.isArray(parsed) ? parsed : (parsed.acts || [parsed]);
      const results = actsList.map((act: any) => deterministicArchitect(act));
      return res.json({
        success: true,
        source: "deterministic_compiler",
        results,
        data: results[0]
      });
    } catch {
      return res.status(400).json({ error: "Unable to parse manifest or generate prompts." });
    }
  }
});

// Explicit Batch Architect Endpoint
app.post("/api/architect/batch", async (req, res) => {
  try {
    const { manifests, customDirectives } = req.body;

    if (!manifests || !Array.isArray(manifests) || manifests.length === 0) {
      return res.status(400).json({ error: "manifests must be a non-empty array of acts." });
    }

    const ai = getGeminiClient();
    const results = [];

    for (const act of manifests) {
      const resItem = await architectSingleAct(act, customDirectives || "", ai);
      results.push(resItem.data);
    }

    return res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error: any) {
    try {
      const manifests = req.body?.manifests || [];
      const results = manifests.map((act: any) => deterministicArchitect(act));
      return res.json({
        success: true,
        source: "deterministic_compiler_batch",
        count: results.length,
        results
      });
    } catch {
      return res.status(500).json({ error: "Batch processing failed." });
    }
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dragon 9 Asset Architect server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
