import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getSeasonalAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getSeasonal(req.query.state as string);
    return sendSuccess(res, data, { source: 'calculated_aqi.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getDiurnalAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await analyticsService.getDiurnal(req.query.state as string, req.query.season as string);
    return sendSuccess(res, data, { source: 'diurnal_profiles.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getComparisonAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const ids = req.query.stationIds ? (req.query.stationIds as string).split(',') : [];
    const data = await analyticsService.compare(ids);
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

