import React, { useState } from "react";
import { ArchitectResult } from "../types";
import { 
  History, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Layers, 
  FileText,
  FileJson,
  ChevronRight,
  Sparkles,
  ExternalLink
} from "lucide-react";

interface HistoryQueueBarProps {
  history: ArchitectResult[];
  currentResult: ArchitectResult | null;
  onSelectResult: (result: ArchitectResult) => void;
  onClearHistory: () => void;
}

export const HistoryQueueBar: React.FC<HistoryQueueBarProps> = ({
  history,
  currentResult,
  onSelectResult,
  onClearHistory,
}) => {
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  if (history.length === 0) return null;

  const handleCopyAllPrompts = () => {
    const combined = history.map((act) => act.fullPromptDeck).join("\n\n" + "=".repeat(80) + "\n\n");
    navigator.clipboard.writeText(combined);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadAllMarkdown = () => {
    const combined = `# SUPER PUFF // DRAGON 9 PROTOCOL PRODUCTION PROMPT DECK
Generated: ${new Date().toISOString()}
Total Acts: ${history.length}
Temporal Framework: 54-minute hours / 26.66-hour cycles

` + history.map((act, i) => `## ACT ${i + 1}: ${act.actId} - ${act.title}\n\n${act.fullPromptDeck}`).join("\n\n---\n\n");

    const blob = new Blob([combined], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `super_puff_dragon9_season_prompts_${history.length}_acts.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllJson = () => {
    const payload = {
      project: "Super Puff",
      protocol: "Dragon 9 Protocol (54-min hour / 26.66-hr cycle)",
      exportedAt: new Date().toISOString(),
      actsCount: history.length,
      acts: history
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `super_puff_dragon9_season_prompts_${history.length}_acts.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
      {/* Header with Batch Export Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase font-mono tracking-wider">
            Act History & Batch Queue
          </span>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
            {history.length} {history.length === 1 ? "Act" : "Acts"} Queued
          </span>
        </div>

        {/* Global Batch Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            type="button"
            onClick={handleCopyAllPrompts}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131b2e] hover:bg-[#1a253e] text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
            title="Copy all acts' prompt decks to clipboard at once"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? "Copied All" : "Copy All"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAllJson}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-950/70 hover:bg-purple-900 border border-purple-600/70 text-purple-200 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            title="Download full season prompts as JSON (.json)"
          >
            <FileJson className="w-3.5 h-3.5 text-purple-400" />
            <span>Export Season (.json)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAllMarkdown}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#151c2e] hover:bg-[#1c263e] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Download full season markdown with all Midjourney, AudioLDM, MusicGen, and ElevenLabs prompts"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Season (.md)</span>
          </button>

          <button
            type="button"
            onClick={onClearHistory}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
            title="Clear history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Act Queue Selector Chips / List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {history.map((act, index) => {
          const isSelected = currentResult?.actId === act.actId;
          return (
            <button
              key={act.actId + index}
              onClick={() => onSelectResult(act)}
              className={`p-2.5 rounded-lg text-left transition-all border flex flex-col justify-between gap-1.5 relative overflow-hidden group ${
                isSelected
                  ? "bg-gradient-to-br from-cyan-950/70 to-purple-950/50 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "bg-[#0f1422] hover:bg-[#151c2e] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-1.5 h-full bg-cyan-400" />
              )}
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  isSelected ? "bg-cyan-500/30 text-cyan-200" : "bg-slate-800 text-slate-400"
                }`}>
                  ACT {index + 1}
                </span>
                <span className="text-[10px] font-mono text-purple-400/80 truncate">
                  {act.actId.replace("ACT_", "")}
                </span>
              </div>

              <div className="font-semibold text-xs text-slate-200 font-['Chakra_Petch'] truncate">
                {act.title}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="text-cyan-400/80 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Ready
                </span>
                <span className="group-hover:translate-x-0.5 transition-transform flex items-center text-slate-400">
                  Inspect <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
