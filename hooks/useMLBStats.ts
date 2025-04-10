import { useState, useEffect } from 'react';
import { MLB_CONSTANTS } from '@/utils/mlb-constants';

interface PlayerStat {
  id: string;
  name: string;
  hits: number;
}

interface MLBStats {
  playerStats: Record<string, PlayerStat>;
  daysElapsed: number;
  isLoading: boolean;
  error: string | null;
}

export function useMLBStats(): MLBStats {
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStat>>({});
  const [daysElapsed, setDaysElapsed] = useState(MLB_CONSTANTS.getDaysElapsed());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMLBStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/player-stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch MLB stats');
        }
        
        const data = await response.json();
        
        setPlayerStats(data.playerStats);
        setDaysElapsed(data.daysElapsed);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching MLB stats:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchMLBStats();
  }, []);

  return { playerStats, daysElapsed, isLoading, error };
} 