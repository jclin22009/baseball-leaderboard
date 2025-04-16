"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, } from "@/components/ui/card";

// Define NextGame interface
interface NextGameInfo {
  date: Date;
  homeTeam: string;
  awayTeam: string;
  gameTime: Date | null;
  venue: string;
}

export function SeasonProgress() {
  const [progress, setProgress] = useState(0);
  const [gamesCompleted, setGamesCompleted] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);
  const [nextGame, setNextGame] = useState<NextGameInfo | null>(null);

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
        let nextGameData = null;
        
        // Count games that have already been played (before today) and find next game
        if (scheduleData.dates) {
          // Sort dates to ensure chronological order
          const sortedDates = [...scheduleData.dates].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          
          for (const dateEntry of sortedDates) {
            const gameDate = new Date(dateEntry.date);
            
            if (gameDate < today) {
              // Add the games for this date to completed count
              completed += dateEntry.totalGames;
            } else if (!nextGameData && dateEntry.games && dateEntry.games.length > 0) {
              // This is the first future date with games - get the next game
              const game = dateEntry.games[0];
              nextGameData = {
                date: gameDate,
                homeTeam: game.teams?.home?.team?.name || 'TBD',
                awayTeam: game.teams?.away?.team?.name || 'TBD',
                gameTime: game.gameDate ? new Date(game.gameDate) : null,
                venue: game.venue?.name || 'TBD'
              };
              break;
            }
          }
        }
        
        // Calculate proportion as a percentage
        const proportion = total > 0 ? (completed / total) * 100 : 0;
        
        setGamesCompleted(completed);
        setTotalGames(total);
        setProgress(proportion);
        setNextGame(nextGameData);
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

  // Format the next game date and time
  const formatGameDateTime = (date: Date | null, time: Date | null): string => {
    if (!date) return 'TBD';
    
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'short' as const, 
      month: 'short' as const, 
      day: 'numeric' as const 
    };
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    
    if (!time) return formattedDate;
    
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: 'numeric' as const, 
      minute: '2-digit' as const, 
      hour12: true 
    };
    const formattedTime = time.toLocaleTimeString('en-US', timeOptions);
    
    return `${formattedDate} at ${formattedTime}`;
  };
  
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
          
          {nextGame && (
            <div className="text-sm mt-2 pt-2 border-t border-border">
              <p className="font-medium">Next Game:</p>
              <p className="text-xs">
                {nextGame.awayTeam} @ {nextGame.homeTeam} - {formatGameDateTime(nextGame.date, nextGame.gameTime)}
                {nextGame.venue && <span className="block text-muted-foreground">{nextGame.venue}</span>}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 