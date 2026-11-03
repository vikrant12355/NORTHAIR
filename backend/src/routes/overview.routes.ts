import { Router } from 'express';
import { getOverviewSummary, getOverviewTrends, getRegionalComparison } from '../controllers/overview.controller.js';

const router = Router();

router.get('/', getOverviewSummary);
router.get('/trends', getOverviewTrends);
router.get('/regional-comparison', getRegionalComparison);

export default router;

