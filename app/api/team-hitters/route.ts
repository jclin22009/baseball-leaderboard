import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('teamId') || '137'; // Default to SF Giants (137)
  const season = searchParams.get('season') || '2025';
  const limit = parseInt(searchParams.get('limit') || '5', 10); // Default to top 5 hitters

  if (!teamId) {
    return NextResponse.json({ error: 'Missing teamId query parameter' }, { status: 400 });
  }

  try {
    // First, get all players for the team
    const rosterUrl = `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?season=${season}`;
    const rosterResponse = await fetch(rosterUrl);
    
    if (!rosterResponse.ok) {
      throw new Error(`Failed to fetch team roster: ${rosterResponse.statusText}`);
    }
    
    const rosterData = await rosterResponse.json();
    
    // Get all player IDs from the roster
    const playerIds = rosterData.roster.map((player: any) => player.person.id);
    
    // Get hitting stats for each player
    const playerStatsPromises = playerIds.map(async (playerId: number) => {
      const statsUrl = `https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=stats(group=hitting,type=byDateRange,startDate=${season}-03-27,endDate=${new Date().toISOString().split('T')[0]})`;
      const statsResponse = await fetch(statsUrl);
      
      if (!statsResponse.ok) {
        return null;
      }
      
      const playerData = await statsResponse.json();
      const person = playerData.people[0];
      
      // Check if player has hitting stats
      const stats = person.stats?.[0]?.splits?.[0]?.stat;
      
      if (!stats || stats.hits === undefined) {
        return null;
      }
      
      // Return player with their stats
      return {
        id: person.id,
        name: person.fullName,
        position: person.primaryPosition?.abbreviation || 'N/A',
        hits: stats.hits || 0,
        games: stats.gamesPlayed || 0,
        atBats: stats.atBats || 0,
        avg: stats.avg || '.000',
        hitsByDate: [], // Will be populated later
      };
    });
    
    // Wait for all player stats to resolve
    const playerStats = (await Promise.all(playerStatsPromises)).filter(
      (player): player is NonNullable<typeof player> => player !== null
    );
    
    // Sort by hits (descending) and take top N hitters
    const topHitters = playerStats
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);
    
    // For each top hitter, get their game logs to see hits by date
    const topHittersWithGameLogs = await Promise.all(
      topHitters.map(async (hitter) => {
        const gameLogUrl = `https://statsapi.mlb.com/api/v1/people/${hitter.id}/stats?stats=gameLog&group=hitting&season=${season}&hydrate=team`;
        const gameLogResponse = await fetch(gameLogUrl);
        
        if (!gameLogResponse.ok) {
          return { ...hitter, hitsByDate: [] };
        }
        
        const gameLogData = await gameLogResponse.json();
        const gameLogs = gameLogData.stats?.[0]?.splits || [];
        
        // Extract date and hits from each game
        const hitsByDate = gameLogs.map((game: any) => ({
          date: game.date,
          hits: game.stat?.hits || 0
        }));
        
        return {
          ...hitter,
          hitsByDate
        };
      })
    );
    
    return NextResponse.json({ 
      teamId,
      season,
      topHitters: topHittersWithGameLogs
    });
  } catch (error) {
    console.error("Error fetching team hitters:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 