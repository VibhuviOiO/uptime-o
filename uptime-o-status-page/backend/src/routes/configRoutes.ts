import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    navbarTitle: process.env.NAVBAR_TITLE || 'Health Status',
    statusPageTitle: process.env.STATUS_PAGE_TITLE || 'Health Status',
    statusPageSubtitle: process.env.STATUS_PAGE_SUBTITLE || 'Real-time monitoring dashboard',
  });
});

export default router;