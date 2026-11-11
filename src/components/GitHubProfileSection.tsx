import React, { useState, useMemo } from 'react';
import { GitHubUser, GitHubRepo, AiProfileAnalysis } from '../types';
import { Header } from './Header';
import { ProfileHero } from './ProfileHero';
import { AiProfileAnalysis as AiProfileAnalysisComponent } from './AiProfileAnalysis';
import { LanguageChart } from './LanguageChart';
import { RepoGrid } from './RepoGrid';
import { RepoDetailModal } from './RepoDetailModal';
import { AiChatAssistant } from './AiChatAssistant';
import { AlertCircle, Code2, Sparkles } from 'lucide-react';

interface GitHubProfileSectionProps {
  username: string;
  user: GitHubUser | null;
  repos: GitHubRepo[];
  isLoading: boolean;
  onSelectRepo: (repo: GitHubRepo) => void;
  onRunAnalysis: () => void;
}

export const GitHubProfileSection: React.FC<GitHubProfileSectionProps> = ({
  username,
  user,
  repos,
  isLoading,
  onSelectRepo,
  onRunAnalysis,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AiProfileAnalysis | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  const runAiProfileAnalysis = async () => {
    if (!user || repos.length === 0) return;
    
    setIsAiAnalyzing(true);
    try {
      const res = await fetch("/api/gemini/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          profile: user,
          repos: repos,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data);
      }
    } catch (e) {
      console.error("AI profile analysis error:", e);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Developer Profile Hero */}
      <ProfileHero
        user={user}
        aiAnalysis={aiAnalysis}
        onGenerateAiBriefing={runAiProfileAnalysis}
        isAnalyzing={isAiAnalyzing}
      />

      {/* AI Profile Intelligence Briefing */}
      <AiProfileAnalysisComponent
        analysis={aiAnalysis}
        isLoading={isAiAnalyzing}
        onGenerate={runAiProfileAnalysis}
      />

      {/* Language & Technology Distribution */}
      {repos.length > 0 && <LanguageChart repos={repos} />}

      {/* Repositories Grid & Inspection */}
      <RepoGrid
        repos={repos}
        onSelectRepo={onSelectRepo}
        isLoading={isLoading}
      />

      {/* Detailed Repo Modal */}
      {selectedRepo && (
        <RepoDetailModal
          repo={selectedRepo}
          onClose={() => setSelectedRepo(null)}
        />
      )}
    </div>
  );
}