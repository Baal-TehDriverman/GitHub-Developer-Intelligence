import React, { useState, useEffect } from 'react';
import {
  Server,
  Monitor,
  Cpu,
  Database,
  Play,
  Square,
  RotateCcw,
  Terminal,
  Search,
  RefreshCw,
  Loader2,
  Zap,
  Sparkles,
  Shield,
  Link2,
  Grid,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { AppsData, AppInfo, VmsData, VMInfo, SystemStatus } from '../types';
import { fetchApps, fetchVMs, launchApp, vmAction, openVmConsole, openVmManager, fetchSystemStatus, searchApps } from '../api';
import { GATEWAY_URL, GATEWAY_LINKS_ENABLED } from '../config';

interface LilithGatewaySectionProps {
  systemStatus: SystemStatus | null;
  onLaunchApp: (name: string) => void;
  onVmAction: (action: string, vmName: string) => void;
}

export const LilithGatewaySection: React.FC<LilithGatewaySectionProps> = ({
  systemStatus,
  onLaunchApp,
  onVmAction,
}) => {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [vms, setVms] = useState<VMInfo[]>([]);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchResults, setSearchResults] = useState<AppInfo[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appsData, vmsData, catsData] = await Promise.all([
        fetchApps(),
        fetchVMs(),
        fetchCategories(),
      ]);
      setApps(appsData.apps || []);
      setVms(vmsData.vms || []);
      setCategories(catsData.categories || {});
    } catch (error) {
      console.error('Failed to load gateway data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    const response = await fetch('/api/gateway/categories');
    return response.json();
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const results = await searchApps(query);
      setSearchResults(results.apps || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const filteredApps = searchResults !== null 
    ? searchResults 
    : apps.filter(app => 
        selectedCategory === 'All' || app.categories.includes(selectedCategory)
      ).filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const availableCategories = ['All', ...Object.keys(categories).sort()];

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800/60">
              <Server className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Lilith Gateway</h2>
              <p className="text-slate-400">System control plane • Apps • VMs • LLM Proxy</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={loadData} className="btn-secondary" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {GATEWAY_LINKS_ENABLED && (
              <a href={GATEWAY_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <ExternalLink className="w-4 h-4" />
                Open Dashboard
              </a>
            )}
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Cpu className="w-5 h-5" />}
          iconBg="bg-cyan-950/50 border-cyan-800/60"
          iconColor="text-cyan-400"
          label="CPU Load"
          value={systemStatus?.cpu_load || 'N/A'}
          trend="stable"
        />
        <MetricCard
          icon={<Database className="w-5 h-5" />}
          iconBg="bg-purple-950/50 border-purple-800/60"
          iconColor="text-purple-400"
          label="Memory"
          value={systemStatus?.memory_used || 'N/A'}
          trend="stable"
        />
        <MetricCard
          icon={<Zap className="w-5 h-5" />}
          iconBg="bg-amber-950/50 border-amber-800/60"
          iconColor="text-amber-400"
          label="Gateway"
          value={`v${systemStatus?.gateway_version || 'N/A'}`}
          trend="stable"
        />
        <MetricCard
          icon={<Monitor className="w-5 h-5" />}
          iconBg="bg-emerald-950/50 border-emerald-800/60"
          iconColor="text-emerald-400"
          label="VMs"
          value={systemStatus?.vms_available ? 'Available' : 'Unavailable'}
          trend={systemStatus?.vms_available ? 'up' : 'down'}
        />
      </div>

      {/* Apps Section */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/50 border border-purple-800/60">
              <Grid className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Applications ({apps.length})</h3>
              <p className="text-xs text-slate-400">Launch GUI and terminal apps</p>
            </div>
          </div>
          
          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  handleSearch(val);
                }}
                placeholder="Search apps..."
                className="input-field w-64 lg:w-80"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSearchResults(null);
              }}
              className="select-field"
            >
              {availableCategories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900">
                  {cat} {categories[cat] && `(${categories[cat]})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {searching && (
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            Searching...
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 rounded-xl bg-slate-900/60 border border-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No applications match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredApps.map(app => (
              <AppCard key={app.name} app={app} onLaunch={onLaunchApp} />
            ))}
          </div>
        )}
      </div>

      {/* VMs Section */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-800/60">
              <Monitor className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Virtual Machines ({vms.length})</h3>
              <p className="text-xs text-slate-400">Manage QEMU/KVM virtual machines</p>
            </div>
          </div>
          <button onClick={openVmManager} className="btn-secondary">
            <ExternalLink className="w-4 h-4" />
            Open virt-manager
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-slate-900/60 border border-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : vms.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No virtual machines found.</p>
            <p className="text-xs mt-1">Use virt-manager to create VMs.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vms.map(vm => (
              <VmCard key={vm.name} vm={vm} onAction={onVmAction} onConsole={openVmConsole} />
            ))}
          </div>
        )}
      </div>

      {/* LLM Proxy Status */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-pink-950/50 border border-pink-800/60">
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">LLM Proxy (Ollama)</h3>
            <p className="text-xs text-slate-400">OpenAI-compatible API at <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">{GATEWAY_URL || 'http://localhost:8080'}/v1</code></p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <EndpointCard 
            method="POST" 
            path="/v1/chat/completions" 
            desc="Chat completions endpoint" 
            auth={true} 
          />
          <EndpointCard 
            method="GET" 
            path="/v1/models" 
            desc="List available models" 
            auth={true} 
          />
          <EndpointCard 
            method="GET" 
            path="/api/msn/status" 
            desc="MSN Integration health" 
            auth={false} 
          />
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
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
    <p className="text-2xl font-bold text-white font-mono truncate">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{label}</p>
  </div>
);

const AppCard: React.FC<{ app: AppInfo; onLaunch: (name: string) => void }> = ({ app, onLaunch }) => (
  <button
    onClick={() => onLaunch(app.name)}
    className="group glass rounded-xl p-4 border border-slate-800/60 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all text-left"
  >
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-lg bg-slate-800/60 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-950/50 transition-colors">
        {app.terminal ? <Terminal className="w-5 h-5 text-purple-400" /> : <Monitor className="w-5 h-5 text-cyan-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">{app.name}</p>
        <p className="text-xs text-slate-400 truncate mt-1">{app.description || 'No description'}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {app.categories.slice(0, 3).map(cat => (
            <span key={cat} className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-300 rounded border border-slate-700">
              {cat}
            </span>
          ))}
        </div>
      </div>
      <Play className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
    </div>
  </button>
);

const VmCard: React.FC<{ 
  vm: VMInfo; 
  onAction: (action: string, name: string) => void;
  onConsole: (name: string) => void;
}> = ({ vm, onAction, onConsole }) => {
  const isRunning = vm.state === 'running';
  
  return (
    <div className="glass rounded-xl p-4 border border-slate-800/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isRunning ? 'bg-emerald-950/50' : 'bg-slate-800/60'}`}>
            <Monitor className={`w-5 h-5 ${isRunning ? 'text-emerald-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <p className="font-semibold text-white">{vm.name}</p>
            <p className="text-xs text-slate-400">
              {vm.vcpu} vCPU • {vm.memory} MB RAM • {vm.state}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          <select
            defaultValue={vm.state}
            onChange={(e) => onAction(e.target.value, vm.name)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:border-cyan-500"
          >
            <option value="start" disabled={isRunning}>Start</option>
            <option value="shutdown" disabled={!isRunning}>Shutdown</option>
            <option value="reboot" disabled={!isRunning}>Reboot</option>
            <option value="reset" disabled={!isRunning}>Reset</option>
          </select>
          <button
            onClick={() => onConsole(vm.name)}
            className="p-2 glass hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            title="Open Console"
          >
            <Terminal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const EndpointCard: React.FC<{ method: string; path: string; desc: string; auth: boolean }> = ({ method, path, desc, auth }) => (
  <div className="glass rounded-xl p-4 border border-slate-800/60">
    <div className="flex items-center gap-2 mb-2">
      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
        method === 'POST' ? 'bg-amber-950 text-amber-400' :
        method === 'GET' ? 'bg-emerald-950 text-emerald-400' :
        'bg-purple-950 text-purple-400'
      }`}>
        {method}
      </span>
      <code className="text-sm text-cyan-300 font-mono bg-slate-900 px-2 py-0.5 rounded">{path}</code>
    </div>
    <p className="text-xs text-slate-400 mb-2">{desc}</p>
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${auth ? 'bg-red-950/50 text-red-400 border border-red-800/60' : 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/60'}`}>
      {auth ? <Shield className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
      {auth ? 'Auth Required' : 'Public'}
    </span>
  </div>
);