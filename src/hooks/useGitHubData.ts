import { useState, useEffect, useCallback } from 'react';
import { GitHubUser, GitHubRepo } from '../types';
import { fetchGitHubUser, fetchGitHubRepos } from '../api';

export function useGitHubData(username: string) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!username) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [userData, reposData] = await Promise.all([
        fetchGitHubUser(username),
        fetchGitHubRepos(username),
      ]);
      
      setUser(userData);
      setRepos(reposData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { user, repos, isLoading, error, refresh: fetchData };
}