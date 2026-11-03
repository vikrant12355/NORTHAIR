import { Router } from 'express';
import { getStates, getCities, getRegionalComparison } from '../controllers/regional.controller.js';

const router = Router();

router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/comparison', getRegionalComparison);

export default router;

