import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { Pool } from 'pg';
import datacentersRoutes from './routes/datacentersRoutes.js';
import regionsRoutes from './routes/regionsRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import heartbeatHistoryRoutes from './routes/heartbeatHistoryRoutes.js';
import configRoutes from './routes/configRoutes.js';
import publicStatusRoutes from './routes/publicStatusRoutes.js';
import brandingRoutes from './routes/brandingRoutes.js';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8077;

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

app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());

app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}))

app.get('/health', async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Postgres connection: SUCCESS');
  } catch (err) {
    console.error('Postgres connection: FAILED', err);
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/public/status', publicStatusRoutes);
app.use('/api/public/branding', brandingRoutes);
app.use('/datacenters', datacentersRoutes);
app.use('/regions', regionsRoutes);
app.use('/status', statusRoutes);
app.use('/monitors', heartbeatHistoryRoutes);
app.use('/config', configRoutes);

app.use(errorHandler);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});


app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Postgres connection: SUCCESS');
  } catch (err) {
    console.error('Postgres connection: FAILED', err);
  }
  console.log(`Backend server running on http://localhost:${PORT}`);
});
