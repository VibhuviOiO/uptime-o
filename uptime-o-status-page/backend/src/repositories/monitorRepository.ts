import pool from '../db.js';

export async function getAllMonitorings() {
  const query = `
    SELECT 
      h.id,
      h.monitor_id,
      m.name AS monitor_name,
      m.type AS monitor_type,
      m.url AS target_host,
      r.name AS agent_region,
      h.success,
      h.response_time_ms,
      h.response_status_code,
      h.executed_at,
      h.error_message,
      h.raw_response_headers,
      h.raw_request_headers
    FROM api_heartbeats h
    JOIN api_monitors m ON h.monitor_id = m.id
    JOIN agents a ON h.agent_id = a.id
    JOIN datacenters d ON a.datacenter_id = d.id
    JOIN regions r ON d.region_id = r.id
    ORDER BY h.executed_at DESC
    LIMIT 1000
  `;
  const { rows } = await pool.query(query);
  return rows;
}