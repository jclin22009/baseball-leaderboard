"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, } from "@/components/ui/card";

export function SeasonProgress() {
  const [progress, setProgress] = useState(0);
  const [gamesCompleted, setGamesCompleted] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeasonProgress() {
      try {
        // Fetch the MLB schedule data
        const scheduleUrl = 'https://statsapi.mlb.com/api/v1/schedule?hydrate=team,lineups&sportId=1&startDate=2025-03-27&endDate=2025-05-31&teamId=137';
        const response = await fetch(scheduleUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch schedule: ${response.status}`);
        }
        
        const scheduleData = await response.json();
        
        // Calculate games completed so far
        const today = new Date();
        let completed = 0;
        const total = scheduleData.totalGames || 0;
        
        // Count games that have already been played (before today)
        if (scheduleData.dates) {
          for (const dateEntry of scheduleData.dates) {
            const gameDate = new Date(dateEntry.date);
            if (gameDate < today) {
              // Add the games for this date
              completed += dateEntry.totalGames;
            }
          }
        }
        
        // Calculate proportion as a percentage
        const proportion = total > 0 ? (completed / total) * 100 : 0;
        
        setGamesCompleted(completed);
        setTotalGames(total);
        setProgress(proportion);
      } catch (error) {
        console.error("Error fetching season progress:", error);
        
        // Fallback to date-based calculation
        const today = new Date();
        const seasonStart = new Date('2025-03-27');
        const seasonEnd = new Date('2025-09-28');
        const elapsedTime = Math.max(0, today.getTime() - seasonStart.getTime());
        const totalSeasonTime = seasonEnd.getTime() - seasonStart.getTime();
        const proportion = (elapsedTime / totalSeasonTime) * 100;
        
        setProgress(proportion);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSeasonProgress();
  }, []);
  
  return (
    <Card className="mx-4 lg:mx-6">
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {loading 
                ? "Loading..." 
                : `${gamesCompleted} of ${totalGames} games completed (${Math.round(progress)}%) until May 31`}
            </span>
            <span>Season 2025</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 