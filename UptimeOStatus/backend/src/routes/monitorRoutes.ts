import type { Request, Response, NextFunction } from 'express';
import express from 'express';
import * as service from '../services/monitorService.js';
const router = express.Router();

// GET /monitorings - returns all monitorings from Postgres
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
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
    const monitorings = await service.getAllMonitorings();
    // Filter by time window
    // Log a sample of executedAt values for debugging
    if (monitorings.length > 0) {
      console.log('Sample executedAt values:', monitorings.slice(0, 5).map(m => m.executedAt));
    }
    const filtered = monitorings.filter(m => {
      if (!m.executedAt) return false;
      let ts;
      // Try to parse as string first, fallback to Date object
      if (typeof m.executedAt === 'string') {
        // Accept both ISO and Postgres timestamp formats
        ts = Date.parse(m.executedAt);
        if (isNaN(ts)) {
          // Try replacing space with T for Postgres format
          ts = Date.parse(m.executedAt.replace(' ', 'T'));
        }
      } else if (m.executedAt instanceof Date) {
        ts = m.executedAt.getTime();
      } else {
        ts = NaN;
      }
      if (isNaN(ts)) {
        console.warn('Could not parse executedAt:', m.executedAt);
        return false;
      }
      return now - ts <= windowMs;
    });
    console.log(`[monitorings] window: ${windowParam}, ms: ${windowMs}, total: ${monitorings.length}, returned: ${filtered.length}`);
    if (filtered.length > 0) {
      console.log('Sample returned record:', filtered[0]);
    }
    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

export default router;