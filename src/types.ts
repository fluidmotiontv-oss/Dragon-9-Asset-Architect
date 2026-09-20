export interface SuperPuffCharacter {
  name: string;
  design?: string;
  role?: string;
}

export interface SuperPuffManifestAct {
  actId: string;
  title: string;
  timecode?: string;
  dragon9Cycle?: string;
  characters?: SuperPuffCharacter[];
  visuals: string;
  gag?: string;
  audio: string;
  stageDirections?: string;
  performanceScript: string;
  notes?: string;
}

export interface ImagePromptAssets {
  rawPrompt: string;
  midjourney: string;
  stableDiffusion: string;
  negativePrompt: string;
  aestheticLockIns: string[];
}

export interface AudioPromptAssets {
  musicGen: string;
  audioLdm: string;
  mastering: string;
  frequencies: string[];
}

export interface VoiceActorSettings {
  stability: number;
  claritySimilarity: number;
  styleExaggeration: number;
  speakerBoost: boolean;
}

export interface VoicePromptAssets {
  script: string;
  deliveryNotes: string;
  voiceSettings: VoiceActorSettings;
  pacingCues?: string;
}

export interface ArchitectResult {
  actId: string;
  title: string;
  dragon9Cycle: string;
  image: ImagePromptAssets;
  audio: AudioPromptAssets;
  voice: VoicePromptAssets;
  fullPromptDeck: string;
}

export interface Dragon9Telemetry {
  earthTime: string;
  cycleNumber: number;
  d9Hour: number;
  d9Minute: number;
  d9Second: number;
  totalCycleHours: number; // 26.66
  cycleProgressPercent: number;
  phaseName: string;
  frequencyStatus: string;
}

export interface BatchProgress {
  current: number;
  total: number;
  currentActId?: string;
  isProcessing: boolean;
}
