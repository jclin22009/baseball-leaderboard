import { useState, useEffect } from 'react';

export interface HitsByDate {
  date: string;
  hits: number;
}

export interface Hitter {
  id: number;
  name: string;
  position: string;
  hits: number;
  games: number;
  atBats: number;
  avg: string;
  hitsByDate: HitsByDate[];
}

interface TeamHittersResponse {
  teamId: string;
  season: string;
  topHitters: Hitter[];
}

interface UseTeamHittersProps {
  teamId?: string;
  limit?: number;
}

export function useTeamHitters({ teamId = '137', limit = 5 }: UseTeamHittersProps = {}) {
  const [data, setData] = useState<TeamHittersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/team-hitters?teamId=${teamId}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        const hittersData = await response.json();
        setData(hittersData);
      } catch (err) {
        console.error('Error fetching team hitters:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [teamId, limit]);

  return { data, isLoading, error };
} 