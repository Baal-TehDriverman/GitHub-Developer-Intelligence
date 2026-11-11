import React from 'react';
import { Monitor, Terminal, Eye } from 'lucide-react';

const VNC_STATUS = {
  display: ':1',
  port: 5901,
  resolution: '1280x720',
  window_manager: 'fluxbox',
  pid: 'check',
  running: true,
};

export const VncStatusCard: React.FC = () => {
  const v = VNC_STATUS;

  return (
    <div className="glass rounded-xl p-5 border border-slate-800/60">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-indigo-950/50 border border-indigo-800/60">
          <Monitor className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="font-bold text-white">VNC Desktop</h3>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${v.running ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
          {v.running ? 'Running' : 'Offline'}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-slate-400">Display</span><span className="text-white font-mono">{v.display}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">VNC Port</span><span className="text-white font-mono">{v.port}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Resolution</span><span className="text-white">{v.resolution}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">WM</span><span className="text-white">{v.window_manager}</span></div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="btn-secondary text-xs flex-1"><Eye className="w-3 h-3" /> View</button>
        <button className="btn-secondary text-xs flex-1"><Terminal className="w-3 h-3" /> Console</button>
      </div>
    </div>
  );
};