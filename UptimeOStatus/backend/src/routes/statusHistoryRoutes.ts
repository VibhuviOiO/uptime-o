import express from "express";
import type { Request, Response } from "express";
import { getHeartbeatsInWindow } from "../repositories/heartbeatRepository.js"; 

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const windowParam = req.query.window as string | undefined;
    const windowMap: Record<string, string> = {
      "5min": "5 minutes",
      "15min": "15 minutes",
      "30min": "30 minutes",
      "1hour": "1 hour",
      "4hours": "4 hours",
      "1day": "24 hours",
      "7days": "7 days",
      "1month": "30 days"
    };
    
    const timeWindow = windowParam && windowMap[windowParam] ? windowMap[windowParam] : windowMap["15min"];
    const maxLimit = 500;
    const records = await getHeartbeatsInWindow(timeWindow, maxLimit);
  const formattedRecords = records.map((m: import("../repositories/heartbeatRepository.d.ts").HeartbeatRecord) => ({
      id: m.id,
      monitorId: m.monitorId,
      monitorName: m.monitorName,
      monitorType: m.monitorType,
      targetHost: m.targetHost, 
      agentRegion: m.agentRegion,
      executedAt: m.executedAt,
      success: m.success,
      responseTime: m.responseTime,
      responseStatusCode: m.responseStatusCode,
      errorMessage: m.errorMessage,
    }));
    
    res.json({ records: formattedRecords });

  } catch (err) {
    console.error("Error fetching status history:", err);
    res.status(500).json({ error: 'Failed to fetch status history' });
  }
});

export default router;