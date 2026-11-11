import React from 'react';
import { SystemStatus } from '../types';
import { Cpu, Database, Server, Zap, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SystemStatusBarProps {
  systemStatus: SystemStatus | null;
  engineStatus: any;
  onRefresh: () => void;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  systemStatus,
  engineStatus,
  onRefresh,
}) => {
  if (!systemStatus) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
      case 'offline': return 'text-red-400 bg-red-950/50 border-red-800/60';
      case 'degraded': return 'text-amber-400 bg-amber-950/50 border-amber-800/60';
      default: return 'text-slate-400 bg-slate-950/50 border-slate-800/60';
    }
  };

  return (
    <div className="glass rounded-2xl p-4 border border-slate-800/60 animate-slide-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-800/60">
            <Server className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="font-bold text-white">Lilith Gateway</p>
            <p className="text-xs text-slate-400">v{systemStatus.gateway_version} • {systemStatus.timestamp}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(systemStatus.status)}`}>
              {systemStatus.status.toUpperCase()}
            </span>
            {systemStatus.vms_available && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-950/50 text-emerald-400 border-emerald-800/60">
                VMs Ready
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-mono">{systemStatus.cpu_load || 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300 font-mono">{systemStatus.memory_used || 'N/A'}</span>
          </div>

          {engineStatus && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-mono capitalize">{engineStatus.status || 'idle'}</span>
              {engineStatus.progress > 0 && (
                <>
                  <span className="text-slate-500">•</span>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${engineStatus.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-amber-400 font-mono">{engineStatus.progress}%</span>
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onRefresh}
          className="btn-secondary text-sm self-end lg:self-auto"
        >
          <TrendingUp className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  );
};