import React, { useState, useEffect } from 'react';
import {
  Zap,
  Cpu,
  Database,
  HardDrive,
  Play,
  Square,
  RotateCcw,
  Terminal,
  RefreshCw,
  Loader2,
  Sparkles,
  Shield,
  Link2,
  AlertTriangle,
  CheckCircle,
  Code2,
  Box,
  FileCode,
  Search,
  Trash2,
  Hammer,
  Check,
  X,
} from 'lucide-react';
import { EngineStatus, BuildRequest, EngineArtifacts } from '../types';
import { fetchEngineStatus, triggerEngineBuild, fetchEngineArtifacts, runEngineTests, fetchRomStatus } from '../api';
import { GATEWAY_URL, GATEWAY_LINKS_ENABLED } from '../config';

interface BlackSpaceEngineSectionProps {
  engineStatus: EngineStatus | null;
  onBuild: (request: BuildRequest) => void;
  onTest: () => void;
  onRefresh: () => void;
}

export const BlackSpaceEngineSection: React.FC<BlackSpaceEngineSectionProps> = ({
  engineStatus,
  onBuild,
  onTest,
  onRefresh,
}) => {
  const [buildType, setBuildType] = useState<'Debug' | 'Release'>('Debug');
  const [cleanBuild, setCleanBuild] = useState(false);
  const [buildTarget, setBuildTarget] = useState('');
  const [building, setBuilding] = useState(false);
  const [testing, setTesting] = useState(false);
  const [artifacts, setArtifacts] = useState<EngineArtifacts | null>(null);
  const [logs, setLogs] = useState<EngineStatus['last_logs']>([]);
  const [romStatus, setRomStatus] = useState<{ found: boolean; path: string; size?: number } | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (engineStatus) {
      setLogs(engineStatus.last_logs || []);
    }
    loadArtifacts();
    loadRomStatus();
  }, [engineStatus]);

  const loadArtifacts = async () => {
    try {
      const data = await fetchEngineArtifacts();
      setArtifacts(data.artifacts);
    } catch (e) {
      console.error('Failed to load artifacts:', e);
    }
  };

  const loadRomStatus = async () => {
    try {
      const data = await fetchRomStatus();
      setRomStatus(data);
    } catch (e) {
      console.error('Failed to load ROM status:', e);
    }
  };

  const handleBuild = async () => {
    setBuilding(true);
    try {
      await onBuild({ build_type: buildType, clean: cleanBuild, target: buildTarget });
    } catch (e) {
      console.error('Build failed:', e);
    } finally {
      setBuilding(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await onTest();
    } catch (e) {
      console.error('Test failed:', e);
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60';
      case 'building': return 'text-amber-400 bg-amber-950/50 border-amber-800/60 animate-pulse';
      case 'failed': return 'text-red-400 bg-red-950/50 border-red-800/60';
      case 'testing': return 'text-blue-400 bg-blue-950/50 border-blue-800/60';
      default: return 'text-slate-400 bg-slate-950/50 border-slate-800/60';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'building': return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'failed': return <X className="w-5 h-5" />;
      case 'testing': return <RotateCcw className="w-5 h-5 animate-spin" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/60">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">BlackSpace Engine</h2>
              <p className="text-slate-400">Zelda OOT Engine Build Pipeline</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={onRefresh} className="btn-secondary" disabled={building || testing}>
              <RefreshCw className={`w-4 h-4 ${(building || testing) ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={() => setShowLogs(!showLogs)} className="btn-secondary">
              <Terminal className="w-4 h-4" />
              {showLogs ? 'Hide' : 'Show'} Logs
            </button>
            {GATEWAY_LINKS_ENABLED && (
              <a href={GATEWAY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <Link2 className="w-4 h-4" />
                Gateway
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          icon={<Zap className="w-5 h-5" />}
          iconBg="bg-amber-950/50 border-amber-800/60"
          iconColor="text-amber-400"
          label="Build Status"
          value={
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(engineStatus?.status || 'idle')}`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(engineStatus?.status || 'idle')}
                {engineStatus?.status || 'idle'}
              </span>
            </span>
          }
          trend="stable"
        />
        <StatusCard
          icon={<Cpu className="w-5 h-5" />}
          iconBg="bg-cyan-950/50 border-cyan-800/60"
          iconColor="text-cyan-400"
          label="Progress"
          value={
            <div className="w-32">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${engineStatus?.progress || 0}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{engineStatus?.progress || 0}%</p>
            </div>
          }
          trend="stable"
        />
        <StatusCard
          icon={<HardDrive className="w-5 h-5" />}
          iconBg="bg-purple-950/50 border-purple-800/60"
          iconColor="text-purple-400"
          label="Executables"
          value={artifacts?.executables?.length || 0}
          trend="stable"
        />
        <StatusCard
          icon={<Database className="w-5 h-5" />}
          iconBg="bg-emerald-950/50 border-emerald-800/60"
          iconColor="text-emerald-400"
          label="Libraries"
          value={artifacts?.libraries?.length || 0}
          trend="stable"
        />
      </div>

      {/* Build Configuration */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Hammer className="w-5 h-5 text-amber-400" />
          Build Configuration
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Build Type</label>
            <select
              value={buildType}
              onChange={(e) => setBuildType(e.target.value as 'Debug' | 'Release')}
              className="select-field w-full"
            >
              <option value="Debug" className="bg-slate-900">Debug</option>
              <option value="Release" className="bg-slate-900">Release</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Target (optional)</label>
            <input
              type="text"
              value={buildTarget}
              onChange={(e) => setBuildTarget(e.target.value)}
              placeholder="e.g., zelda_engine, tests"
              className="input-field"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cleanBuild}
                onChange={(e) => setCleanBuild(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-slate-300">Clean build (--fresh)</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleBuild}
            disabled={building || testing}
            className={`btn-primary ${building ? 'opacity-50' : ''}`}
          >
            {building ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Build
              </>
            )}
          </button>
          
          <button
            onClick={handleTest}
            disabled={building || testing}
            className={`btn-secondary ${testing ? 'opacity-50' : ''}`}
          >
            {testing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Run Tests
              </>
            )}
          </button>
          
          <button onClick={loadArtifacts} className="btn-ghost">
            <FileCode className="w-4 h-4" />
            Refresh Artifacts
          </button>
        </div>

        {engineStatus?.current_step && (
          <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
            <p className="text-xs text-slate-400">Current Step: <span className="text-slate-200 font-mono">{engineStatus.current_step}</span></p>
            {engineStatus.last_build && (
              <p className="text-xs text-slate-400 mt-1">Last Build: <span className="text-slate-200">{new Date(engineStatus.last_build).toLocaleString()}</span></p>
            )}
          </div>
        )}
      </div>

      {/* ROM Status */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Box className="w-5 h-5 text-purple-400" />
          OoT ROM Status
        </h3>
        {romStatus ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${romStatus.found ? 'bg-emerald-950/50 border-emerald-800/60' : 'bg-red-950/50 border-red-800/60'}`}>
                {romStatus.found ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-white">{romStatus.found ? 'ROM Found' : 'ROM Not Found'}</p>
                <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{romStatus.path}</p>
                {romStatus.size && (
                  <p className="text-xs text-slate-500 mt-1">Size: {(romStatus.size / (1024 * 1024)).toFixed(1)} MB</p>
                )}
              </div>
            </div>
            {romStatus.found && (
              <span className="text-xs text-emerald-400 font-mono">
                Ready for asset extraction
              </span>
            )}
          </div>
        ) : (
          <p className="text-slate-400">Loading ROM status...</p>
        )}
      </div>

      {/* Artifacts */}
      {artifacts && (artifacts.executables.length > 0 || artifacts.libraries.length > 0 || artifacts.tests.length > 0) && (
        <div className="glass rounded-2xl p-6 border border-slate-800/60">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            Build Artifacts
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {artifacts.executables.length > 0 && (
              <ArtifactList title="Executables" icon={<Box className="w-4 h-4" />} items={artifacts.executables} color="text-cyan-400" />
            )}
            {artifacts.libraries.length > 0 && (
              <ArtifactList title="Libraries" icon={<Database className="w-4 h-4" />} items={artifacts.libraries} color="text-purple-400" />
            )}
            {artifacts.tests.length > 0 && (
              <ArtifactList title="Tests" icon={<Check className="w-4 h-4" />} items={artifacts.tests} color="text-emerald-400" />
            )}
          </div>
        </div>
      )}

      {/* Build Logs */}
      {showLogs && logs.length > 0 && (
        <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-slate-400" />
              Build Logs ({logs.length})
            </h3>
            <button onClick={() => setShowLogs(false)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto bg-slate-950 font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className={`py-0.5 px-2 ${getLogLevelColor(log.level)}`}>
                <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="ml-2">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatusCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
}> = ({ icon, iconBg, iconColor, label, value, trend }) => (
  <div className="glass rounded-xl p-4 border border-slate-800/60">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg border ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
        {trend === 'up' && '↑'} {trend === 'down' && '↓'}
      </span>
    </div>
    <div className="text-2xl font-bold text-white font-mono">{value}</div>
    <p className="text-xs text-slate-400 mt-1">{label}</p>
  </div>
);

const ArtifactList: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: EngineStatus['artifacts']['executables'];
  color: string;
}> = ({ title, icon, items, color }) => (
  <div>
    <h4 className={`font-medium text-sm ${color} mb-3 flex items-center gap-2`}>
      {icon} {title} ({items.length})
    </h4>
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {items.map((item, i) => (
        <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <p className="font-mono text-xs text-white truncate">{item.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{item.path}</p>
          <p className="text-[10px] text-slate-500 mt-1">{(item.size / 1024).toFixed(1)} KB</p>
        </div>
      ))}
    </div>
  </div>
);

const getLogLevelColor = (level: string) => {
  switch (level) {
    case 'error': return 'text-red-400';
    case 'success': return 'text-emerald-400';
    case 'debug': return 'text-slate-500';
    default: return 'text-slate-300';
  }
};