/** Best WPM recorded for a given test duration. */
export interface BestByDuration {
  duration: number;
  bestWpm: number;
}

/** One point on the WPM-over-time trend (most recent tests, oldest first). */
export interface TypingHistoryPoint {
  id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  duration: number;
  createdAt: string;
}

/** Aggregated typing-test stats for the profile dashboard. */
export interface TypingStats {
  totalTests: number;
  bestWpm: number;
  avgWpm: number;
  avgRawWpm: number;
  avgAccuracy: number;
  bestByDuration: BestByDuration[];
  history: TypingHistoryPoint[];
}
