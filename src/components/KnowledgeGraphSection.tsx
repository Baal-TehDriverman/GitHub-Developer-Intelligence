import React, { useState, useEffect } from 'react';
import { Network, GitBranch, Loader2, AlertTriangle } from 'lucide-react';

interface GraphNode {
  id: string;
  role: string;
  links: string[];
}

interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

interface KnowledgeGraph {
  title: string;
  generated: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const KnowledgeGraphSection: React.FC = () => {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    loadKnowledgeGraph();
  }, []);

  const loadKnowledgeGraph = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/knowledge-graph/msn');
      if (res.ok) {
        const data = await res.json();
        setGraph(data);
      } else {
        setError('Failed to load knowledge graph');
      }
    } catch (e) {
      setError('Error loading knowledge graph');
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeColor = (role: string): string => {
    switch (role) {
      case 'entrypoint': return 'text-emerald-400 border-emerald-800/60 bg-emerald-950/50';
      case 'runtime': return 'text-cyan-400 border-cyan-800/60 bg-cyan-950/50';
      case 'bridge': return 'text-purple-400 border-purple-800/60 bg-purple-950/50';
      case 'ai': return 'text-pink-400 border-pink-800/60 bg-pink-950/50';
      default: return 'text-slate-400 border-slate-800/60 bg-slate-950/50';
    }
  };

  const getRoleBadge = (role: string): string => {
    switch (role) {
      case 'entrypoint': return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
      case 'runtime': return 'bg-cyan-950 text-cyan-400 border border-cyan-800';
      case 'bridge': return 'bg-purple-950 text-purple-400 border border-purple-800';
      case 'ai': return 'bg-pink-950 text-pink-400 border border-pink-800';
      default: return 'bg-slate-950 text-slate-400 border border-slate-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <span className="ml-3 text-slate-400">Loading knowledge graph...</span>
      </div>
    );
  }

  if (error || !graph || graph.nodes.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 border border-slate-800/60 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <p className="text-slate-300 font-medium mb-2">No Knowledge Graph Available</p>
        <p className="text-sm text-slate-500">Run the understand-anything pipeline on a repository to generate a graph.</p>
        <p className="text-xs text-slate-600 mt-2">
          <code className="px-2 py-0.5 bg-slate-800 rounded">cd ~/.understand-anything/repo && pnpm --filter @understand-anything/skill build</code>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass rounded-2xl p-6 border border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60">
            <Network className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{graph.title}</h2>
            <p className="text-slate-400 text-sm">
              Generated: {new Date(graph.generated).toLocaleString()} &middot;
              {graph.nodes.length} nodes, {graph.edges.length} edges
            </p>
          </div>
          <button onClick={loadKnowledgeGraph} className="btn-secondary">
            <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Node List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {graph.nodes.map(node => (
          <button
            key={node.id}
            onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
            className={`glass rounded-xl p-4 border transition-all text-left ${
              selectedNode === node.id
                ? 'border-emerald-500/60 bg-slate-900/80'
                : 'border-slate-800/60 hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg border ${getNodeColor(node.role)} flex-shrink-0`}>
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                  {node.id}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getRoleBadge(node.role)}`}>
                    {node.role}
                  </span>
                </div>
                {selectedNode === node.id && node.links.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60">
                    <p className="text-xs text-slate-400 mb-2">Connected to:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {node.links.map(link => (
                        <span key={link} className="px-2 py-0.5 bg-slate-800 text-[10px] text-cyan-300 rounded border border-slate-700">
                          {link}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Edges List */}
      {graph.edges.length > 0 && (
        <div className="glass rounded-2xl p-6 border border-slate-800/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-800/60">
              <GitBranch className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-bold text-lg text-white">Relationships ({graph.edges.length})</h3>
          </div>
          <div className="space-y-2">
            {graph.edges.map((edge, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <span className="px-2 py-0.5 bg-purple-950 text-purple-400 text-[10px] font-medium rounded border border-purple-800">
                  {edge.type}
                </span>
                <code className="text-sm text-cyan-300">{edge.from}</code>
                <span className="text-slate-500">→</span>
                <code className="text-sm text-emerald-300">{edge.to}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};