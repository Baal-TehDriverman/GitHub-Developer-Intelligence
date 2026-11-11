import { useState, useEffect, useCallback } from 'react';
import { EngineStatus } from '../types';
import { fetchEngineStatus } from '../api';

export function useEngineStatus() {
  const [data, setData] = useState<EngineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchEngineStatus();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch engine status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}