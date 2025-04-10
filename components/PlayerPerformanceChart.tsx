'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Type definitions matching the API response
interface PerformanceDataPoint {
  date: string; 
  value: number;
}

interface PlayerPerformance {
  playerId: string;
  playerName: string;
  data: PerformanceDataPoint[];
}

interface ApiError {
  message: string;
}

// Define colors for different players
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];

const PlayerPerformanceChart: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PlayerPerformance[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/player-performance');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: PlayerPerformance[] = await response.json();
        setPerformanceData(result);
      } catch (e) {
        setError({ message: e instanceof Error ? e.message : 'An unknown error occurred' });
        console.error("Failed to fetch player performance data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading performance chart...</div>;
  }

  if (error) {
    return <div>Error loading performance chart: {error.message}</div>;
  }

  if (!performanceData || performanceData.length === 0) {
    return <div>No performance data available.</div>;
  }

  // Prepare data for Recharts: need a single array with dates and values for each player
  // Example target: [{ date: 'Week 1', "Shohei Ohtani": 7, "Mookie Betts": 6, ... }, ...]
  const chartData = performanceData[0].data.map((_, index) => {
    const dataPoint: { [key: string]: string | number } = {
      date: performanceData[0].data[index].date,
    };
    performanceData.forEach(player => {
      dataPoint[player.playerName] = player.data[index]?.value ?? 0;
    });
    return dataPoint;
  });

  return (
    <div>
      <h2>Player Weekly Hits Comparison</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: 'Hits', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {performanceData.map((player, index) => (
            <Line
              key={player.playerId}
              type="monotone"
              dataKey={player.playerName}
              stroke={COLORS[index % COLORS.length]}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerPerformanceChart; 