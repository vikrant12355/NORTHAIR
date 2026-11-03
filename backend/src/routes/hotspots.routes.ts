import { Router } from 'express';
import { getHotspots, getHotspotRankings, getHotspotDistribution, getHotspotHeatmap } from '../controllers/hotspot.controller.js';

const router = Router();

router.get('/', getHotspots);
router.get('/rankings', getHotspotRankings);
router.get('/distribution', getHotspotDistribution);
router.get('/heatmap', getHotspotHeatmap);

export default router;

