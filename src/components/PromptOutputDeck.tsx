import React, { useState } from "react";
import { ArchitectResult } from "../types";
import { 
  Copy, 
  Check, 
  Download, 
  FileJson,
  FileText,
  Image as ImageIcon, 
  Volume2, 
  Mic, 
  Terminal, 
  Sparkles, 
  Activity,
  SlidersHorizontal,
  ExternalLink,
  Music,
  Share2
} from "lucide-react";

interface PromptOutputDeckProps {
  result: ArchitectResult;
}

export const PromptOutputDeck: React.FC<PromptOutputDeckProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<"image" | "audio" | "voice" | "raw">("image");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingTestTone, setIsPlayingTestTone] = useState<boolean>(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadPromptDeck = () => {
    const blob = new Blob([result.fullPromptDeck], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.actId.toLowerCase()}_dragon9_prompts.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPromptJson = () => {
    const exportData = {
      project: "Super Puff",
      protocol: "Dragon 9 Protocol (54-min hour / 26.66-hr cycle)",
      exportedAt: new Date().toISOString(),
      actId: result.actId,
      title: result.title,
      dragon9Cycle: result.dragon9Cycle,
      image: result.image,
      audio: result.audio,
      voice: result.voice,
      fullPromptDeck: result.fullPromptDeck
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.actId.toLowerCase()}_dragon9_prompts.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Optional 432Hz audio tone test for creators wanting to verify the frequency
  const toggle432HzTone = () => {
    if (isPlayingTestTone) {
      setIsPlayingTestTone(false);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(432, ctx.currentTime); // Dragon 9 432Hz resonance
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 3);

      setIsPlayingTestTone(true);
      setTimeout(() => {
        setIsPlayingTestTone(false);
      }, 3000);
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  return (
    <div className="w-full bg-[#0b0f19] border border-cyan-900/40 rounded-xl overflow-hidden shadow-2xl">
      {/* Header Banner */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#0c1322] via-[#0f172a] to-[#120e24] border-b border-cyan-900/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              {result.actId}
            </span>
            <span className="text-[11px] font-mono text-purple-400">
              {result.dragon9Cycle}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 font-['Chakra_Petch'] tracking-wide">
            {result.title}
          </h2>
        </div>

        {/* Global Deck Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-copy-deck-header"
            onClick={() => copyToClipboard(result.fullPromptDeck, "masterDeck")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
            title="Copy generated prompt deck to clipboard"
          >
            {copiedKey === "masterDeck" ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <button
            id="btn-export-json-header"
            onClick={downloadPromptJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-purple-950/70 hover:bg-purple-900 border border-purple-600/70 text-purple-200 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            title="Download prompt deck as structured JSON (.json)"
          >
            <FileJson className="w-3.5 h-3.5 text-purple-400" />
            <span>Export .json</span>
          </button>

          <button
            id="btn-export-md-header"
            onClick={downloadPromptDeck}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#151c2e] hover:bg-[#1c263e] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Download prompt deck as Markdown (.md)"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export .md</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800/80 bg-[#080c14] overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab("image")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "image"
              ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <span>1. IMAGE GENERATION (MIDJOURNEY / SD)</span>
        </button>

        <button
          onClick={() => setActiveTab("audio")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "audio"
              ? "border-purple-400 text-purple-300 bg-purple-950/20"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <Volume2 className="w-4 h-4 text-purple-400" />
          <span>2. AUDIO & SFX (MUSICGEN / AUDIOLDM)</span>
        </button>

        <button
          onClick={() => setActiveTab("voice")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "voice"
              ? "border-emerald-400 text-emerald-300 bg-emerald-950/20"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span>3. VOICE DIRECTION (AI VOICE CLONING)</span>
        </button>

        <button
          onClick={() => setActiveTab("raw")}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "raw"
              ? "border-amber-400 text-amber-300 bg-amber-950/20"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>ZERO-FILLER PROMPT DECK</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-6">
        {/* ==================== TAB 1: IMAGE GENERATION ==================== */}
        {activeTab === "image" && (
          <div className="space-y-6">
            {/* Visual breakdown note */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-mono text-cyan-200">
                  Translated from "visuals" and "gag" fields with full Dragon 9 aesthetic lock-ins.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                4K ANIME / LIQUID CHROME
              </span>
            </div>

            {/* 1. Raw Comma-Separated Image Prompt */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-cyan-950/80 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Raw Comma-Separated Prompt (Midjourney / SD Default)
                </span>
                <button
                  onClick={() => copyToClipboard(result.image.rawPrompt, "rawPrompt")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono border border-cyan-800/60 transition-colors cursor-pointer"
                >
                  {copiedKey === "rawPrompt" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "rawPrompt" ? "COPIED" : "COPY RAW"}</span>
                </button>
              </div>
              <div className="p-3 bg-[#060910] rounded-lg border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed select-all">
                {result.image.rawPrompt}
              </div>
            </div>

            {/* 2. Midjourney v6.1 Command */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-cyan-950/80 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Midjourney v6.1 Discord Command
                </span>
                <button
                  onClick={() => copyToClipboard(result.image.midjourney, "midjourney")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono border border-cyan-800/60 transition-colors cursor-pointer"
                >
                  {copiedKey === "midjourney" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "midjourney" ? "COPIED" : "COPY /IMAGINE"}</span>
                </button>
              </div>
              <div className="p-3 bg-[#060910] rounded-lg border border-cyan-900/40 text-xs font-mono text-cyan-200 leading-relaxed select-all">
                {result.image.midjourney}
              </div>
            </div>

            {/* 3. Stable Diffusion XL Positive & Negative */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-cyan-950/80 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Stable Diffusion XL (SDXL Prompt & Negative)
                </span>
                <button
                  onClick={() => copyToClipboard(`${result.image.stableDiffusion}\n\nNegative prompt: ${result.image.negativePrompt}`, "sdxl")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-purple-900/50 text-purple-300 text-xs font-mono border border-purple-800/60 transition-colors cursor-pointer"
                >
                  {copiedKey === "sdxl" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "sdxl" ? "COPIED" : "COPY SDXL"}</span>
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">POSITIVE PROMPT:</span>
                <div className="p-2.5 bg-[#060910] rounded-md border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed select-all">
                  {result.image.stableDiffusion}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-red-400 block mb-1">NEGATIVE PROMPT:</span>
                <div className="p-2.5 bg-[#060910] rounded-md border border-red-950/60 text-xs font-mono text-red-300/90 leading-relaxed select-all">
                  {result.image.negativePrompt}
                </div>
              </div>
            </div>

            {/* Enforced Aesthetics Badges */}
            <div className="p-3 bg-[#0d121f] rounded-lg border border-slate-800 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Enforced Lock-Ins:</span>
              {result.image.aestheticLockIns?.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[11px]">
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: AUDIO & SFX ==================== */}
        {activeTab === "audio" && (
          <div className="space-y-6">
            {/* Audio Header Note with 432Hz Live Resonance Probe */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-purple-950/30 border border-purple-800/40 gap-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs font-mono text-purple-200">
                  Translated from "audio" and "stageDirections". Tuned to 432Hz harmonic resonance.
                </span>
              </div>
              <button
                onClick={toggle432HzTone}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Activity className={`w-3.5 h-3.5 ${isPlayingTestTone ? "text-emerald-400 animate-spin" : "text-purple-400"}`} />
                <span>{isPlayingTestTone ? "PLAYING 432Hz SINE..." : "TEST 432Hz SUB-SINE"}</span>
              </button>
            </div>

            {/* 1. MusicGen Prompt */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-purple-950/80 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  MusicGen Composition Prompt
                </span>
                <button
                  onClick={() => copyToClipboard(result.audio.musicGen, "musicGen")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-purple-900/50 text-purple-300 text-xs font-mono border border-purple-800/60 transition-colors cursor-pointer"
                >
                  {copiedKey === "musicGen" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "musicGen" ? "COPIED" : "COPY MUSICGEN"}</span>
                </button>
              </div>
              <div className="p-3 bg-[#060910] rounded-lg border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed select-all">
                {result.audio.musicGen}
              </div>
            </div>

            {/* 2. AudioLDM Foley & SFX Prompt */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-purple-950/80 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  AudioLDM Sound Design & SFX Text
                </span>
                <button
                  onClick={() => copyToClipboard(result.audio.audioLdm, "audioLdm")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono border border-cyan-800/60 transition-colors cursor-pointer"
                >
                  {copiedKey === "audioLdm" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "audioLdm" ? "COPIED" : "COPY AUDIOLDM"}</span>
                </button>
              </div>
              <div className="p-3 bg-[#060910] rounded-lg border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed select-all">
                {result.audio.audioLdm}
              </div>
            </div>

            {/* 3. Frequency & Mastering Specs */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                  Frequency Calibration & Mastering Parameters
                </span>
                <button
                  onClick={() => copyToClipboard(result.audio.mastering, "mastering")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedKey === "mastering" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "mastering" ? "COPIED" : "COPY SPECS"}</span>
                </button>
              </div>
              <div className="p-3 bg-[#060910] rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 leading-relaxed select-all">
                {result.audio.mastering}
              </div>

              {result.audio.frequencies && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.audio.frequencies.map((freq) => (
                    <span key={freq} className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                      ⚡ {freq}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: VOICE DIRECTION ==================== */}
        {activeTab === "voice" && (
          <div className="space-y-6">
            {/* Voice Header Note */}
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-mono text-emerald-200">
                Extracted "performanceScript" with cadence mapping for ElevenLabs & AI Voice Cloning engines.
              </span>
            </div>

            {/* 1. Extracted Script */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-emerald-950/80 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Extracted Performance Script (Raw Dialogue)
                </span>
                <button
                  onClick={() => copyToClipboard(result.voice.script, "script")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-emerald-900/50 text-emerald-300 text-xs font-mono border border-emerald-800/60 transition-colors cursor-pointer"
                >
                  {copiedKey === "script" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "script" ? "COPIED" : "COPY SCRIPT"}</span>
                </button>
              </div>
              <div className="p-3.5 bg-[#060910] rounded-lg border border-slate-800 text-xs font-mono text-slate-100 leading-relaxed italic select-all">
                "{result.voice.script}"
              </div>
            </div>

            {/* 2. Emotional / Tonal Delivery Notes */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-purple-950/80 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Voice Actor Delivery & Tonal Notes
                </span>
                <button
                  onClick={() => copyToClipboard(result.voice.deliveryNotes, "deliveryNotes")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-purple-900/50 text-purple-300 text-xs font-mono border border-purple-800/60 transition-colors cursor-pointer"
                >
                  {copiedKey === "deliveryNotes" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "deliveryNotes" ? "COPIED" : "COPY NOTES"}</span>
                </button>
              </div>
              <div className="p-3 bg-[#060910] rounded-lg border border-purple-900/30 text-xs font-mono text-purple-200 leading-relaxed select-all">
                {result.voice.deliveryNotes}
              </div>
            </div>

            {/* 3. Pacing & Cues Script */}
            {result.voice.pacingCues && (
              <div className="p-4 rounded-xl bg-[#0e1422] border border-slate-800 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Pacing & Inflection Markers (ElevenLabs Tagged)
                  </span>
                  <button
                    onClick={() => copyToClipboard(result.voice.pacingCues || "", "pacing")}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#162035] hover:bg-cyan-900/50 text-cyan-300 text-xs font-mono border border-cyan-800/60 transition-colors cursor-pointer"
                  >
                    {copiedKey === "pacing" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "pacing" ? "COPIED" : "COPY TAGGED"}</span>
                  </button>
                </div>
                <div className="p-3 bg-[#060910] rounded-lg border border-slate-800 text-xs font-mono text-cyan-200 leading-relaxed select-all">
                  {result.voice.pacingCues}
                </div>
              </div>
            )}

            {/* 4. ElevenLabs Recommended Parameters Display */}
            <div className="p-4 rounded-xl bg-[#0e1422] border border-slate-800 shadow-md">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block mb-3">
                Recommended ElevenLabs Voice Model Calibration
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-[#070a12] border border-slate-800">
                  <div className="text-slate-400 text-[11px] mb-1">Stability</div>
                  <div className="text-cyan-400 font-bold text-sm">{result.voice.voiceSettings?.stability ?? 45}%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Allows natural urban swagger and comedic tempo shifts</div>
                </div>
                <div className="p-3 rounded-lg bg-[#070a12] border border-slate-800">
                  <div className="text-slate-400 text-[11px] mb-1">Clarity + Similarity</div>
                  <div className="text-purple-400 font-bold text-sm">{result.voice.voiceSettings?.claritySimilarity ?? 85}%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Locks in deep resonant timbre and crisp consonants</div>
                </div>
                <div className="p-3 rounded-lg bg-[#070a12] border border-slate-800">
                  <div className="text-slate-400 text-[11px] mb-1">Style Exaggeration</div>
                  <div className="text-emerald-400 font-bold text-sm">{result.voice.voiceSettings?.styleExaggeration ?? 30}%</div>
                  <div className="text-[10px] text-slate-500 mt-1">Subtle hype and bilingual vocal playfulness</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: ZERO-FILLER PROMPT DECK ==================== */}
        {activeTab === "raw" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-950/30 border border-amber-800/40">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-mono text-amber-200">
                  Zero conversational filler. Pure structured prompts ready for automated ingestion or copy-pasting.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadPromptJson}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/60 text-amber-200 text-xs font-mono font-medium transition-colors cursor-pointer"
                  title="Export this deck as a structured JSON file"
                >
                  <FileJson className="w-3 h-3 text-amber-400" />
                  <span>Export JSON</span>
                </button>
                <button
                  id="btn-copy-deck-raw-tab"
                  onClick={() => copyToClipboard(result.fullPromptDeck, "fullDeckTab")}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold transition-colors cursor-pointer"
                  title="Copy full prompt deck text to clipboard"
                >
                  {copiedKey === "fullDeckTab" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "fullDeckTab" ? "Copied to Clipboard!" : "Copy to Clipboard"}</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 bg-[#05070d] rounded-xl border border-amber-900/40 text-amber-200/90 text-xs font-mono leading-relaxed overflow-x-auto select-all whitespace-pre-wrap">
                {result.fullPromptDeck}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Bottom Action Bar */}
      <div className="px-5 py-3 bg-[#080c14] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">{result.actId}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500">{result.dragon9Cycle}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500">{result.fullPromptDeck.length.toLocaleString()} chars</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-copy-deck-footer"
            onClick={() => copyToClipboard(result.fullPromptDeck, "footerCopy")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
            title="Copy entire generated prompt deck to clipboard"
          >
            {copiedKey === "footerCopy" ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <button
            id="btn-export-json-footer"
            onClick={downloadPromptJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-purple-950/70 hover:bg-purple-900 border border-purple-600/70 text-purple-200 hover:text-white transition-all cursor-pointer"
            title="Download prompt deck as structured JSON"
          >
            <FileJson className="w-3.5 h-3.5 text-purple-400" />
            <span>Export JSON</span>
          </button>

          <button
            id="btn-export-md-footer"
            onClick={downloadPromptDeck}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-[#151c2e] hover:bg-[#1c263e] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Download prompt deck as Markdown"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export MD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
