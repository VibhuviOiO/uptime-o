import { Router } from 'express';
import pool from '../db.js';
import { StatusFilters } from '../models/filters.js';

function parseWindow(window?: string) {
  const map: Record<string, [number, string]> = {
    "5m": [5, "minute"],
    "15m": [15, "minute"],
    "30m": [30, "minute"],
    "1h": [1, "hour"],
    "4h": [4, "hour"],
    "24h": [24, "hour"],
    "1w": [1, "week"],
    "2w": [2, "week"],
  };
  return map[window ?? "1h"] ?? map["1h"];
}

const router = Router();

router.get('/', async (req, res) => {
  const filters: StatusFilters = req.query;
  const timeWindow = parseWindow(filters.window);
  
  const warnThreshold = parseInt(process.env.INDICATOR_WARN_THRESHOLD || '500');
  const dangerThreshold = parseInt(process.env.INDICATOR_DANGER_THRESHOLD || '1000');
  const successThresholdHigh = parseFloat(process.env.SUCCESS_THRESHOLD_HIGH || '0.8');
  const successThresholdLow = parseFloat(process.env.SUCCESS_THRESHOLD_LOW || '0.6');

  const params: any[] = [];
  let whereClauses = [`executed_at >= NOW() - INTERVAL '${timeWindow}'`];

  if (filters.regionId) {
    params.push(filters.regionId);
    whereClauses.push(`regions.id = $${params.length}`);
  }
  if (filters.datacenterId) {
    params.push(filters.datacenterId);
    whereClauses.push(`datacenters.id = $${params.length}`);
  }
  if (filters.search) {
    params.push(`%${filters.search}%`);
    whereClauses.push(`api_monitors.name ILIKE $${params.length}`);
  }

  const where = whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : "";

  const sql = `
    SELECT
      api_heartbeats.monitor_id,
      MIN(api_monitors.name) AS monitor_name,
      MIN(regions.id) AS region_id,
      MIN(regions.name) AS region,
      MIN(datacenters.id) AS datacenter_id,
      MIN(datacenters.name) AS datacenter,
      AVG(CASE WHEN api_heartbeats.success THEN 1 ELSE 0 END) AS success_rate,
      AVG(api_heartbeats.response_time_ms) AS avg_latency,
      MIN(api_heartbeats.warning_threshold_ms) AS warning_threshold,
      MIN(api_heartbeats.critical_threshold_ms) AS critical_threshold,
      MAX(api_heartbeats.executed_at) AS latest_executed_at
    FROM api_heartbeats
    JOIN agents ON api_heartbeats.agent_id = agents.id
    JOIN datacenters ON agents.datacenter_id = datacenters.id
    JOIN regions ON datacenters.region_id = regions.id
    JOIN api_monitors ON api_heartbeats.monitor_id = api_monitors.id
    ${where}
    GROUP BY api_heartbeats.monitor_id, datacenters.id
    ORDER BY api_heartbeats.monitor_id, datacenters.id
  `;

  try {
    const { rows } = await pool.query(sql, params);
    
    // Get latest success for each monitor/datacenter combination
    const result = await Promise.all(rows.map(async (row: any) => {
      let status = "operational";
      if (row.success_rate < successThresholdLow) {
        status = "down";
      } else if (row.success_rate < successThresholdHigh) {
        status = "degraded-orange";
      } else if (row.avg_latency > dangerThreshold) {
        status = "degraded-red";
      } else if (row.avg_latency > warnThreshold) {
        status = "degraded-orange";
      }

      // Query for the latest heartbeat success
      const latestQuery = `
        SELECT success
        FROM api_heartbeats
        WHERE monitor_id = $1
        AND agent_id IN (
          SELECT id FROM agents WHERE datacenter_id = $2
        )
        ORDER BY executed_at DESC
        LIMIT 1
      `;
      const latestResult = await pool.query(latestQuery, [row.monitor_id, row.datacenter_id]);
      const latestSuccess = latestResult.rows.length > 0 ? latestResult.rows[0].success : null;

      return {
        monitorId: row.monitor_id,
        monitorName: row.monitor_name,
        region_id: row.region_id,
        region: row.region,
        datacenter_id: row.datacenter_id,
        datacenter: row.datacenter,
        success: latestSuccess === true ? "UP" : latestSuccess === false ? "DOWN" : "UNKNOWN",
        status,
        successRate: Math.round(row.success_rate * 10000) / 100,
        avgLatencyMs: Math.round(row.avg_latency),
        warningThresholdMs: row.warning_threshold,
        criticalThresholdMs: row.critical_threshold,
      };
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

export default router;
