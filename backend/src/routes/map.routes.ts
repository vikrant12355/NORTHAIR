import { Router } from 'express';
import { getMapStations, getMapRegions } from '../controllers/map.controller.js';

const mapRouter = Router();

// GET /api/map/stations?pollutant=PM25&state=ALL&city=ALL
mapRouter.get('/stations', getMapStations);

// GET /api/map/regions?pollutant=PM25
mapRouter.get('/regions', getMapRegions);

export default mapRouter;

