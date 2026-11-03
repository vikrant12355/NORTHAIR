import { Router } from 'express';
import { getSeasonalAnalytics, getDiurnalAnalytics, getComparisonAnalytics } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/seasonal', getSeasonalAnalytics);
router.get('/diurnal', getDiurnalAnalytics);
router.get('/compare', getComparisonAnalytics);
router.get('/comparison', getComparisonAnalytics);

export default router;

