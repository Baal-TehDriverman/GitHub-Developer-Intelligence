import React from 'react';
import { 
  GitHubUser, 
  SystemStatus, 
  EngineStatus, 
  DreamEntry,
  GitHubRepo,
  TabId
} from '../types';
import { 
  Code2, 
  Server, 
  Cpu, 
  Database, 
  Zap, 
  Brain,
  ArrowRight,
  ExternalLink,
  FolderGit2,
  Star,
  Clock,
  Sparkles,
  TrendingUp,
  Layers
} from 'lucide-react';
import { formatDate, formatSize, getLanguageColor } from '../api';

interface DashboardOverviewProps {
  systemStatus: SystemStatus | null;
  githubProfile: GitHubUser | null;
  repos: GitHubRepo[];
  engineStatus: EngineStatus | null;
  dreamsData: { dreams: DreamEntry[]; count: number } | null;
  onRepoSelect: (repo: GitHubRepo) => void;
  onTabChange: (tab: TabId) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  systemStatus,
  githubProfile,
  repos,
  engineStatus,
  dreamsData,
  onRepoSelect,
  onTabChange,
}) => {
  const stats = [
    {
      icon: Code2,
      label: 'Repositories',
      value: githubProfile?.public_repos || repos.length,
      color: 'cyan',
      trend: '+2 this month',
      action: () => onTabChange('github'),
    },
    {
      icon: Server,
      label: 'System Load',
      value: systemStatus?.cpu_load?.split(' ')[0] || '0.00',
      color: 'purple',
      trend: systemStatus?.memory_used || 'Unknown',
      action: () => onTabChange('gateway'),
    },
    {
      icon: Cpu,
      label: 'Engine Status',
      value: engineStatus?.status || 'idle',
      color: engineStatus?.status === 'building' ? 'amber' : engineStatus?.status === 'success' ? 'emerald' : 'slate',
      trend: engineStatus?.current_step || 'Ready',
      action: () => onTabChange('engine'),
    },
    {
      icon: Brain,
      label: 'Dream Cycles',
      value: dreamsData?.count || 0,
      color: 'pink',
      trend: dreamsData?.dreams[0] ? `Last: ${formatDate(dreamsData.dreams[0].timestamp)}` : 'No dreams recorded',
      action: () => onTabChange('dreams'),
    },
  ];

  const recentRepos = repos.slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="glass rounded-2xl p-6 sm:p-8 border border-slate-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, <span className="text-gradient-cyan">{githubProfile?.login || 'Developer'}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl">
              Your unified command center for sovereign systems, AI game engines, and developer intelligence.
              System status: <span className="text-emerald-400 font-mono">{systemStatus?.status || 'unknown'}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onTabChange('github')}
              className="btn-primary"
            >
              <Code2 className="w-4 h-4" />
              Explore Repositories
            </button>
            <button
              onClick={() => onTabChange('engine')}
              className="btn-secondary"
            >
              <Zap className="w-4 h-4" />
              BlackSpace Engine
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <button
            key={stat.label}
            onClick={stat.action}
            className={`stat-card group flex items-start gap-4 ${stat.color === 'cyan' ? 'glow-cyan' : stat.color === 'purple' ? 'glow-purple' : stat.color === 'emerald' ? 'glow-emerald' : ''}`}
          >
            <div className={`p-3 rounded-xl bg-${stat.color}-950/50 border border-${stat.color}-800/60 group-hover:border-${stat.color}-500/60 transition-all`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1 truncate">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{stat.trend}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
          </button>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Repositories */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Recent Repositories</h3>
            </div>
            <button
              onClick={() => onTabChange('github')}
              className="btn-ghost text-xs"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {repos.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FolderGit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No repositories found. Search for a GitHub user to begin.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => onRepoSelect(repo)}
                  className="w-full group flex items-center gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800/60 flex items-center justify-center flex-shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language || '') }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">{repo.name}</p>
                    <p className="text-xs text-slate-400 truncate">{repo.description || 'No description'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" /> {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(repo.updated_at)}
                    </span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* System Quick Stats */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">System Overview</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-800/60">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">CPU Load</p>
                  <p className="font-mono text-white">{systemStatus?.cpu_load?.split(' ')[0] || 'N/A'}</p>
                </div>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-950/50 border border-purple-800/60">
                  <Database className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Memory</p>
                  <p className="font-mono text-white text-xs">{systemStatus?.memory_used?.split(' / ')[0] || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/60">
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Gateway</p>
                  <p className="font-mono text-white text-xs">{systemStatus?.gateway_version || 'N/A'}</p>
                </div>
              </div>
              <span className={`w-2 h-2 rounded-full ${systemStatus?.vms_available ? 'bg-emerald-500' : 'bg-slate-500'}`} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-950/50 border border-amber-800/60">
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">BlackSpace Engine</p>
                  <p className="font-mono text-white text-xs capitalize">{engineStatus?.status || 'idle'}</p>
                </div>
              </div>
              {engineStatus?.status === 'building' && (
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-300" 
                    style={{ width: `${engineStatus.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onTabChange('gateway')}
          className="card p-5 text-left group"
        >
          <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800/60 group-hover:border-purple-500/60 mb-4">
            <Server className="w-6 h-6 text-purple-400" />
          </div>
          <h4 className="font-bold text-white mb-1">Lilith Gateway</h4>
          <p className="text-sm text-slate-400 mb-4">Apps, VMs, LLM proxy & system control</p>
          <span className="text-xs text-cyan-400 flex items-center gap-1">
            Open Gateway <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
        
        <button
          onClick={() => onTabChange('engine')}
          className="card p-5 text-left group"
        >
          <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/60 group-hover:border-amber-500/60 mb-4">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <h4 className="font-bold text-white mb-1">BlackSpace Engine</h4>
          <p className="text-sm text-slate-400 mb-4">Zelda OOT engine build & test pipeline</p>
          <span className="text-xs text-cyan-400 flex items-center gap-1">
            View Engine <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
        
        <button
          onClick={() => onTabChange('cyberpunk')}
          className="card p-5 text-left group"
        >
          <div className="p-3 rounded-xl bg-pink-950/50 border border-pink-800/60 group-hover:border-pink-500/60 mb-4">
            <Sparkles className="w-6 h-6 text-pink-400" />
          </div>
          <h4 className="font-bold text-white mb-1">MSN Cyberpunk Mod</h4>
          <p className="text-sm text-slate-400 mb-4">Grand Theft Cyberpunk deployment status</p>
          <span className="text-xs text-cyan-400 flex items-center gap-1">
            Check Status <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
        
        <button
          onClick={() => onTabChange('dreams')}
          className="card p-5 text-left group"
        >
          <div className="p-3 rounded-xl bg-pink-950/50 border border-pink-800/60 group-hover:border-pink-500/60 mb-4">
            <Brain className="w-6 h-6 text-pink-400" />
          </div>
          <h4 className="font-bold text-white mb-1">Kairos Dream</h4>
          <p className="text-sm text-slate-400 mb-4">Idle-time synthesis & memory crystallization</p>
          <span className="text-xs text-cyan-400 flex items-center gap-1">
            View Dreams <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>
    </div>
  );
}