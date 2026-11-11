import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { GitHubProfileSection } from './components/GitHubProfileSection';
import { LilithGatewaySection } from './components/LilithGatewaySection';
import { BlackSpaceEngineSection } from './components/BlackSpaceEngineSection';
import { CyberpunkModSection } from './components/CyberpunkModSection';
import { KairosDreamSection } from './components/KairosDreamSection';
import { KnowledgeGraphSection } from './components/KnowledgeGraphSection';
import { NvidiaTelemetrySection } from './components/NvidiaTelemetrySection';
import SephiroticCouncilSection from './components/SephiroticCouncilSection';
import { AllReposManager } from './components/AllReposManager';
import { AiChatAssistant } from './components/AiChatAssistant';
import { SystemStatusBar } from './components/SystemStatusBar';
import { useSystemStatus } from './hooks/useSystemStatus';
import { useGitHubProfile } from './hooks/useGitHubProfile';
import { useEngineStatus } from './hooks/useEngineStatus';
import { useDreams } from './hooks/useDreams';
import { GitHubUser, GitHubRepo, SystemStatus, EngineStatus, DreamEntry, TabId } from './types';

export default function App() {
  const [username, setUsername] = useState<string>('Baal-TehDriverman');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  const { data: systemStatus, refresh: refreshSystem } = useSystemStatus();
  const { user: githubProfile, repos, isLoading: githubLoading, error: githubError, refresh: refreshGithub } = useGitHubProfile(username);
  const { data: engineStatus, refresh: refreshEngine } = useEngineStatus();
  const { data: dreamsData, refresh: refreshDreams } = useDreams();

  // Auto-refresh system status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSystem();
      refreshEngine();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshSystem, refreshEngine]);

  // Load dreams on mount
  useEffect(() => {
    refreshDreams();
  }, [refreshDreams]);

  const handleSearchUser = useCallback((newUsername: string) => {
    setUsername(newUsername);
    setActiveTab('github');
  }, []);

  const handleRefreshAll = useCallback(() => {
    refreshSystem();
    refreshGithub();
    refreshEngine();
    refreshDreams();
  }, [refreshSystem, refreshGithub, refreshEngine, refreshDreams]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Header
        currentUsername={username}
        onSearchUsername={handleSearchUser}
        onRefreshAll={handleRefreshAll}
        onToggleAiChat={() => setIsAiChatOpen(!isAiChatOpen)}
        isAiChatOpen={isAiChatOpen}
        isLoading={githubLoading}
        systemStatus={systemStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* System Status Bar */}
        <SystemStatusBar 
          systemStatus={systemStatus} 
          engineStatus={engineStatus}
          onRefresh={handleRefreshAll}
        />

        {/* Error Banner */}
        {githubError && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm">{githubError}</p>
            </div>
            <button
              onClick={refreshGithub}
              className="px-3 py-1 bg-red-900 hover:bg-red-800 text-xs font-semibold rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <DashboardOverview
              systemStatus={systemStatus}
              githubProfile={githubProfile}
              repos={repos}
              engineStatus={engineStatus}
              dreamsData={dreamsData}
              onRepoSelect={setSelectedRepo}
              onTabChange={setActiveTab}
            />
          )}

          {activeTab === 'github' && (
            <GitHubProfileSection
              username={username}
              user={githubProfile}
              repos={repos}
              isLoading={githubLoading}
              onSelectRepo={setSelectedRepo}
              onRunAnalysis={() => {}}
            />
          )}

          {activeTab === 'gateway' && (
            <LilithGatewaySection
              systemStatus={systemStatus}
              onLaunchApp={async () => { /* handled by component */ }}
              onVmAction={async () => { /* handled by component */ }}
            />
          )}

          {activeTab === 'engine' && (
            <BlackSpaceEngineSection
              engineStatus={engineStatus}
              onBuild={async () => { /* handled by component */ }}
              onTest={async () => { /* handled by component */ }}
              onRefresh={refreshEngine}
            />
          )}

          {activeTab === 'cyberpunk' && (
            <CyberpunkModSection
              onRefresh={async () => { /* handled by component */ }}
              onVerify={async () => { /* handled by component */ }}
            />
          )}

          {activeTab === 'dreams' && (
            <KairosDreamSection
              dreamsData={dreamsData}
              onRefresh={refreshDreams}
              onTriggerDream={async () => { /* handled by component */ }}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeGraphSection />
          )}

          {activeTab === 'telemetry' && (
            <NvidiaTelemetrySection />
          )}

          {activeTab === 'council' && (
            <SephiroticCouncilSection />
          )}

          {activeTab === 'all-repos' && (
            <AllReposManager />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>Unified Developer Dashboard — Lilith Systems R&D</span>
          </div>
          <span>Built for @{username} • Powered by GitHub API, Lilith Gateway, BlackSpace Engine & Kairos Dream</span>
        </div>
      </footer>

      {/* AI Chat Drawer */}
      <AiChatAssistant
        username={username}
        selectedRepo={selectedRepo}
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
      />

      {/* Repo Detail Modal */}
      {selectedRepo && (
        <RepoDetailModal
          repo={selectedRepo}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  );
}

// Import the modal component
import { RepoDetailModal } from './components/RepoDetailModal';