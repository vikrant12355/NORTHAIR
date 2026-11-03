import { Router } from 'express';
import { getWeatherSummary, getWeatherCorrelation, getWeatherRelationships } from '../controllers/weather.controller.js';

const router = Router();

router.get('/summary', getWeatherSummary);
router.get('/correlation', getWeatherCorrelation);
router.get('/relationships', getWeatherRelationships);

export default router;

