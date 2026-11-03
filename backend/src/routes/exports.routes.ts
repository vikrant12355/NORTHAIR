import { Router } from 'express';
import { exportMeasurementsCsv, exportStationsCsv } from '../controllers/export.controller.js';

const router = Router();

router.get('/measurements.csv', exportMeasurementsCsv);
router.get('/stations.csv', exportStationsCsv);
router.get('/summary.csv', exportStationsCsv);

export default router;

