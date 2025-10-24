import express from "express";
import type { Request, Response } from "express";
import { getAllMonitorings } from "../repositories/monitorRepository.js";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const windowParam = req.query.window as string | undefined;
    const windowMap: Record<string, number> = {
      "5min": 5 * 60 * 1000,
      "15min": 15 * 60 * 1000,
      "30min": 30 * 60 * 1000,
      "1hour": 60 * 60 * 1000,
      "4hours": 4 * 60 * 60 * 1000,
      "1day": 24 * 60 * 60 * 1000,
      "7days": 7 * 24 * 60 * 60 * 1000,
      "1month": 30 * 24 * 60 * 60 * 1000
    };
    const now = Date.now();
    const windowMs = windowParam && windowMap[windowParam] ? windowMap[windowParam] : windowMap["15min"];
    const monitors = await getAllMonitorings();
    const filtered = monitors.filter(m => {
      if (!m.executedAt) return false;
      const ts = m.executedAt instanceof Date ? m.executedAt.getTime() : new Date(m.executedAt).getTime();
      return now - ts <= windowMs;
    });
    const records = filtered.map(m => ({
      id: m.id,
      monitorId: m.monitorId,
      monitorName: m.monitorName,
      monitorType: m.monitorType,
      targetHost: m.targetHost,
      targetPort: m.targetPort,
      targetPath: m.targetPath,
      agentRegion: m.agentRegion,
      executedAt: m.executedAt instanceof Date ? m.executedAt.toISOString() : (typeof m.executedAt === 'string' ? m.executedAt : ""),
      success: m.success,
      responseTime: m.responseTime,
      responseStatusCode: m.responseStatusCode,
      errorMessage: m.errorMessage,
    }));
    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status history' });
  }
});

export default router;
