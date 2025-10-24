export interface HeartbeatRow {
  timestamp: string; // ISO string
  success: boolean;
  responseTimeMs: number;
}
