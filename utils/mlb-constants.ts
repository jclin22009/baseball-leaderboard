export const MLB_CONSTANTS = {
  // 2025 MLB season started on March 27th, 2025
  SEASON_START_DATE: new Date('2025-03-27'),
  
  // Typical MLB regular season length (in days)
  SEASON_LENGTH_DAYS: 186,
  
  // Current MLB season year
  CURRENT_SEASON: '2025',
  
  // Calculate days elapsed in the current season
  getDaysElapsed: () => {
    const seasonStartDate = new Date('2025-03-27');
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - seasonStartDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },
  
  // Calculate season progress as a ratio (0-1)
  getSeasonProgress: () => {
    const daysElapsed = MLB_CONSTANTS.getDaysElapsed();
    return daysElapsed / MLB_CONSTANTS.SEASON_LENGTH_DAYS;
  }
} 