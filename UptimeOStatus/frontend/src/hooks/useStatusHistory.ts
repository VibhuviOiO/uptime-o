import { useEffect, useState } from "react";

export interface StatusHistoryRow {
  service: string;
  region: string;
  datacenter: string;
  statuses: string[]; // e.g. ["operational", "degraded", ...]
  responseTimes: number[];
}

export interface StatusHistoryData {
  days: string[];
  rows: StatusHistoryRow[];
}

export function useStatusHistory(filter: string) {
  const [data, setData] = useState<StatusHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/status-history");
        const json = await res.json();
        // Time window mapping in ms
        const now = Date.now();
        const filterMap: Record<string, number> = {
          "5min": 5 * 60 * 1000,
          "15min": 15 * 60 * 1000,
          "30min": 30 * 60 * 1000,
          "1hour": 60 * 60 * 1000,
          "4hours": 4 * 60 * 60 * 1000,
          "1day": 24 * 60 * 60 * 1000,
          "7days": 7 * 24 * 60 * 60 * 1000,
          "1month": 30 * 24 * 60 * 60 * 1000
        };
        const windowMs = filterMap[filter] || filterMap["15min"];
        if (json.records && Array.isArray(json.records)) {
          // Filter records by time window
          const filtered = json.records.filter((rec: any) => {
            if (!rec.executedAt) return false;
            const ts = new Date(rec.executedAt).getTime();
            return now - ts <= windowMs;
          });
          // Group by service, region, datacenter
          const groups: Record<string, StatusHistoryRow> = {};
          const daysSet = new Set<string>();
          filtered.forEach((rec: any) => {
            const day = rec.executedAt ? rec.executedAt.slice(0, 10) : "";
            daysSet.add(day);
            const key = `${rec.monitorName}|${rec.agentRegion}|${rec.targetHost}`;
            if (!groups[key]) {
              groups[key] = {
                service: rec.monitorName || rec.monitorId || "",
                region: rec.agentRegion || "",
                datacenter: rec.targetHost || "",
                statuses: [],
                responseTimes: []
              };
            }
            groups[key].statuses.push(rec.success ? "operational" : "down");
            groups[key].responseTimes.push(rec.responseTime || 0);
          });
          const days = Array.from(daysSet).sort();
          const rows = Object.values(groups);
          setData({ days, rows });
        } else {
          setData(null);
        }
      } catch (err) {
        setError("Failed to fetch status history");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filter]);

  return { data, loading, error };
}
