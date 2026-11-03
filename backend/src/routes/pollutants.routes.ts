import { Router } from 'express';
import { getPollutants, getPollutantSummary, getPollutantTrends, getPollutantRelationships } from '../controllers/pollutant.controller.js';

const router = Router();

router.get('/', getPollutants);
router.get('/summary', getPollutantSummary);
router.get('/trends', getPollutantTrends);
router.get('/relationships', getPollutantRelationships);

export default router;

