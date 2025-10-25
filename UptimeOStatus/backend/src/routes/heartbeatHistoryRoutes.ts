import { Router } from 'express';
import pool from '../db.js';
import { HeartbeatFilters } from '../models/filters.js';

function parseWindow(window: string | undefined): string {
  switch (window) {
    case "5m": return "5 minutes";
    case "15m": return "15 minutes";
    case "30m": return "30 minutes";
    case "1h": return "1 hour";
    case "4h": return "4 hours";
    case "24h": return "24 hours";
    case "1w": return "1 week";
    case "2w": return "2 weeks";
    default: return "1 hour";
  }
}

const router = Router();

router.get('/:id/heartbeats', async (req, res) => {
  const filters: HeartbeatFilters = req.query;
  const monitorId = req.params.id;
  const timeWindow = parseWindow(filters.window);
  const maxLimit = Math.min(filters.limit || 250, 500);

  const params: any[] = [monitorId];
  let whereClauses = [`monitor_id = $1`, `executed_at >= NOW() - INTERVAL '${timeWindow}'`];
  let paramIdx = 2;

  if (filters.datacenterId) {
    params.push(filters.datacenterId);
    whereClauses.push(`datacenters.id = $${paramIdx++}`);
  }

  const where = "WHERE " + whereClauses.join(" AND ");

  const sql = `
    SELECT executed_at, success, response_time_ms
    FROM api_heartbeats
    JOIN agents ON api_heartbeats.agent_id = agents.id
    JOIN datacenters ON agents.datacenter_id = datacenters.id
    ${where}
    ORDER BY executed_at ASC
    LIMIT ${maxLimit}
  `;

  try {
    const { rows } = await pool.query(sql, params);
    const result = rows.map((row: any) => ({
      timestamp: row.executed_at.toISOString(),
      success: row.success,
      responseTimeMs: row.response_time_ms,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch heartbeats" });
  }
});

export default router;
