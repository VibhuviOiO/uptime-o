import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, code, name, region_id AS "regionId" FROM datacenters ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch datacenters' });
  }
});

export default router;
