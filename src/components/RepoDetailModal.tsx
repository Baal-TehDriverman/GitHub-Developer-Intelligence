import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Star, GitFork, Code2, Calendar, HardDrive, Eye, Sparkles, Loader2, Copy, Check, Terminal, FileCode, Palette } from 'lucide-react';
import { GitHubRepo } from '../types';
import ReactMarkdown from 'react-markdown';

interface RepoDetailModalProps {
  repo: GitHubRepo;
  onClose: () => void;
}

export const RepoDetailModal: React.FC<RepoDetailModalProps> = ({ repo, onClose }) => {
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [commits, setCommits] = useState<any[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadRepoDetails();
  }, [repo.id]);

  const loadRepoDetails = async () => {
    setReadmeLoading(true);
    try {
      // Load README
      const readmeRes = await fetch(`/api/github/repo/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/readme`);
      if (readmeRes.ok) {
        const text = await readmeRes.text();
        setReadme(text);
      }
    } catch (e) {
      console.error('Failed to load README:', e);
    }

    try {
      // Load languages
      const langRes = await fetch(`/api/github/repo/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/languages`);
      if (langRes.ok) {
        setLanguages(await langRes.json());
      }
    } catch (e) {
      console.error('Failed to load languages:', e);
    }

    try {
      // Load commits
      const commitsRes = await fetch(`/api/github/repo/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/commits`);
      if (commitsRes.ok) {
        setCommits(await commitsRes.json());
      }
    } catch (e) {
      console.error('Failed to load commits:', e);
    }

    setReadmeLoading(false);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatSize = (sizeKb: number) => {
    if (sizeKb >= 1024 * 1024) return `${(sizeKb / (1024 * 1024)).toFixed(1)} GB`;
    if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
    return `${sizeKb} KB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      Python: '#3776AB', 'C++': '#f34b7d', TypeScript: '#3178c6', JavaScript: '#f1e05a',
      Redscript: '#ff2c4d', Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c',
      Rust: '#dea584', Go: '#00ADD8', Lua: '#000080', C: '#555555',
    };
    return colors[lang] || '#64748b';
  };

  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={(e) => e.stopPropagation()} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language || '') }} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xl text-white truncate">{repo.name}</h2>
              <p className="text-sm text-slate-400 truncate">{repo.full_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 glass hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 glass hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Description */}
          {repo.description && (
            <div className="glass rounded-xl p-5 border border-slate-800/60">
              <h3 className="font-semibold text-white mb-2">Description</h3>
              <p className="text-slate-300">{repo.description}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass rounded-xl p-4 border border-slate-800/60 text-center">
              <p className="text-2xl font-bold text-white">{repo.stargazers_count}</p>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Star className="w-3 h-3" /> Stars
              </p>
            </div>
            <div className="glass rounded-xl p-4 border border-slate-800/60 text-center">
              <p className="text-2xl font-bold text-white">{repo.forks_count}</p>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <GitFork className="w-3 h-3" /> Forks
              </p>
            </div>
            <div className="glass rounded-xl p-4 border border-slate-800/60 text-center">
              <p className="text-2xl font-bold text-white">{formatSize(repo.size)}</p>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <HardDrive className="w-3 h-3" /> Size
              </p>
            </div>
            <div className="glass rounded-xl p-4 border border-slate-800/60 text-center">
              <p className="text-2xl font-bold text-white">{repo.open_issues_count}</p>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" /> Issues
              </p>
            </div>
          </div>

          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="glass rounded-xl p-5 border border-slate-800/60">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" /> Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {repo.topics.map((topic) => (
                  <span key={topic} className="px-3 py-1 bg-slate-800 text-slate-200 text-xs rounded-lg border border-slate-700">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {Object.keys(languages).length > 0 && (
            <div className="glass rounded-xl p-5 border border-slate-800/60">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-cyan-400" /> Languages
              </h3>
              <div className="space-y-3">
                {Object.entries(languages)
                  .sort(([, a], [, b]) => b - a)
                  .map(([lang, bytes]) => {
                    const percentage = totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(1) : '0';
                    return (
                      <div key={lang} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getLanguageColor(lang) }} />
                        <span className="text-sm font-medium text-white min-w-[100px]">{lang}</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: getLanguageColor(lang) }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 font-mono w-16 text-right">{percentage}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Recent Commits */}
          {commits.length > 0 && (
            <div className="glass rounded-xl p-5 border border-slate-800/60">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" /> Recent Commits
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {commits.slice(0, 10).map((commit) => (
                  <div key={commit.sha} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 group">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                      {commit.author?.avatar_url ? (
                        <img src={commit.author.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <Code2 className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 line-clamp-2">{commit.commit.message.split('\n')[0]}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{commit.commit.author?.name || 'Unknown'}</span>
                        <span>{formatDate(commit.commit.author?.date || '')}</span>
                        <button
                          onClick={() => copyToClipboard(commit.sha.slice(0, 7), `commit-${commit.sha}`)}
                          className="text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedField === `commit-${commit.sha}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* README */}
          <div className="glass rounded-xl p-5 border border-slate-800/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" /> README
              </h3>
              {readmeLoading && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
            </div>
            {readme ? (
              <div className="prose prose-invert max-w-none text-sm">
                <ReactMarkdown>{readme}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No README found for this repository.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end gap-3">
          <button
            onClick={() => copyToClipboard(repo.html_url, 'url')}
            className="btn-secondary text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Copy URL</span>
            {copiedField === 'url' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => copyToClipboard(`git@github.com:${repo.full_name}.git`, 'git')}
            className="btn-secondary text-sm"
          >
            <Terminal className="w-4 h-4" />
            <span>Clone (SSH)</span>
            {copiedField === 'git' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};