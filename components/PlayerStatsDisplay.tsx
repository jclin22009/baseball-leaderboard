'use client';

import React, { useState, useEffect } from 'react';

interface PlayerStat {
  id: string;
  name: string;
  hits: number;
}

interface PlayerStatsData {
  playerStats: Record<string, PlayerStat>;
  daysElapsed: number;
}

interface ApiError {
  message: string;
}

const PlayerStatsDisplay: React.FC = () => {
  const [data, setData] = useState<PlayerStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/player-stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (e) {
        setError({ message: e instanceof Error ? e.message : 'An unknown error occurred' });
        console.error("Failed to fetch player stats:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div>Loading player stats...</div>;
  }

  if (error) {
    return <div>Error fetching player stats: {error.message}</div>;
  }

  if (!data || Object.keys(data.playerStats).length === 0) {
    return <div>No player stats available.</div>;
  }

  // Get top 10 players by hits
  const topPlayers = Object.values(data.playerStats)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 10);

  return (
    <div>
      <h2>MLB Player Stats ({data.daysElapsed} days elapsed in season)</h2>
      <h3>Top 10 Players by Hits:</h3>
      <ul>
        {topPlayers.map((player) => (
          <li key={player.id}>
            {player.name}: {player.hits} Hits
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerStatsDisplay; 