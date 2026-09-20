import React, { useState } from "react";
import { Check, Copy, Sparkles, ShieldCheck } from "lucide-react";

export const CORE_AESTHETIC_LOCK_INS = [
  { name: "4K Anime Styling", tag: "4K anime styling", desc: "Crisp vector lines, cel-shaded precision, hyper-detailed character geometry" },
  { name: "Glassmorphism Overlays", tag: "glassmorphism overlays", desc: "Frosted translucent interface panels, refractive depth, blurred background bleed" },
  { name: "Liquid Chrome Physics", tag: "liquid chrome physics", desc: "Mercury-like fluid viscosity, mirror reflections, flowing metallic droplets" },
  { name: "Neon Aqua / Violet", tag: "neon aqua and violet highlights", desc: "Signature Super Puff palette, high-contrast cyan glow against deep ultraviolet" },
  { name: "Volumetric Lighting", tag: "volumetric lighting", desc: "Atmospheric light shafts cutting through vapor haze, dust motes, radiant rim light" },
  { name: "Vector Graphic Style", tag: "vector graphic style", desc: "Clean graphical edges, stylized decals, streetwear sticker-bomb aesthetic" },
];

export const AestheticLockInsBar: React.FC = () => {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const handleCopy = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1800);
  };

  return (
    <div className="w-full bg-[#0b0f19]/90 border border-slate-800/80 rounded-xl p-3 sm:p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-['Chakra_Petch']">
            Core Aesthetic Lock-Ins (Mandatory Pipeline Specs)
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          Always Enforced
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {CORE_AESTHETIC_LOCK_INS.map((item) => (
          <button
            key={item.name}
            onClick={() => handleCopy(item.tag)}
            className="group relative flex flex-col items-start text-left p-2 rounded-lg bg-[#111726] hover:bg-[#162035] border border-cyan-950 hover:border-cyan-500/40 transition-all cursor-pointer"
            title={`Click to copy: "${item.tag}"`}
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[11px] font-medium text-cyan-300 group-hover:text-cyan-200 truncate">
                {item.name}
              </span>
              {copiedTag === item.tag ? (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <span className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
              {item.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
