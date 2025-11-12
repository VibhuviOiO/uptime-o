import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const sql = `
      WITH latest_heartbeats AS (
        SELECT DISTINCT ON (h.monitor_id, d.region_id)
          h.monitor_id,
          d.region_id,
          h.success,
          (COALESCE(h.dns_lookup_ms, 0) + COALESCE(h.tcp_connect_ms, 0) + COALESCE(h.tls_handshake_ms, 0)) AS total_latency_ms,
          h.warning_threshold_ms,
          h.critical_threshold_ms,
          h.executed_at
        FROM api_heartbeats h
        JOIN agents a ON h.agent_id = a.id
        JOIN datacenters d ON a.datacenter_id = d.id
        WHERE h.executed_at >= NOW() - INTERVAL '1 hour'
        ORDER BY h.monitor_id, d.region_id, h.executed_at DESC
      ),
      active_regions AS (
        SELECT DISTINCT r.id, r.name
        FROM regions r
        JOIN datacenters d ON d.region_id = r.id
        JOIN agents a ON a.datacenter_id = d.id
        JOIN api_heartbeats h ON h.agent_id = a.id
        WHERE h.executed_at >= NOW() - INTERVAL '1 hour'
      )
      SELECT
        m.id AS monitor_id,
        m.name AS api_name,
        ar.name AS region,
        lh.success,
        lh.total_latency_ms,
        lh.warning_threshold_ms,
        lh.critical_threshold_ms,
        lh.executed_at
      FROM api_monitors m
      CROSS JOIN active_regions ar
      LEFT JOIN latest_heartbeats lh ON lh.monitor_id = m.id AND lh.region_id = ar.id
      ORDER BY m.id, ar.name
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
        } else if (row.total_latency_ms > row.critical_threshold_ms) {
          status = 'CRITICAL';
        } else if (row.total_latency_ms > row.warning_threshold_ms) {
          status = 'WARNING';
        }

        api.regionHealth[row.region] = {
          status,
          responseTimeMs: Math.round(row.total_latency_ms),
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
