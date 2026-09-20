import React, { useState, useEffect, useRef } from "react";
import { SAMPLE_MANIFEST_ACTS } from "../data/sampleManifests";
import { BatchProgress } from "../types";
import { 
  FileJson, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  Copy, 
  Check, 
  Play, 
  Sliders, 
  Upload, 
  FolderArchive, 
  RotateCcw,
  ListOrdered,
  FileText,
  Save,
  RotateCcw as ResetIcon
} from "lucide-react";

interface ManifestEditorProps {
  manifestText?: string;
  onManifestChange?: (text: string) => void;
  customDirectives?: string;
  onCustomDirectivesChange?: (directives: string) => void;
  onArchitectSingle: (manifest: any, customDirectives: string) => Promise<void>;
  onArchitectBatch: (manifests: any[], customDirectives: string) => Promise<void>;
  isLoading: boolean;
  batchProgress?: BatchProgress;
  onResetDefaults?: () => void;
}

export const ManifestEditor: React.FC<ManifestEditorProps> = ({ 
  manifestText: controlledManifestText,
  onManifestChange,
  customDirectives: controlledCustomDirectives,
  onCustomDirectivesChange,
  onArchitectSingle, 
  onArchitectBatch, 
  isLoading,
  batchProgress,
  onResetDefaults
}) => {
  const [mode, setMode] = useState<"single" | "multi">("multi");
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  
  // Internal state fallback if not controlled
  const [internalManifestText, setInternalManifestText] = useState<string>(
    JSON.stringify(SAMPLE_MANIFEST_ACTS, null, 2)
  );
  const [internalCustomDirectives, setInternalCustomDirectives] = useState<string>("");

  const manifestText = controlledManifestText !== undefined ? controlledManifestText : internalManifestText;
  const customDirectives = controlledCustomDirectives !== undefined ? controlledCustomDirectives : internalCustomDirectives;

  const setManifestValue = (val: string) => {
    if (onManifestChange) {
      onManifestChange(val);
    } else {
      setInternalManifestText(val);
    }
  };

  const setDirectivesValue = (val: string) => {
    if (onCustomDirectivesChange) {
      onCustomDirectivesChange(val);
    } else {
      setInternalCustomDirectives(val);
    }
  };

  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [detectedActsCount, setDetectedActsCount] = useState<number>(4);
  const [detectedActsList, setDetectedActsList] = useState<any[]>(SAMPLE_MANIFEST_ACTS);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse JSON and detect whether it's an array or single act
  useEffect(() => {
    try {
      const parsed = JSON.parse(manifestText);
      setJsonError(null);

      if (Array.isArray(parsed)) {
        setDetectedActsCount(parsed.length);
        setDetectedActsList(parsed);
        if (parsed.length > 1) {
          setMode("multi");
        }
      } else if (parsed && Array.isArray(parsed.acts)) {
        setDetectedActsCount(parsed.acts.length);
        setDetectedActsList(parsed.acts);
        if (parsed.acts.length > 1) {
          setMode("multi");
        }
      } else if (parsed && Array.isArray(parsed.manifests)) {
        setDetectedActsCount(parsed.manifests.length);
        setDetectedActsList(parsed.manifests);
        if (parsed.manifests.length > 1) {
          setMode("multi");
        }
      } else {
        setDetectedActsCount(1);
        setDetectedActsList([parsed]);
        setMode("single");
      }
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax");
      setDetectedActsCount(0);
      setDetectedActsList([]);
    }
  }, [manifestText]);

  const handleSelectSingleSample = (index: number) => {
    setSelectedSampleIndex(index);
    setMode("single");
    const act = SAMPLE_MANIFEST_ACTS[index];
    setManifestValue(JSON.stringify(act, null, 2));
    setUploadedFileName(null);
  };

  const handleLoadFullSeasonArray = () => {
    setMode("multi");
    setManifestValue(JSON.stringify(SAMPLE_MANIFEST_ACTS, null, 2));
    setUploadedFileName("sample_season_super_puff_4acts.json");
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(manifestText);
      setManifestValue(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // File Upload Handlers (Supports both Drag-and-Drop and Manual Click)
  const processUploadedFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setManifestValue(content);
        setUploadedFileName(file.name);
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) || Array.isArray(parsed?.acts) || Array.isArray(parsed?.manifests)) {
            setMode("multi");
          } else {
            setMode("single");
          }
        } catch {
          // JSON parsing will be caught by useEffect
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFile(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonError || detectedActsList.length === 0) return;

    if (detectedActsCount > 1 || mode === "multi") {
      onArchitectBatch(detectedActsList, customDirectives);
    } else {
      onArchitectSingle(detectedActsList[0], customDirectives);
    }
  };

  return (
    <div className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#0e1422] border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wider font-['Chakra_Petch'] uppercase">
            Manifest Input & Multi-Act Processor
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
            detectedActsCount > 1 
              ? "bg-purple-500/10 text-purple-300 border-purple-500/40" 
              : "bg-cyan-500/10 text-cyan-300 border-cyan-500/40"
          }`}>
            {detectedActsCount > 1 ? `ARRAY [${detectedActsCount} ACTS]` : "SINGLE ACT"}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* LocalStorage persistence indicator */}
          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-[10px] font-mono"
            title="Changes to the manifest are automatically saved to your browser localStorage across reloads"
          >
            <Save className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Persisted</span>
          </div>

          <button
            type="button"
            onClick={handleFormatJson}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-cyan-300 bg-[#141b2d] hover:bg-[#1a233a] border border-slate-700/60 rounded transition-colors cursor-pointer"
            title="Prettify JSON indentation"
          >
            <Layers className="w-3 h-3" />
            <span>Format</span>
          </button>
          <button
            type="button"
            onClick={handleCopyManifest}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-cyan-300 bg-[#141b2d] hover:bg-[#1a233a] border border-slate-700/60 rounded transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          {onResetDefaults && (
            <button
              type="button"
              onClick={onResetDefaults}
              className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-slate-400 hover:text-amber-300 bg-[#141b2d] hover:bg-[#1a233a] border border-slate-700/60 rounded transition-colors cursor-pointer"
              title="Reset manifest and directives back to original Super Puff season defaults"
            >
              <ResetIcon className="w-3 h-3" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector & Quick Presets */}
      <div className="px-4 py-2.5 bg-[#090d16] border-b border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 bg-[#111726] p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("multi");
              if (detectedActsCount <= 1) {
                handleLoadFullSeasonArray();
              }
            }}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === "multi"
                ? "bg-purple-600/30 text-purple-200 border border-purple-500/60 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-purple-400" />
            <span>Multi-Act Array ({detectedActsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("single");
              if (detectedActsCount > 1) {
                handleSelectSingleSample(0);
              }
            }}
            className={`px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === "single"
                ? "bg-cyan-600/30 text-cyan-200 border border-cyan-500/60 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Single Act</span>
          </button>
        </div>

        {/* Preset Loaders */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={handleLoadFullSeasonArray}
            className="px-2.5 py-1 rounded bg-[#131b2e] hover:bg-[#1a253e] text-purple-300 hover:text-purple-200 border border-purple-900/60 hover:border-purple-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Load full 4-act sample season array"
          >
            <FolderArchive className="w-3 h-3 text-purple-400" />
            <span>Load Season Array (4 Acts)</span>
          </button>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 pl-1">
            <span>or Act:</span>
            {SAMPLE_MANIFEST_ACTS.map((act, idx) => (
              <button
                key={act.actId}
                type="button"
                onClick={() => handleSelectSingleSample(idx)}
                className="px-1.5 py-0.5 rounded bg-[#101524] hover:bg-[#182035] text-slate-400 hover:text-cyan-300 border border-slate-800 cursor-pointer"
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* File Upload Drop Zone (Mandatory drag-and-drop and manual select) */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mx-4 mt-3.5 p-3 rounded-lg border-2 border-dashed transition-all cursor-pointer flex items-center justify-between gap-3 ${
          isDragging
            ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            : uploadedFileName
              ? "border-purple-600/50 bg-purple-950/20 hover:border-purple-500"
              : "border-slate-800 bg-[#090d16]/70 hover:border-slate-700 hover:bg-[#0c121e]"
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".json,.txt"
          onChange={handleFileInputChange}
          className="hidden" 
        />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#141b2d] flex items-center justify-center text-cyan-400 border border-slate-700/50">
            <Upload className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono font-medium text-slate-200">
              {uploadedFileName ? `Loaded: ${uploadedFileName}` : "Upload Manifest Array File (.json)"}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Drag & drop or click to browse. Accepts arrays <code className="text-cyan-400">[ ... ]</code> or single acts.
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#141c2e] text-cyan-300 border border-slate-700">
            Browse File
          </span>
        </div>
      </div>

      {/* Detected Acts Preview Strip (when array is detected) */}
      {detectedActsCount > 1 && (
        <div className="mx-4 mt-3 p-2.5 bg-[#090d18] border border-purple-900/40 rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-purple-300 mb-1.5">
            <span className="flex items-center gap-1.5 font-semibold">
              <ListOrdered className="w-3.5 h-3.5 text-purple-400" />
              <span>Multi-Act Queue Detected ({detectedActsCount} Acts):</span>
            </span>
            <span className="text-[10px] text-slate-400">Batch processing enabled</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {detectedActsList.map((act, index) => (
              <div 
                key={act.actId || index}
                className="px-2 py-1 bg-[#121829] border border-slate-800 rounded text-[11px] font-mono text-slate-300 flex items-center gap-1.5"
              >
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <span className="font-semibold text-cyan-300 truncate max-w-[120px]">
                  {act.actId || `Act ${index + 1}`}
                </span>
                <span className="text-slate-500 truncate max-w-[100px] text-[10px] hidden sm:inline">
                  {act.title || ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Body */}
      <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-3">
        {/* JSON Manifest Textarea */}
        <div className="relative">
          <textarea
            value={manifestText}
            onChange={(e) => setManifestValue(e.target.value)}
            rows={12}
            spellCheck={false}
            className={`w-full bg-[#070a12] text-cyan-100 font-mono text-xs leading-relaxed p-3.5 rounded-lg border focus:outline-none transition-colors resize-y ${
              jsonError
                ? "border-red-500/60 focus:border-red-400"
                : "border-cyan-900/50 focus:border-cyan-400/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
            }`}
            placeholder='Paste an Act manifest or JSON array of acts: [ { "actId": "ACT_01", "visuals": "...", "audio": "...", "performanceScript": "..." }, ... ]'
          />
        </div>

        {jsonError && (
          <div className="p-2.5 rounded bg-red-950/40 border border-red-900/60 text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>JSON Parse Error: {jsonError}</span>
          </div>
        )}

        {/* Optional Custom Directives */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-purple-400" />
            <span>Additional Creative Directives (Applies to all generated prompts):</span>
          </label>
          <input
            type="text"
            value={customDirectives}
            onChange={(e) => setDirectivesValue(e.target.value)}
            placeholder="e.g. 21:9 cinematic aspect ratio, high-contrast cel-shaded anime reflections, 432Hz deep sub-bass emphasis..."
            className="w-full bg-[#080c16] text-xs font-mono text-slate-200 px-3 py-2 rounded-lg border border-slate-800 focus:border-purple-500/80 focus:outline-none placeholder:text-slate-600"
          />
        </div>

        {/* Live Batch Progress Indicator */}
        {batchProgress?.isProcessing && (
          <div className="p-3 bg-purple-950/30 border border-purple-800/60 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-purple-200">
              <span className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Batch Processing: Act {batchProgress.current} of {batchProgress.total}</span>
              </span>
              <span className="font-bold text-cyan-300">
                {Math.round((batchProgress.current / batchProgress.total) * 100)}% Complete
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.max(5, (batchProgress.current / batchProgress.total) * 100)}%` }}
              />
            </div>
            {batchProgress.currentActId && (
              <div className="text-[10px] font-mono text-slate-400 truncate">
                Current: <span className="text-cyan-300">{batchProgress.currentActId}</span>
              </div>
            )}
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {detectedActsCount > 1 
                ? `Will process all ${detectedActsCount} acts and queue them in history`
                : "Deconstructs Act into Midjourney, AudioLDM/MusicGen, & ElevenLabs Prompts"}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || Boolean(jsonError) || detectedActsCount === 0}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-['Chakra_Petch'] uppercase tracking-wider text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
              isLoading || Boolean(jsonError) || detectedActsCount === 0
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                : detectedActsCount > 1
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-purple-500/20 hover:shadow-purple-500/30 cursor-pointer active:scale-[0.98]"
                  : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black shadow-cyan-500/20 hover:shadow-cyan-500/30 cursor-pointer active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>
                  {detectedActsCount > 1
                    ? `Processing Multi-Act Batch (${batchProgress?.current || 1}/${detectedActsCount})...`
                    : "Architecting Prompts (Dragon 9)..."}
                </span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {detectedActsCount > 1
                    ? `Architect All ${detectedActsCount} Acts at Once`
                    : "Architect Single Act Prompts"}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
