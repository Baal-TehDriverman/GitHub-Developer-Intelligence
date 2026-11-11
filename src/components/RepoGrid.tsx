import React, { useState, useMemo } from 'react';
import { GitHubRepo } from '../types';
import {
  FolderGit2,
  Star,
  GitFork,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Code2,
  Calendar,
  HardDrive,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';

interface RepoGridProps {
  repos: GitHubRepo[];
  onSelectRepo: (repo: GitHubRepo) => void;
  isLoading: boolean;
}

const LANGUAGE_DOT_COLORS: Record<string, string> = {
  Python: 'bg-blue-500',
  'C++': 'bg-pink-500',
  TypeScript: 'bg-cyan-500',
  JavaScript: 'bg-yellow-400',
  Redscript: 'bg-red-500',
  Shell: 'bg-emerald-400',
  HTML: 'bg-orange-500',
  CSS: 'bg-purple-500',
  Other: 'bg-slate-400',
};

export const RepoGrid: React.FC<RepoGridProps> = ({
  repos,
  onSelectRepo,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'updated' | 'size' | 'stars' | 'name'>('updated');

  // Extract unique languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    repos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return ['All', ...Array.from(langs)];
  }, [repos]);

  // Filter & Sort Repositories
  const filteredRepos = useMemo(() => {
    return repos
      .filter((repo) => {
        const matchesSearch =
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesLang = selectedLanguage === 'All' || repo.language === selectedLanguage;
        return matchesSearch && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === 'updated') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        if (sortBy === 'size') {
          return b.size - a.size;
        }
        if (sortBy === 'stars') {
          return b.stargazers_count - a.stargazers_count;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [repos, searchQuery, selectedLanguage, sortBy]);

  const formatSize = (sizeKb: number) => {
    if (sizeKb >= 1024) {
      return `${(sizeKb / 1024).toFixed(1)} MB`;
    }
    return `${sizeKb} KB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div id="repositories-section" className="space-y-6 animate-slide-up">
      {/* Section Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass rounded-2xl p-5 border border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Public Repositories</h3>
            <p className="text-xs text-slate-400">
              Showing {filteredRepos.length} of {repos.length} repositories
            </p>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Repo Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              id="filter-repos-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name or desc..."
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5 border border-slate-800/60">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-repos-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer select-none"
            >
              <option value="updated" className="bg-slate-900">Recently Updated</option>
              <option value="size" className="bg-slate-900">Project Size</option>
              <option value="stars" className="bg-slate-900">Star Count</option>
              <option value="name" className="bg-slate-900">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Language Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3" /> Language:
        </span>
        {availableLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            id={`filter-lang-${lang.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedLanguage === lang
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'glass hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Repositories Grid */}
      {isLoading ? (
        <div id="repos-loading-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl glass border border-slate-800/60 p-5 animate-pulse space-y-3"
            >
              <div className="h-5 bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-800/60 rounded w-full" />
              <div className="h-4 bg-slate-800/60 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredRepos.length === 0 ? (
        <div id="no-repos-found" className="glass rounded-2xl border border-slate-800 p-8 text-center text-slate-400">
          <FolderGit2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium">No repositories match your current filter criteria.</p>
        </div>
      ) : (
        <div id="repo-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRepos.map((repo) => {
            const dotColor = repo.language ? LANGUAGE_DOT_COLORS[repo.language] || 'bg-cyan-400' : 'bg-slate-500';

            return (
              <div
                key={repo.id}
                id={`repo-card-${repo.name}`}
                className="group relative flex flex-col justify-between rounded-2xl glass hover:bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/50 p-5 shadow-lg hover:shadow-cyan-500/10 transition-all duration-200"
              >
                <div className="space-y-3">
                  {/* Title & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      onClick={() => onSelectRepo(repo)}
                      className="font-bold text-base text-white group-hover:text-cyan-400 cursor-pointer transition-colors line-clamp-1"
                    >
                      {repo.name}
                    </h4>
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full glass text-slate-400 border border-slate-700/60">
                      {repo.visibility || 'public'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed min-h-[3.25rem]">
                    {repo.description || 'No description provided for this repository.'}
                  </p>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                      <span className="text-slate-200 font-medium">{repo.language || 'Plain Text'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-slate-500" />
                        {formatSize(repo.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(repo.updated_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => onSelectRepo(repo)}
                      id={`inspect-repo-btn-${repo.name}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect & AI Deep-Dive</span>
                    </button>

                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on GitHub"
                      className="p-1.5 rounded-xl glass hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};