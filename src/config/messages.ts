// User-related messages
export const USER_NOT_FOUND = 'User not found. Please sign in to continue.';
export const NO_DATA_AVAILABLE =
  'No data available yet. Start your learning journey!';
export const FIRST_TIME_USER =
  'Welcome! Start your learning journey by taking some tests.';

// Study-related messages
export const NO_STUDY_HOURS =
  'Your study time will be tracked here! Come back after a few sessions to see your progress.';
export const NO_TEST_DATA =
  'No test data available yet. Take some tests to see your stats!';
export const NO_ANALYTICS = 'Start taking tests to see your analytics!';

// Progress-related messages
export const INSUFFICIENT_DATA =
  'Not enough data yet. Keep studying, and insights will appear soon!';
export const PROGRESS_UPDATE = (hours: number) =>
  `${round(hours, 2)} hours tracked so far. More insights coming soon!`;

// Test-related messages
export const NO_TEST_RESULTS =
  'No test results found. Start practicing to track your progress!';
export const NO_STUDY_GUIDE_RESULTS =
  'No test submissions found for this study guide. Take some tests to see your progress!';

// Helper function
function round(value: number, decimals: number): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}
