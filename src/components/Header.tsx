import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  Menu,
  X,
  Sparkles,
  Server,
  Zap,
  Brain,
  FolderGit2,
  LayoutDashboard,
  Settings,
  HelpCircle,
  ChevronDown,
  Github,
  ExternalLink,
  Moon,
  Sun,
  Monitor,
  GitBranch,
  Cpu,
  Activity
} from 'lucide-react';
import { SystemStatus, TabId } from '../types';

interface HeaderProps {
  currentUsername: string;
  onSearchUsername: (username: string) => void;
  onRefreshAll: () => void;
  onToggleAiChat: () => void;
  isAiChatOpen: boolean;
  isLoading: boolean;
  systemStatus: SystemStatus | null;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUsername,
  onSearchUsername,
  onRefreshAll,
  onToggleAiChat,
  isAiChatOpen,
  isLoading,
  systemStatus,
  activeTab,
  onTabChange,
}) => {
  const [searchQuery, setSearchQuery] = useState(currentUsername);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'council', label: '9 Nodes (LilithOS)', icon: Activity },
    { id: 'github', label: 'GitHub', icon: FolderGit2 },
    { id: 'gateway', label: 'Gateway', icon: Server },
    { id: 'engine', label: 'Engine', icon: Zap },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: Sparkles },
    { id: 'dreams', label: 'Dreams', icon: Brain },
    { id: 'knowledge', label: 'Graph', icon: GitBranch },
    { id: 'telemetry', label: 'Telemetry', icon: Cpu },
    { id: 'all-repos', label: 'All Repos', icon: FolderGit2 },
  ];

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchUsername(searchQuery.trim());
      setShowSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('overview')}
              className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 hover:border-cyan-500/60 transition-colors"
              aria-label="Lilith Dashboard Home"
            >
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
            </button>
            <span className="hidden sm:block font-bold text-xl text-white bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Lilith Unified
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search GitHub user or org (Baal-TehDriverman, Lilith-Systems, The-Driver-Man)..."
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-lg pl-10 pr-10 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            aria-label={showSearch ? 'Close search' : 'Open search'}
          >
            {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Mobile Search Overlay */}
          {showSearch && (
            <div className="fixed inset-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search GitHub user or org..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg pl-12 pr-12 py-3 text-base text-white placeholder-slate-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-center text-sm text-slate-500 mt-4">Press Enter to search, Escape to cancel</p>
              </form>
            </div>
          )}

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/50 rounded-xl p-1 border border-slate-800/60" role="tablist">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* System Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <span className={`w-2 h-2 rounded-full ${systemStatus?.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="text-xs font-mono text-slate-300">
                {systemStatus?.cpu_load?.split(' ')[0] || '--'}
              </span>
            </div>

            {/* AI Chat Toggle */}
            <button
              onClick={onToggleAiChat}
              className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${
                isAiChatOpen
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                  : 'bg-slate-900/50 text-slate-300 hover:bg-slate-800/50 border border-slate-800/60'
              }`}
              aria-label="Toggle AI Assistant"
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden sm:inline font-medium text-sm">AI</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={onRefreshAll}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-900/50 text-slate-300 hover:bg-slate-800/50 border border-slate-800/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Refresh all data"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* GitHub Link */}
            <a
              href={`https://github.com/${currentUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-900/50 text-slate-300 hover:bg-slate-800/50 border border-slate-800/60 transition-all"
              aria-label={`View ${currentUsername} on GitHub`}
            >
              <Github className="w-5 h-5" />
            </a>

            {/* Theme Toggle */}
            <button
              className="p-2.5 rounded-xl bg-slate-900/50 text-slate-300 hover:bg-slate-800/50 border border-slate-800/60 transition-all"
              aria-label="Toggle theme"
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/60 transition-all"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-950">
                    {currentUsername.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">
                  {currentUsername}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)} 
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 mt-2 w-56 glass rounded-xl border border-slate-800 shadow-2xl py-2 z-50 animate-slide-in-right">
                    <div className="px-4 py-3 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white">{currentUsername}</p>
                      <p className="text-xs text-slate-400 truncate">@Baal-TehDriverman</p>
                    </div>
                    <a
                      href={`https://github.com/${currentUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      View GitHub Profile
                    </a>
                    <button
                      onClick={() => onTabChange('overview')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors text-left"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard Overview
                    </button>
                    <button
                      onClick={() => onTabChange('gateway')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors text-left"
                    >
                      <Server className="w-4 h-4" />
                      Lilith Gateway
                    </button>
                    <button
                      onClick={() => onTabChange('engine')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors text-left"
                    >
                      <Zap className="w-4 h-4" />
                      BlackSpace Engine
                    </button>
                    <button
                      onClick={() => onTabChange('dreams')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors text-left"
                    >
                      <Brain className="w-4 h-4" />
                      Kairos Dreams
                    </button>
                    <div className="border-t border-slate-800 my-2" />
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors text-left"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors text-left"
                    >
                      <HelpCircle className="w-4 h-4" />
                      Help & Docs
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Bottom Sheet Style */}
        {showUserMenu && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-slate-800 rounded-t-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Menu</h3>
              <button
                onClick={() => setShowUserMenu(false)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { onTabChange(tab.id); setShowUserMenu(false); }}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <button
                onClick={() => { onToggleAiChat(); setShowUserMenu(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                <Sparkles className="w-4 h-4" />
                AI Assistant
              </button>
              <button
                onClick={onRefreshAll}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh All
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}