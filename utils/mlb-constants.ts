// Helper to produce a YYYY-MM-DD string for MLB API URLs without timezone drift
function toYMD(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Define raw values once so the methods below can reference them
// EACH YEAR, UPDATE THESE VALUES
const SEASON_START_DATE = new Date('2026-03-25');
const SEASON_END_DATE   = new Date('2026-09-27');
const ASSIGNMENT_END_DATE = new Date('2026-05-30'); // Term / leaderboard cutoff
const SEASON_LENGTH_DAYS  = 187;
const CURRENT_SEASON      = '2026';
const DEFAULT_TEAM_ID     = '137'; // SF Giants

export const MLB_CONSTANTS = {
  // Date objects (use when Date arithmetic is needed)
  SEASON_START_DATE,
  SEASON_END_DATE,
  ASSIGNMENT_END_DATE,

  // Season metadata
  SEASON_LENGTH_DAYS,
  CURRENT_SEASON,
  DEFAULT_TEAM_ID,

  // Pre-formatted YYYY-MM-DD strings for building MLB API URLs
  SEASON_START:    toYMD(SEASON_START_DATE),
  SEASON_END:      toYMD(SEASON_END_DATE),
  ASSIGNMENT_END:  toYMD(ASSIGNMENT_END_DATE),

  getDaysElapsed: () => {
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - SEASON_START_DATE.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  getSeasonProgress: () => {
    const daysElapsed = MLB_CONSTANTS.getDaysElapsed();
    return daysElapsed / SEASON_LENGTH_DAYS;
  },
};
