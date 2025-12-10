import { Router } from 'express';
import pool from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const warnThreshold = parseInt(process.env.INDICATOR_WARN_THRESHOLD || '500');
    const dangerThreshold = parseInt(process.env.INDICATOR_DANGER_THRESHOLD || '1000');
    const sampleSize = parseInt(process.env.STATUS_SAMPLE_SIZE || '20');
    const successThresholdHigh = parseFloat(process.env.SUCCESS_THRESHOLD_HIGH || '0.8');
    const successThresholdLow = parseFloat(process.env.SUCCESS_THRESHOLD_LOW || '0.6');

    const sql = `
      WITH latest_heartbeats AS (
        SELECT
          h.monitor_id,
          d.region_id,
          h.success,
          (COALESCE(h.response_time_ms, 0) + COALESCE(h.dns_lookup_ms, 0) + COALESCE(h.tcp_connect_ms, 0) + COALESCE(h.tls_handshake_ms, 0)) AS total_latency_ms,
          h.warning_threshold_ms,
          h.critical_threshold_ms,
          h.executed_at,
          ROW_NUMBER() OVER (PARTITION BY h.monitor_id, d.region_id ORDER BY h.executed_at DESC) as rn
        FROM api_heartbeats h
        JOIN agents a ON h.agent_id = a.id
        JOIN datacenters d ON a.datacenter_id = d.id
        WHERE h.executed_at >= NOW() - INTERVAL '10 minutes'
      ),
      aggregated_heartbeats AS (
        SELECT
          monitor_id,
          region_id,
          COUNT(*) as total_calls,
          SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_calls,
          AVG(total_latency_ms) as avg_latency_ms,
          MAX(executed_at) as latest_executed_at,
          MIN(warning_threshold_ms) as warning_threshold,
          MIN(critical_threshold_ms) as critical_threshold
        FROM latest_heartbeats
        WHERE rn <= ${sampleSize}
        GROUP BY monitor_id, region_id
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
        ah.total_calls,
        ah.successful_calls,
        ah.avg_latency_ms,
        ah.warning_threshold,
        ah.critical_threshold,
        ah.latest_executed_at
      FROM api_monitors m
      CROSS JOIN active_regions ar
      LEFT JOIN aggregated_heartbeats ah ON ah.monitor_id = m.id AND ah.region_id = ar.id
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
      
      if (row.total_calls !== null && row.total_calls > 0) {
        const successRate = row.successful_calls / row.total_calls;
        let status = 'UP';
        
        if (successRate < successThresholdLow) {
          status = 'DOWN';
        } else if (successRate < successThresholdHigh) {
          status = 'WARNING';
        } else if (row.avg_latency_ms > dangerThreshold) {
          status = 'CRITICAL';
        } else if (row.avg_latency_ms > warnThreshold) {
          status = 'WARNING';
        }

        api.regionHealth[row.region] = {
          status,
          responseTimeMs: Math.round(row.avg_latency_ms),
          lastChecked: row.latest_executed_at,
          successRate: Math.round(successRate * 100),
          totalCalls: row.total_calls
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
