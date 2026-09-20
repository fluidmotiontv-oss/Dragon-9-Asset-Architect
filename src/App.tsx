import React, { useState, useEffect } from "react";
import { Dragon9Header } from "./components/Dragon9Header";
import { AestheticLockInsBar } from "./components/AestheticLockInsBar";
import { ManifestEditor } from "./components/ManifestEditor";
import { PromptOutputDeck } from "./components/PromptOutputDeck";
import { HistoryQueueBar } from "./components/HistoryQueueBar";
import { SAMPLE_MANIFEST_ACTS } from "./data/sampleManifests";
import { ArchitectResult, BatchProgress } from "./types";
import { 
  Terminal, 
  Layers, 
  Clock, 
  Sparkles,
  CheckCircle2
} from "lucide-react";

const STORAGE_KEY_MANIFEST = "dragon9_latest_manifest";
const STORAGE_KEY_DIRECTIVES = "dragon9_custom_directives";

export default function App() {
  const [currentResult, setCurrentResult] = useState<ArchitectResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    isProcessing: false,
    current: 0,
    total: 0
  });
  const [history, setHistory] = useState<ArchitectResult[]>([]);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Persistent manifest input state loaded from localStorage
  const [manifestInput, setManifestInput] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_MANIFEST);
        if (saved && saved.trim()) {
          return saved;
        }
      } catch (err) {
        console.warn("Failed to read manifest from localStorage:", err);
      }
    }
    return JSON.stringify(SAMPLE_MANIFEST_ACTS, null, 2);
  });

  // Persistent custom directives state loaded from localStorage
  const [customDirectives, setCustomDirectives] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_DIRECTIVES);
        if (saved !== null) {
          return saved;
        }
      } catch (err) {
        console.warn("Failed to read directives from localStorage:", err);
      }
    }
    return "";
  });

  // Automatically persist manifestInput to localStorage across page reloads
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_MANIFEST, manifestInput);
      } catch (err) {
        console.warn("Failed to persist manifest to localStorage:", err);
      }
    }
  }, [manifestInput]);

  // Automatically persist customDirectives to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_DIRECTIVES, customDirectives);
      } catch (err) {
        console.warn("Failed to persist custom directives to localStorage:", err);
      }
    }
  }, [customDirectives]);

  // On initial load, architect the restored manifest from localStorage (or fallback sample)
  useEffect(() => {
    try {
      const parsed = JSON.parse(manifestInput);
      if (Array.isArray(parsed) && parsed.length > 0) {
        handleArchitectSingle(parsed[0], customDirectives);
      } else if (parsed && Array.isArray(parsed.acts) && parsed.acts.length > 0) {
        handleArchitectSingle(parsed.acts[0], customDirectives);
      } else if (parsed && Array.isArray(parsed.manifests) && parsed.manifests.length > 0) {
        handleArchitectSingle(parsed.manifests[0], customDirectives);
      } else if (parsed && typeof parsed === "object") {
        handleArchitectSingle(parsed, customDirectives);
      } else {
        handleArchitectSingle(SAMPLE_MANIFEST_ACTS[0], "");
      }
    } catch {
      handleArchitectSingle(SAMPLE_MANIFEST_ACTS[0], "");
    }
  }, []);

  // Single Act Processing
  const handleArchitectSingle = async (manifestPayload: any, directivesToUse: string = customDirectives) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manifest: manifestPayload,
          customDirectives: directivesToUse,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setCurrentResult(resData.data);
        setHistory((prev) => {
          const filtered = prev.filter((p) => p.actId !== resData.data.actId);
          return [resData.data, ...filtered];
        });
        showNotification(`Act ${resData.data.actId} architected & queued in history.`);
      } else {
        throw new Error(resData.error || "Failed to process manifest");
      }
    } catch (err: any) {
      console.warn("API call failed, falling back to local compiler:", err);
      const fallbackResult = clientSideArchitectFallback(manifestPayload);
      setCurrentResult(fallbackResult);
      setHistory((prev) => [fallbackResult, ...prev.filter((p) => p.actId !== fallbackResult.actId)]);
      showNotification(`Act ${fallbackResult.actId} compiled via Dragon 9 engine.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Multi-Act Batch Processing (Processes array of manifests and queues all in history)
  const handleArchitectBatch = async (manifestsArray: any[], directivesToUse: string = customDirectives) => {
    if (!manifestsArray || manifestsArray.length === 0) return;

    setIsLoading(true);
    setBatchProgress({
      isProcessing: true,
      current: 0,
      total: manifestsArray.length,
      currentActId: manifestsArray[0]?.actId || "Act 1"
    });

    const batchResults: ArchitectResult[] = [];

    for (let i = 0; i < manifestsArray.length; i++) {
      const act = manifestsArray[i];
      const actLabel = act.actId || `Act ${i + 1}`;

      setBatchProgress({
        isProcessing: true,
        current: i + 1,
        total: manifestsArray.length,
        currentActId: actLabel
      });

      try {
        const response = await fetch("/api/architect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            manifest: act,
            customDirectives: directivesToUse,
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data) {
            batchResults.push(resData.data);
            setHistory((prev) => {
              const filtered = prev.filter((p) => p.actId !== resData.data.actId);
              return [resData.data, ...filtered];
            });
            continue;
          }
        }
        // Fallback for this act
        const fallback = clientSideArchitectFallback(act);
        batchResults.push(fallback);
        setHistory((prev) => [fallback, ...prev.filter((p) => p.actId !== fallback.actId)]);
      } catch {
        const fallback = clientSideArchitectFallback(act);
        batchResults.push(fallback);
        setHistory((prev) => [fallback, ...prev.filter((p) => p.actId !== fallback.actId)]);
      }
    }

    if (batchResults.length > 0) {
      setCurrentResult(batchResults[0]);
      showNotification(`Batch complete: ${batchResults.length} acts architected and queued in history!`);
    }

    setBatchProgress({
      isProcessing: false,
      current: manifestsArray.length,
      total: manifestsArray.length
    });
    setIsLoading(false);
  };

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => {
      setStatusNotification(null);
    }, 4500);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setCurrentResult(null);
  };

  // Reset manifest to default sample season
  const handleResetDefaults = () => {
    const defaultManifest = JSON.stringify(SAMPLE_MANIFEST_ACTS, null, 2);
    setManifestInput(defaultManifest);
    setCustomDirectives("");
    try {
      localStorage.removeItem(STORAGE_KEY_MANIFEST);
      localStorage.removeItem(STORAGE_KEY_DIRECTIVES);
    } catch (err) {
      console.warn("Failed to clear localStorage:", err);
    }
    showNotification("Restored default Super Puff season manifests.");
    handleArchitectSingle(SAMPLE_MANIFEST_ACTS[0], "");
  };

  // Local fallback ensuring the app is 100% operational under all conditions
  function clientSideArchitectFallback(manifest: any): ArchitectResult {
    const actId = manifest.actId || manifest.id || "ACT_01_COSMIC_BODEGA";
    const title = manifest.title || "The Cosmic Bodega & The Invisible Dial";
    const visuals = manifest.visuals || "Super Puff in oversized hoodie twisting an invisible dial in mid-air";
    const gag = manifest.gag || "";
    const audio = manifest.audio || "Heavy 808 sub-drop tuned to 432Hz resonance, filtered lo-fi trap groove";
    const stageDirections = manifest.stageDirections || "Crisp bubbling water fading into low-pass vinyl crackle";
    const script = manifest.performanceScript || manifest.dialogue || "Yo, check the readout. This is Dragon 9 time.";
    const cycle = manifest.dragon9Cycle || "Cycle 09 // D9-HR 04.22";

    const aestheticLockIns = [
      "4K anime styling",
      "glassmorphism overlays",
      "liquid chrome physics",
      "neon aqua/violet highlights",
      "volumetric lighting",
      "vector graphic style"
    ];

    const cleanVisuals = visuals.trim().replace(/\.$/, "");
    const cleanGag = gag ? `, comedic gag: ${gag.trim().replace(/\.$/, "")}` : "";
    const rawImagePrompt = `${cleanVisuals}${cleanGag}, 4K anime styling, glassmorphism overlays, liquid chrome physics, neon aqua and violet highlights, volumetric lighting, vector graphic style, cel-shaded precision, hyper-detailed`;
    const midjourney = `/imagine prompt: ${rawImagePrompt} --ar 16:9 --v 6.1 --stylize 280 --chaos 12 --q 2`;
    const stableDiffusion = `${rawImagePrompt}, masterpiece, octane render aesthetics, vivid colors, crisp lines`;
    const negativePrompt = "lowres, bad anatomy, blurry, dull colors, photorealistic skin, grainy, watermark, oversaturated, deformed hands";

    const musicGen = `Tempo: 86 BPM, lo-fi cyberpunk trap beat with heavy 808 sub-bass drop tuned to 432Hz harmonic resonance, underwater filtered Rhodes keys, submerged synths, vinyl crackle warmth. Soundscape: ${audio}`;
    const audioLdm = `Crisp bubbling bong water sound effect fading into low-pass vinyl crackle, heavy 808 sub-bass drop at 432Hz frequency, celestial dial mechanical click, analog CRT static fizz, liquid chrome splash. Context: ${stageDirections}`;
    const mastering = "Tuning: 432Hz harmonic reference; Sub-Shelf: 30Hz - 60Hz 808 reinforcement; Foley: Binaural panning with tape saturation.";

    const deliveryNotes = "Hyper-confident, bilingual swagger, deep resonant voice, dropping the tempo on punchlines, comedic timing with sudden sub-bass vocal drops.";
    const voiceSettings = {
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
${midjourney}

• STABLE DIFFUSION XL PROMPT:
${stableDiffusion}
NEGATIVE PROMPT:
${negativePrompt}

[2. AUDIO & SFX PROMPTS (MUSICGEN / AUDIOLDM / ELEVENLABS)]
--------------------------------------------------------------------------------
• MUSICGEN COMPOSITION PROMPT:
${musicGen}

• AUDIOLDM / SFX TEXT:
${audioLdm}

• FREQUENCY & MASTERING SPECS:
${mastering}

[3. VOICE DIRECTION (AI VOICE CLONING / ELEVENLABS)]
--------------------------------------------------------------------------------
• EXTRACTED PERFORMANCE SCRIPT:
"${script}"

• DELIVERY & EMOTIONAL TONAL NOTES:
${deliveryNotes}

• RECOMMENDED ELEVENLABS SETTINGS:
Stability: ${voiceSettings.stability}% | Clarity & Similarity: ${voiceSettings.claritySimilarity}% | Style Exaggeration: ${voiceSettings.styleExaggeration}% | Speaker Boost: Enabled
================================================================================`;

    return {
      actId,
      title,
      dragon9Cycle: cycle,
      image: {
        rawPrompt: rawImagePrompt,
        midjourney,
        stableDiffusion,
        negativePrompt,
        aestheticLockIns
      },
      audio: {
        musicGen,
        audioLdm,
        mastering,
        frequencies: ["432Hz Harmonic Resonance", "Heavy 808 Sub-Drop (30Hz - 55Hz)", "Low-Pass Vinyl Crackle"]
      },
      voice: {
        script,
        deliveryNotes,
        voiceSettings,
        pacingCues: script.replace(/\./g, " [beat] ").replace(/\?/g, " [tempo drop]? ")
      },
      fullPromptDeck
    };
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dragon 9 Protocol Live Telemetry Header */}
      <Dragon9Header />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Sub-Header Pipeline Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div>
            <h2 className="text-sm font-mono text-cyan-400 font-semibold tracking-wider uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Multi-Act Asset Generation Pipeline</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Upload manifest arrays or single acts to architect production Midjourney, AudioLDM, MusicGen, & ElevenLabs prompts.
            </p>
          </div>

          {/* Protocol Badge */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-[#111726] border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Dragon 9 (54m/hr • 26.66h/cycle)</span>
            </span>
          </div>
        </div>

        {/* Live Notification Banner */}
        {statusNotification && (
          <div className="px-4 py-2.5 rounded-lg bg-cyan-950/70 border border-cyan-500/60 text-cyan-200 text-xs font-mono flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{statusNotification}</span>
            </div>
            <span className="text-[10px] text-cyan-400/80">Auto-persisted in LocalStorage</span>
          </div>
        )}

        {/* Core Aesthetic Lock-Ins Reference Strip */}
        <AestheticLockInsBar />

        {/* Multi-Act History & Batch Queue Bar (Shows when history has items) */}
        <HistoryQueueBar
          history={history}
          currentResult={currentResult}
          onSelectResult={(result) => setCurrentResult(result)}
          onClearHistory={handleClearHistory}
        />

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Manifest Input & Batch Processor (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-4">
            <ManifestEditor 
              manifestText={manifestInput}
              onManifestChange={setManifestInput}
              customDirectives={customDirectives}
              onCustomDirectivesChange={setCustomDirectives}
              onArchitectSingle={handleArchitectSingle}
              onArchitectBatch={handleArchitectBatch}
              isLoading={isLoading}
              batchProgress={batchProgress}
              onResetDefaults={handleResetDefaults}
            />
          </div>

          {/* Right Column: Prompt Output Deck (7 cols on lg) */}
          <div className="lg:col-span-7">
            {currentResult ? (
              <PromptOutputDeck result={currentResult} />
            ) : (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl bg-[#0b0f19]">
                <Layers className="w-8 h-8 text-cyan-500/50 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-mono text-slate-400">
                  Select or upload an Act manifest to architect production prompts.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer / Telemetry Note */}
      <footer className="mt-auto border-t border-slate-800/60 bg-[#06080d] px-4 py-3 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>DRAGON 9 PROTOCOL // 54-MINUTE HOURS // 26.66-HOUR CYCLES</span>
          <span className="text-slate-400">MULTI-ACT BATCH PIPELINE • SUPER PUFF ASSET ARCHITECT</span>
        </div>
      </footer>
    </div>
  );
}
