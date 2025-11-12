import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const sql = `
      WITH latest_heartbeats AS (
        SELECT DISTINCT ON (monitor_id, datacenter_id)
          monitor_id,
          datacenter_id,
          success,
          response_time_ms,
          warning_threshold_ms,
          critical_threshold_ms,
          executed_at
        FROM api_heartbeats
        JOIN agents ON api_heartbeats.agent_id = agents.id
        WHERE executed_at >= NOW() - INTERVAL '1 hour'
        ORDER BY monitor_id, datacenter_id, executed_at DESC
      )
      SELECT
        m.id AS monitor_id,
        m.name AS api_name,
        r.name AS region,
        lh.success,
        lh.response_time_ms,
        lh.warning_threshold_ms,
        lh.critical_threshold_ms,
        lh.executed_at
      FROM api_monitors m
      CROSS JOIN regions r
      LEFT JOIN datacenters d ON d.region_id = r.id
      LEFT JOIN latest_heartbeats lh ON lh.monitor_id = m.id AND lh.datacenter_id = d.id
      ORDER BY m.id, r.name
    `;

    const { rows } = await pool.query(sql);

    const apisMap = new Map<number, any>();
    const regionsSet = new Set<string>();

    rows.forEach((row: any) => {
      regionsSet.add(row.region);

      if (!apisMap.has(row.monitor_id)) {
        apisMap.set(row.monitor_id, {
          monitorId: row.monitor_id,
          apiName: row.api_name,
          regionHealth: {}
        });
      }

      const api = apisMap.get(row.monitor_id);
      
      if (row.success !== null) {
        let status = 'UP';
        if (!row.success) {
          status = 'DOWN';
        } else if (row.response_time_ms > row.critical_threshold_ms) {
          status = 'CRITICAL';
        } else if (row.response_time_ms > row.warning_threshold_ms) {
          status = 'WARNING';
        }

        api.regionHealth[row.region] = {
          status,
          responseTimeMs: Math.round(row.response_time_ms),
          lastChecked: row.executed_at
        };
      }
    });

    res.json({
      apis: Array.from(apisMap.values()),
      regions: Array.from(regionsSet).sort()
    });
  } catch (err) {
    console.error('Error fetching public status:', err);
    console.error('Stack trace:', err instanceof Error ? err.stack : err);
    res.status(500).json({ error: 'Failed to fetch status', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
