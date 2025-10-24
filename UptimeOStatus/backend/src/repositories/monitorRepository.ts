import { pool } from '../db.js';

export async function getAllMonitorings() {
  const query = `
    SELECT id, "monitorId", "agentRegion", "monitorType", "targetHost", "success",
      "responseTime", "responseStatusCode", "executedAt", "errorMessage", "rawResponseHeaders",
      "rawRequestHeaders", "rawNetworkData"
    FROM monitors
    ORDER BY "executedAt" DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}