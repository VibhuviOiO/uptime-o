import { Pool } from 'pg';

export const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'password',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

export default pool;
