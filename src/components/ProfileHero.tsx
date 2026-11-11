import React from 'react';
import { GitHubUser, AiProfileAnalysis } from '../types';
import { 
  Code2, 
  Sparkles, 
  Brain, 
  Zap, 
  Users, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Link2, 
  Twitter, 
  Github,
  Building2,
  RefreshCw
} from 'lucide-react';

interface ProfileHeroProps {
  user: GitHubUser | null;
  aiAnalysis: AiProfileAnalysis | null;
  onGenerateAiBriefing: () => void;
  isAnalyzing: boolean;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  aiAnalysis,
  onGenerateAiBriefing,
  isAnalyzing,
}) => {
  if (!user) {
    return (
      <div className="glass rounded-2xl p-6 sm:p-8 border border-slate-800/60 animate-slide-up">
        <div className="text-center py-12">
          <Code2 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h3 className="text-xl font-bold text-white mb-2">Search for a GitHub user to begin</h3>
          <p className="text-slate-400">Enter a username in the search bar above to load their profile and repositories.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 border border-slate-800/60 animate-slide-up">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-slate-800 shadow-xl"
            />
            {user.site_admin && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-purple-600 text-[10px] font-bold rounded-full">
                STAFF
              </span>
            )}
          </div>
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {user.name || user.login}
                <span className="text-slate-400 font-normal text-lg sm:text-xl ml-2">@{user.login}</span>
              </h2>
              {user.company && (
                <p className="text-slate-300 flex items-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" /> {user.company}
                </p>
              )}
            </div>
            
            {aiAnalysis && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-950/50 border border-purple-800/60 rounded-xl">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-300 font-medium">AI Analyzed</span>
              </div>
            )}
          </div>

          {user.bio && (
            <p className="text-slate-300 mb-4 max-w-2xl leading-relaxed">{user.bio}</p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <p className="text-2xl font-bold text-white">{formatNumber(user.public_repos)}</p>
              <p className="text-xs text-slate-400">Repositories</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <p className="text-2xl font-bold text-white">{formatNumber(user.followers)}</p>
              <p className="text-xs text-slate-400">Followers</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <p className="text-2xl font-bold text-white">{formatNumber(user.following)}</p>
              <p className="text-xs text-slate-400">Following</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <p className="text-2xl font-bold text-white">{formatNumber(user.public_gists)}</p>
              <p className="text-xs text-slate-400">Gists</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {formatDate(user.created_at)}
            </span>
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {user.location}
              </span>
            )}
            {user.blog && (
              <a href={user.blog} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                <Link2 className="w-3.5 h-3.5" />
                {user.blog.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            )}
            {user.twitter_username && (
              <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                <Twitter className="w-3.5 h-3.5" />
                @{user.twitter_username}
              </a>
            )}
            <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
              <Github className="w-3.5 h-3.5" />
              GitHub Profile
            </a>
          </div>
        </div>

        {/* AI Analysis Summary */}
        {aiAnalysis && (
          <div className="w-full sm:w-80 flex-shrink-0">
            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-950/30 to-cyan-950/30 border border-purple-800/60">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">AI Intelligence Briefing</h3>
              </div>
              <p className="text-xs text-slate-300 mb-3">{aiAnalysis.archetype}</p>
              <p className="text-sm text-slate-400 mb-4">{aiAnalysis.summary}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {aiAnalysis.primaryDomains.slice(0, 3).map((domain, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-950/50 text-purple-300 text-[10px] font-medium rounded border border-purple-800/60">
                    {domain}
                  </span>
                ))}
              </div>
              <button
                onClick={onGenerateAiBriefing}
                disabled={isAnalyzing}
                className="w-full btn-primary justify-center text-xs py-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-cyan-300 border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Regenerate Briefing
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};