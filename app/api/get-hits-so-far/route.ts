import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const playerId = searchParams.get('playerId');
  const season = searchParams.get('season') ?? '2025';
  const endDate = searchParams.get('endDate');

  if (!playerId) {
    return NextResponse.json({ error: 'Missing playerId query parameter' }, { status: 400 });
  }

  // If endDate is provided, use byDateRange to limit the data to that date
  // Otherwise, use season stats for the full season
  let url: string;
  if (endDate) {
    // Use byDateRange with startDate as season start (March 27) and provided endDate
    const startDate = `${season}-03-27`;
    url = `https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=stats(group=hitting,type=byDateRange,startDate=${startDate},endDate=${endDate})`;
  } else {
    // Fallback to season stats
    url = `https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=stats(group=hitting,type=season,season=${season})`;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from MLB API: ${response.statusText}`);
    }

    const data = await response.json();

    // Navigate the structure safely
    const hits = data?.people?.[0]?.stats?.[0]?.splits?.[0]?.stat?.hits ?? 0;

    // Always return hits as a number, defaulting to 0 if undefined/null
    return NextResponse.json({ hits });
  } catch (error) {
    console.error("Error fetching MLB data:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
