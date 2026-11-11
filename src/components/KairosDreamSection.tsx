import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Loader2,
  RefreshCw,
  Clock,
  Trash2,
  Download,
  Eye,
  Zap,
  Target,
  Lightbulb,
  Award,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { DreamEntry, DreamData } from '../types';

interface KairosDreamSectionProps {
  dreamsData: DreamData | null;
  onRefresh: () => void;
  onTriggerDream: () => void;
}

export const KairosDreamSection: React.FC<KairosDreamSectionProps> = ({
  dreamsData,
  onRefresh,
  onTriggerDream,
}) => {
  const [triggering, setTriggering] = useState(false);
  const [filterSession, setFilterSession] = useState<string>('all');
  const [expandedDream, setExpandedDream] = useState<number | null>(null);
  const [dreams, setDreams] = useState<DreamEntry[]>([]);

  // Sessions are derived from the data so no deployment-specific names are baked in.
  const sessions = Array.from(new Set((dreamsData?.dreams || []).map(d => d.session))).sort();

  useEffect(() => {
    if (dreamsData) {
      let filtered = dreamsData.dreams;
      if (filterSession !== 'all') {
        filtered = filtered.filter(d => d.session === filterSession);
      }
      setDreams(filtered);
    }
  }, [dreamsData, filterSession]);

  const handleTriggerDream = async () => {
    setTriggering(true);
    try {
      await onTriggerDream();
      await new Promise(r => setTimeout(r, 2000)); // Wait for dream to complete
      onRefresh();
    } catch (e) {
      console.error('Failed to trigger dream:', e);
    } finally {
      setTriggering(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSessionColor = (session: string) => {
    return session === 'zelda-engine' ? 'text-amber-400 bg-amber-950/50 border-amber-800/60' : 'text-purple-400 bg-purple-950/50 border-purple-800/60';
  };

  const getSessionIcon = (session: string) => {
    return session === 'zelda-engine' ? <Zap className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-pink-950/50 border border-pink-800/60">
              <Brain className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Kairos Dream Scheduler</h2>
              <p className="text-slate-400">Idle-time synthesis • Memory crystallization • Bidirectional learning</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={onRefresh} className="btn-secondary">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button onClick={handleTriggerDream} disabled={triggering} className="btn-primary">
              {triggering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dreaming...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Trigger Dream Cycle
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Brain className="w-5 h-5" />}
          iconBg="bg-pink-950/50 border-pink-800/60"
          iconColor="text-pink-400"
          label="Total Dreams"
          value={dreamsData?.count || 0}
          trend="stable"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          iconBg="bg-amber-950/50 border-amber-800/60"
          iconColor="text-amber-400"
          label="Zelda Engine"
          value={dreamsData?.dreams.filter(d => d.session === 'zelda-engine').length || 0}
          trend="stable"
        />
        <StatCard
          icon={<Sparkles className="w-5 h-5" />}
          iconBg="bg-purple-950/50 border-purple-800/60"
          iconColor="text-purple-400"
          label="Sessions"
          value={sessions.length}
          trend="stable"
        />
        <StatCard
          icon={<Lightbulb className="w-5 h-5" />}
          iconBg="bg-emerald-950/50 border-emerald-800/60"
          iconColor="text-emerald-400"
          label="Total Insights"
          value={dreamsData?.dreams.reduce((sum, d) => sum + d.insights.length, 0) || 0}
          trend="stable"
        />
      </div>

      {/* Filter Tabs */}
      <div className="glass rounded-xl p-2 border border-slate-800/60">
        <div className="flex gap-1" role="tablist">
          {['all', ...sessions].map(session => {
            const isActive = filterSession === session;
            return (
              <button
                key={session}
                onClick={() => setFilterSession(session)}
                role="tab"
                aria-selected={isActive}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {session === 'all' ? 'All Sessions' : session}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dreams List */}
      <div className="glass rounded-2xl border border-slate-800/60 overflow-hidden">
        {dreams.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-semibold text-white mb-2">No dreams recorded yet</h3>
            <p className="text-slate-400 mb-4">Dreams are generated during idle periods or manually triggered.</p>
            <button onClick={handleTriggerDream} className="btn-primary">
              <Sparkles className="w-4 h-4" />
              Trigger First Dream
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {dreams.map((dream, index) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                index={index}
                isExpanded={expandedDream === dream.id}
                onToggle={() => setExpandedDream(expandedDream === dream.id ? null : dream.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* How it Works */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          How Kairos Dream Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProcessStep
            number="1"
            title="dream()"
            desc="Scans development context for patterns: build frequency, artifact counts, commit activity, uncommitted changes."
            icon={<Zap className="w-5 h-5" />}
            color="text-amber-400"
          />
          <ProcessStep
            number="2"
            title="synthesis()"
            desc="Cross-references patterns to generate actionable insights: batching recommendations, commit reminders, trajectory analysis."
            icon={<Target className="w-5 h-5" />}
            color="text-purple-400"
          />
          <ProcessStep
            number="3"
            title="crystallize()"
            desc="Compresses insights into memory patterns, stores in dreams.sqlite, and feeds bidirectional memory backward pass (coherence=0.90)."
            icon={<Award className="w-5 h-5" />}
            color="text-emerald-400"
          />
        </div>
        
        <div className="mt-6 p-4 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Configuration
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-cyan-400 font-mono">300s</span>
              <span>Idle timeout before dream cycle</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-cyan-400 font-mono">600s</span>
              <span>Minimum interval between dreams</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-cyan-400 font-mono">0.90</span>
              <span>Bidirectional memory coherence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}> = ({ icon, iconBg, iconColor, label, value, trend }) => (
  <div className="glass rounded-xl p-4 border border-slate-800/60">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg border ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
    </div>
    <div className="text-2xl font-bold text-white font-mono">{value}</div>
    <p className="text-xs text-slate-400 mt-1">{label}</p>
  </div>
);

const DreamCard: React.FC<{
  dream: DreamEntry;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ dream, index, isExpanded, onToggle }) => (
  <div className="p-5 hover:bg-slate-900/50 transition-colors">
    <button
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-4 text-left"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-800/60 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-slate-400">{index + 1}</span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSessionColor(dream.session)}`}>
              {getSessionIcon(dream.session)}
              {dream.session}
            </span>
            <span className="text-xs text-slate-400 font-mono">{formatDate(dream.timestamp)}</span>
            {dream.context_snapshot.idle_time && (
              <span className="text-xs text-slate-500">Idle: {Math.round(dream.context_snapshot.idle_time / 60)}m</span>
            )}
          </div>
          <p className="text-sm text-slate-300 truncate">
            {dream.insights.length > 0 ? dream.insights[0] : 'No insights generated'}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> {dream.insights.length} insights
            </span>
            <span className="flex items-center gap-1">
              <Award className="w-3 h-3" /> {Object.keys(dream.patterns).length} patterns
            </span>
          </div>
        </div>
      </div>
      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
    </button>

    {isExpanded && (
      <div className="mt-4 pt-4 border-t border-slate-800/60 animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Insights */}
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center gap-1">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Insights
            </h4>
            <ul className="space-y-2">
              {dream.insights.map((insight, i) => (
                <li key={i} className="text-sm text-slate-300 p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                  {insight}
                </li>
              ))}
              {dream.insights.length === 0 && (
                <p className="text-slate-500 text-sm">No insights generated this cycle</p>
              )}
            </ul>
          </div>

          {/* Patterns */}
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center gap-1">
              <Target className="w-4 h-4 text-purple-400" /> Patterns Detected
            </h4>
            <div className="space-y-2">
              {Object.entries(dream.patterns).map(([key, value]) => (
                <div key={key} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{key.replace(/_/g, ' ')}</p>
                  <p className="text-lg font-mono text-white mt-1">{typeof value === 'object' ? JSON.stringify(value) : value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Context Snapshot */}
        {Object.keys(dream.context_snapshot).length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-white mb-2 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-cyan-400" /> Context Snapshot
            </h4>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 max-h-40 overflow-y-auto">
              <pre className="text-xs text-slate-300 font-mono">{JSON.stringify(dream.context_snapshot, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

const getSessionColor = (session: string) => {
  return session === 'zelda-engine' ? 'text-amber-400 bg-amber-950/50 border-amber-800/60' : 'text-purple-400 bg-purple-950/50 border-purple-800/60';
};

const getSessionIcon = (session: string) => {
  return session === 'zelda-engine' ? <Zap className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ProcessStep: React.FC<{
  number: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}> = ({ number, title, desc, icon, color }) => (
  <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/60 relative">
    <div className="absolute -top-3 left-3 w-8 h-8 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-sm">
      {number}
    </div>
    <div className="pt-6">
      <div className={`p-2 rounded-lg bg-slate-800/60 w-fit mb-3 ${color}`}>
        {icon}
      </div>
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  </div>
);