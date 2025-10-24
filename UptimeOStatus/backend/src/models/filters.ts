export interface StatusFilters {
  search?: string;
  regionId?: number;
  datacenterId?: number;
  window?: string; // "5m" | "15m" | "30m" | "1h" | "4h" | "24h" | "1w" | "2w"
}

export interface HeartbeatFilters {
  datacenterId?: number;
  window?: string;
  limit?: number;
}
