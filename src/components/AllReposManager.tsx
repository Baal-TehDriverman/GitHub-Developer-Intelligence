import React, { useState, useEffect } from 'react';
import {
  RefreshCw, ExternalLink, ChevronDown, ChevronRight, CheckCircle, AlertCircle,
  FolderGit2, Brain, Code2, Zap, Shield, BookOpen, Truck, Cpu, Database, Key,
  Wrench, FileText, Server, Smartphone, Bot, Recycle, BarChart, LayoutDashboard,
  UserCheck, UserPlus, Scale, Utensils, Users, Sparkles,
} from 'lucide-react';

// The repository register is loaded at runtime from /repo-register.json so that
// a deployment can curate its own list without committing it to source control.
// Copy public/repo-register.example.json to public/repo-register.json to start.
interface RepoInfo {
  name: string;
  org: string;
  classification: string;
  icon: string;
  desc: string;
}

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Brain, Code2, Zap, Shield, BookOpen, Truck, Cpu, Database, Key, Wrench, FileText,
  Server, Smartphone, Bot, Recycle, BarChart, LayoutDashboard, UserCheck, UserPlus,
  Scale, Utensils, Users, Sparkles, FolderGit2,
};

const ORG_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; text: string }> = {
  'Lilith-Systems': { label: 'Lilith-Systems', color: 'purple', bg: 'bg-purple-950/30', border: 'border-purple-800/60', text: 'text-purple-400' },
  'The-Driver-Man': { label: 'The-Driver-Man', color: 'emerald', bg: 'bg-emerald-950/30', border: 'border-emerald-800/60', text: 'text-emerald-400' },
  'Baal-TehDriverman': { label: 'Baal-TehDriverman', color: 'cyan', bg: 'bg-cyan-950/30', border: 'border-cyan-800/60', text: 'text-cyan-400' },
  'other': { label: 'Other', color: 'slate', bg: 'bg-slate-950/30', border: 'border-slate-800/60', text: 'text-slate-400' },
};

export const AllReposManager: React.FC = () => {
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'scaffold' | 'generated'>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/repo-register.json');
        const contentType = response.headers.get('content-type') || '';
        if (!response.ok || !contentType.includes('application/json')) {
          throw new Error('register not available');
        }
        const data = await response.json();
        if (!cancelled) setRepos(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setRepos([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const getApplicableOrgs = (): string[] => {
    const filtered = repos.filter(r => {
      if (filter === 'all') return true;
      if (filter === 'active') return r.classification === 'ACTIVE';
      if (filter === 'scaffold') return r.classification === 'SCAFFOLD';
      if (filter === 'generated') return r.classification === 'GENERATED';
      return true;
    });
    const orgs = new Set(filtered.map(r => r.org));
    return Object.keys(ORG_CONFIG).filter(o => orgs.has(o));
  };

  const orgRepos = (orgId: string) => repos.filter(r => r.org === orgId);
  const filteredRepos = (orgId: string) => {
    const list = orgRepos(orgId);
    if (filter === 'all') return list;
    return list.filter(r => r.classification.toLowerCase().includes(filter.toLowerCase()));
  };

  const getOrgConfig = (orgId: string) => ORG_CONFIG[orgId] || ORG_CONFIG.other;

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 border border-slate-800/60 text-slate-400">
        Loading repository register…
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="glass rounded-2xl p-6 border border-slate-800/60">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60">
              <FolderGit2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">All Repositories Manager</h2>
              <p className="text-slate-400">No repository register configured</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-slate-800/60">
          <h3 className="font-bold text-white mb-2">Add a register</h3>
          <p className="text-sm text-slate-400">
            Copy <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">public/repo-register.example.json</code> to{' '}
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-cyan-300">public/repo-register.json</code> and list the
            repositories you want to display. That file is gitignored, so a deployment can curate its own list
            without publishing it to source control.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60">
            <FolderGit2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">All Repositories Manager</h2>
            <p className="text-slate-400">
              {repos.length} repositories across {getApplicableOrgs().length} organizations
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none"
            >
              <option value="all">All ({repos.length})</option>
              <option value="active">Active Only</option>
              <option value="scaffold">Scaffolds Only</option>
              <option value="generated">Generated Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organization Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Object.entries(ORG_CONFIG).map(([orgId, orgConfig]) => {
          const list = orgRepos(orgId);
          if (list.length === 0) return null;

          const filtered = filteredRepos(orgId);
          const cleanCount = filtered.filter(r => r.classification === 'ACTIVE').length;
          const dirtyCount = filtered.filter(r => r.classification !== 'ACTIVE').length;

          return (
            <button
              key={orgId}
              onClick={() => setExpandedOrg(expandedOrg === orgId ? null : orgId)}
              className={`glass rounded-xl p-5 border transition-all text-left ${
                expandedOrg === orgId
                  ? `${orgConfig.border} ${orgConfig.bg}`
                  : 'border-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${orgConfig.bg} ${orgConfig.border} ${orgConfig.text}`}>
                  {orgConfig.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">{filtered.length} repos</span>
                  {expandedOrg === orgId ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {cleanCount} active
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {dirtyCount} other
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Org Repos */}
      {expandedOrg && (
        <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden">
          <div className="p-4 border-b border-slate-800/60 bg-slate-900/50">
            <h3 className="font-bold text-white text-lg">{expandedOrg} — {filteredRepos(expandedOrg).length} Repositories</h3>
          </div>
          <div className="divide-y divide-slate-800/60">
            {filteredRepos(expandedOrg).map(repo => {
              const Icon = ICONS[repo.icon] || FolderGit2;
              const orgConfig = getOrgConfig(repo.org);
              return (
                <div key={`${repo.org}/${repo.name}`} className="flex items-center justify-between p-4 hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${orgConfig.bg} ${orgConfig.border}`}>
                      <Icon className={`w-4 h-4 ${orgConfig.text}`} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{repo.name}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[300px]">{repo.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      repo.classification === 'ACTIVE'
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/60'
                        : repo.classification === 'SCAFFOLD'
                        ? 'bg-blue-950/50 text-blue-400 border border-blue-800/60'
                        : repo.classification === 'GENERATED'
                        ? 'bg-violet-950/50 text-violet-400 border border-violet-800/60'
                        : 'bg-amber-950/50 text-amber-400 border border-amber-800/60'
                    }`}>
                      {repo.classification}
                    </span>
                    <a href={`https://github.com/${repo.org}/${repo.name}`} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
