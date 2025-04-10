import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fullName = searchParams.get('fullname');

  if (!fullName) {
    return NextResponse.json({ error: 'Missing fullname query parameter' }, { status: 400 });
  }

  // Fetch players for a specific sport and season
  const sportId = 1; // Assuming 1 is for Baseball
  const season = 2025; 
  const MLB_API_URL = `https://statsapi.mlb.com/api/v1/sports/${sportId}/players?season=${season}`;

  try {
    const res = await fetch(MLB_API_URL);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`MLB API request failed with status: ${res.status}`, errorText);
      return NextResponse.json(
        { error: `Failed to fetch player list from MLB API. Status: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Find the player by full name (case-insensitive comparison)
    // Adjust the property name if the API response structure is different
    const player = data.people?.find(
      (p: { fullName?: string }) => p.fullName?.toLowerCase() === fullName.toLowerCase()
    );

    if (player) {
      return NextResponse.json({ id: player.id }); // Assuming the player object has an 'id' field
    } else {
      return NextResponse.json({ error: `Player with name '${fullName}' not found for season ${season}` }, { status: 404 });
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the request.' },
      { status: 500 }
    );
  }
}
