import { Dragon9Telemetry } from "../types";

// Dragon 9 Protocol Constants
export const D9_HOUR_MINUTES = 54;
export const D9_HOUR_SECONDS = D9_HOUR_MINUTES * 60; // 3240 Earth seconds
export const D9_CYCLE_HOURS = 26.66;
export const D9_CYCLE_SECONDS = D9_CYCLE_HOURS * D9_HOUR_SECONDS; // 86,378.4 Earth seconds

export function calculateDragon9Telemetry(now: Date = new Date()): Dragon9Telemetry {
  const epoch = 1704067200000; // Jan 1, 2024 00:00:00 UTC (Anchor Epoch)
  const currentMs = now.getTime();
  const elapsedSinceEpochSeconds = Math.max(0, (currentMs - epoch) / 1000);

  const cycleNumber = Math.floor(elapsedSinceEpochSeconds / D9_CYCLE_SECONDS) + 1;
  const secondsIntoCycle = elapsedSinceEpochSeconds % D9_CYCLE_SECONDS;

  const currentD9TotalHours = secondsIntoCycle / D9_HOUR_SECONDS;
  const d9HourInt = Math.floor(currentD9TotalHours);
  const remainderSeconds = secondsIntoCycle % D9_HOUR_SECONDS;
  const d9Minute = Math.floor(remainderSeconds / 60); // 0 to 53
  const d9Second = Math.floor(remainderSeconds % 60); // 0 to 59

  const cycleProgressPercent = Math.min(100, Math.max(0, (secondsIntoCycle / D9_CYCLE_SECONDS) * 100));

  let phaseName = "VAPOR-DAWN // RESONANCE INITIATION";
  if (currentD9TotalHours >= 6.0 && currentD9TotalHours < 14.0) {
    phaseName = "LIQUID CHROME MERIDIAN";
  } else if (currentD9TotalHours >= 14.0 && currentD9TotalHours < 20.5) {
    phaseName = "CHRONO-PEAK // SUB-BASS ALIGNMENT";
  } else if (currentD9TotalHours >= 20.5) {
    phaseName = "VOID-DRAFT // FREQUENCY DRIFT";
  }

  const earthTime = now.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return {
    earthTime,
    cycleNumber,
    d9Hour: d9HourInt,
    d9Minute,
    d9Second,
    totalCycleHours: D9_CYCLE_HOURS,
    cycleProgressPercent,
    phaseName,
    frequencyStatus: "432Hz HARMONIC SYNC LOCK",
  };
}

export function formatD9Timecode(telemetry: Dragon9Telemetry): string {
  const hr = String(telemetry.d9Hour).padStart(2, "0");
  const min = String(telemetry.d9Minute).padStart(2, "0");
  const sec = String(telemetry.d9Second).padStart(2, "0");
  return `CYCLE ${String(telemetry.cycleNumber).padStart(2, "0")} // D9-HR ${hr}:${min}:${sec} (54m/h)`;
}
