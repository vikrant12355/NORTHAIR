import { Router } from 'express';
import {
  getMapStations,
  getMapRegions,
  getMapSummary,
  getMapLegend,
  getMapFeatureValues,
  getStationDetail,
} from '../controllers/map.controller.js';

const mapRouter = Router();

// 1. GET /api/map/regions
mapRouter.get('/regions', getMapRegions);

// 2. GET /api/map/summary
mapRouter.get('/summary', getMapSummary);

// 3. GET /api/map/legend
mapRouter.get('/legend', getMapLegend);

// 4. GET /api/map/feature-values
mapRouter.get('/feature-values', getMapFeatureValues);

// 5. GET /api/map/stations/:stationId
mapRouter.get('/stations/:stationId', getStationDetail);

// 6. GET /api/map/stations
mapRouter.get('/stations', getMapStations);

export default mapRouter;
