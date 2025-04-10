import { NextResponse } from "next/server";

export async function GET() {
  const sportId = 1; // Assuming 1 is for Baseball
  const season = 2025;
  const MLB_API_URL = `https://statsapi.mlb.com/api/v1/sports/${sportId}/players?season=${season}`;

  try {
    const res = await fetch(MLB_API_URL);

    if (!res.ok) {
      // Log error details for debugging
      const errorText = await res.text();
      console.error(
        `MLB API request failed with status: ${res.status}`,
        errorText
      );
      return NextResponse.json(
        { error: `Failed to fetch data from MLB API. Status: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from MLB API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while fetching data." },
      { status: 500 }
    );
  }
}
