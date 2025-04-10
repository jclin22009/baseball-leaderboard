import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const playerId = searchParams.get('playerId');
  const season = searchParams.get('season') ?? '2025';

  if (!playerId) {
    return NextResponse.json({ error: 'Missing playerId query parameter' }, { status: 400 });
  }

  const url = `https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=stats(group=hitting,type=season,season=${season})`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from MLB API: ${response.statusText}`);
    }

    const data = await response.json();

    // Navigate the structure safely
    const hits = data?.people?.[0]?.stats?.[0]?.splits?.[0]?.stat?.hits;

    if (hits === undefined || hits === null) {
       // Handle cases where the stats structure might be different or missing for the season/player
      return NextResponse.json({ hits: 0, message: `No hitting stats found for player ${playerId} in season ${season}` });
    }

    return NextResponse.json({ hits });
  } catch (error) {
    console.error("Error fetching MLB data:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
