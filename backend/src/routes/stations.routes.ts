import { Router } from 'express';
import { getStations, getStationById, getStationTrends } from '../controllers/station.controller.js';

const router = Router();

router.get('/', getStations);
router.get('/:stationId', getStationById);
router.get('/:stationId/trends', getStationTrends);

export default router;

