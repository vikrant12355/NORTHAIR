import { Request, Response, NextFunction } from 'express';
import { stationService } from '../services/station.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getStations(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await stationService.getStations(req.query as any);
    return sendSuccess(res, data.stations, {
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      source: 'station_metadata.parquet',
    });
  } catch (err) {
    next(err);
  }
}

export async function getStationById(req: Request, res: Response, next: NextFunction) {
  try {
    const stationId = req.params.stationId;
    const profile = await stationService.getStationProfile(stationId);
    if (!profile) {
      return sendError(res, `Station '${stationId}' not found in registry`, 404, 'NOT_FOUND');
    }
    return sendSuccess(res, profile, { source: 'station_metadata.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getStationTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const stationId = req.params.stationId;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const trends = await stationService.getStationTrends(stationId, limit);
    return sendSuccess(res, trends, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

