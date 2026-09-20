import React, { useEffect, useState } from "react";
import { calculateDragon9Telemetry, formatD9Timecode } from "../utils/dragon9Protocol";
import { Dragon9Telemetry } from "../types";
import { Clock, Cpu, Radio, Zap } from "lucide-react";

export const Dragon9Header: React.FC = () => {
  const [telemetry, setTelemetry] = useState<Dragon9Telemetry>(calculateDragon9Telemetry());

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(calculateDragon9Telemetry());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative w-full border-b border-cyan-900/40 bg-[#07090e]/95 backdrop-blur-md px-4 py-3 sm:px-6 lg:px-8">
      {/* Subtle top neon accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-purple-500/80" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Brand / Persona */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-wider text-slate-100 font-['Chakra_Petch'] uppercase">
                Dragon 9 Asset Architect
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Super Puff Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>SPECIALIZED AI ASSET DECONSTRUCTOR</span>
              <span className="text-slate-600">•</span>
              <span className="text-purple-400">MIDJOURNEY / AUDIOLDM / ELEVENLABS</span>
            </p>
          </div>
        </div>

        {/* Right: Dragon 9 Protocol Telemetry Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          {/* D9 Protocol Clock Widget */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0d121d] border border-cyan-900/50 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[10px]">D9 PROTOCOL:</span>
                <span className="text-cyan-300 font-semibold tracking-wide">
                  {formatD9Timecode(telemetry)}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                54m Hour • 26.66h Cycle • Earth UTC: {telemetry.earthTime}
              </span>
            </div>
          </div>

          {/* Cycle Phase & Frequency Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0d121d] border border-purple-900/40">
            <Radio className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">PHASE:</span>
                <span className="text-purple-300 font-medium text-[11px] truncate max-w-[170px]">
                  {telemetry.phaseName}
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {telemetry.frequencyStatus}
              </span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[11px]">
            <Cpu className="w-3.5 h-3.5" />
            <span>ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
};
