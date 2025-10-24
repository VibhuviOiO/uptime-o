import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { Pool } from 'pg';
import { StatusRow } from './models/status.js';
import { HeartbeatRow } from './models/heartbeat.js';
import { StatusFilters, HeartbeatFilters } from './models/filters.js';
import datacentersRoutes from './routes/datacentersRoutes.js';
import regionsRoutes from './routes/regionsRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import heartbeatHistoryRoutes from './routes/heartbeatHistoryRoutes.js';
import configRoutes from './routes/configRoutes.js';

const app = express();
const PORT = 8077;

const pool = new Pool({
  connectionString: process.env.DB_CONN_STRING,
});

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

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/datacenters', datacentersRoutes);
app.use('/regions', regionsRoutes);
app.use('/status', statusRoutes);
app.use('/monitors', heartbeatHistoryRoutes);
app.use('/config', configRoutes);

app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Postgres connection: SUCCESS');
  } catch (err) {
    console.error('Postgres connection: FAILED', err);
  }
  console.log(`Backend server running on http://localhost:${PORT}`);
});
