import pool from '../db.js';

export interface HeartbeatRecord {
  id: number;
  monitorId: number;
  monitorName: string;
  monitorType: string;
  targetHost: string;
  agentRegion: string;
  executedAt: Date;
  success: boolean;
  responseTime: number;
  responseStatusCode: number;
  errorMessage: string | null;
}

/**
 * Fetches API heartbeats within a specified time window, including related monitor and region info.
 * @param {string} timeWindow - A PostgreSQL INTERVAL string (e.g., '15 minutes', '1 day').
 * @param {number} limit - The maximum number of records to return.
 * @returns {Promise<Array<object>>} The filtered heartbeat records.
 */
export async function getHeartbeatsInWindow(timeWindow: string, limit: number): Promise<HeartbeatRecord[]> {
  const sql = `
    SELECT
        h.id,
        h.monitor_id,
        m.name AS monitor_name,
        m.type AS monitor_type,
        m.url AS target_url, -- Used instead of separate host/port/path
        r.name AS agent_region,
        h.executed_at,
        h.success,
        h.response_time_ms,
        h.response_status_code,
        h.error_message
    FROM api_heartbeats h
    JOIN api_monitors m ON h.monitor_id = m.id
    JOIN regions r ON h.region_id = r.id -- Using denormalized region_id for fast join
    WHERE h.executed_at >= NOW() - INTERVAL $1
    ORDER BY h.executed_at DESC
    LIMIT $2;
  `;

  try {
    const { rows } = await pool.query(sql, [timeWindow, limit]);
    return rows.map((row: any): HeartbeatRecord => ({
      id: row.id,
      monitorId: row.monitor_id,
      monitorName: row.monitor_name,
      monitorType: row.monitor_type,
      targetHost: row.target_url,
      agentRegion: row.agent_region,
      executedAt: row.executed_at,
      success: row.success,
      responseTime: row.response_time_ms,
      responseStatusCode: row.response_status_code,
      errorMessage: row.error_message,
    }));
  } catch (err) {
    console.error("Database error fetching heartbeats:", err);
    throw new Error('Failed to retrieve heartbeats from database.');
  }
}
