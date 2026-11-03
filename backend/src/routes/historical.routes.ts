import { Router } from 'express';
import { getHistoricalSummary, getHistoricalTrends, getHistoricalDistribution } from '../controllers/historical.controller.js';

const router = Router();

router.get('/aqi', getHistoricalSummary);
router.get('/aqi/trends', getHistoricalTrends);
router.get('/aqi/distribution', getHistoricalDistribution);

export default router;

