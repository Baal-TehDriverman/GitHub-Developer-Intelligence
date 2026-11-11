import { useState, useEffect, useCallback } from 'react';
import { DreamEntry } from '../types';

interface DreamData {
  dreams: DreamEntry[];
  count: number;
}

export function useDreams() {
  const [data, setData] = useState<DreamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use the API endpoint from our server
      const response = await fetch('/api/dreams?limit=50');
      if (!response.ok) throw new Error('Failed to fetch dreams');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dreams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}