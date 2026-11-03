import { Router } from 'express';
import {
  getQualitySummary,
  getQualityMissingness,
  getQualityCoverage,
  getQualityStationIdentities,
} from '../controllers/quality.controller.js';

const router = Router();

router.get('/summary', getQualitySummary);
router.get('/missingness', getQualityMissingness);
router.get('/coverage', getQualityCoverage);
router.get('/station-identities', getQualityStationIdentities);

export default router;

