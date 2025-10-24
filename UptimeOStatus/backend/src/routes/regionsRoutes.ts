import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, region_code AS "regionCode", group_name AS "group" FROM regions ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

export default router;
