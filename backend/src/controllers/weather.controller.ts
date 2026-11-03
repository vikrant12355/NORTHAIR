import { Request, Response, NextFunction } from 'express';
import { weatherService } from '../services/weather.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getWeatherSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await weatherService.getSummary();
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getWeatherCorrelation(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await weatherService.getCorrelations();
    return sendSuccess(res, data, { source: 'weather_correlations.csv' });
  } catch (err) {
    next(err);
  }
}

export async function getWeatherRelationships(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await weatherService.getRelationships();
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

