import React, { useState } from 'react';
import { Activity, Cpu, Thermometer, Zap, RefreshCw, BarChart3 } from 'lucide-react';

const TELEMETRY = {
  session: "Crimson Desert NGD v2.0",
  gpu: "NVIDIA GeForce RTX 3060 Laptop GPU",
  driver: "610.43.03",
  metrics: {
    fps: 74.2, fps_cap: 50, gpu_util: 99.0, mem_util: 100.0,
    vram_used: 4191, vram_total: 6144, gpu_temp: 44.0, gpu_power: 52.6,
    gpu_clock: 1110, mem_clock: 810, pstate: "P5", dlss: "quality"
  },
  issues: [
    "VRAM at 68% - texture streaming pressure high",
    "FPS cap 50 but hitting 74 - frame pacing issue",
    "GPU power 52W at P5 state - not optimal",
    "DLSS quality mode - could try performance/ultra-perf"
  ]
};

export const NvidiaTelemetrySection: React.FC = () => {
  const [data] = useState(TELEMETRY);
  const m = data.metrics;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-950/50 border border-green-800/60">
            <Activity className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Nvidia Gratitude Driver</h2>
            <p className="text-slate-400">{data.gpu} • Driver {data.driver}</p>
          </div>
          <button className="btn-secondary"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricBox icon={<Zap className="w-4 h-4" />} label="FPS" value={m.fps} unit="" color="emerald" />
        <MetricBox icon={<Cpu className="w-4 h-4" />} label="GPU Util" value={m.gpu_util} unit="%" color="cyan" />
        <MetricBox icon={<Thermometer className="w-4 h-4" />} label="Temp" value={m.gpu_temp} unit="°C" color="amber" />
        <MetricBox icon={<BarChart3 className="w-4 h-4" />} label="VRAM" value={Math.round(m.vram_used / 1024 * 10) / 10} unit={`/${Math.round(m.vram_total / 1024 * 10) / 10}GB`} color="purple" />
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <h3 className="font-bold text-white text-lg mb-4">Issues Detected</h3>
        <div className="space-y-2">
          {data.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-950/20 border border-amber-800/40">
              <span className="text-amber-400 text-xs font-mono mt-0.5">⚠</span>
              <span className="text-sm text-slate-300">{issue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricBox: React.FC<{ icon: React.ReactNode; label: string; value: number | string; unit: string; color: string }> = ({ icon, label, value, unit, color }) => (
  <div className="glass rounded-xl p-4 border border-slate-800/60">
    <div className={`p-2 rounded-lg bg-${color}-950/50 border border-${color}-800/60 inline-flex mb-2 text-${color}-400`}>{icon}</div>
    <p className="text-xs text-slate-400">{label}</p>
    <p className="text-xl font-bold text-white font-mono">{value}<span className="text-xs text-slate-400 ml-1">{unit}</span></p>
  </div>
);