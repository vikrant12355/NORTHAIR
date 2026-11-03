import { Request, Response, NextFunction } from 'express';
import { historicalService } from '../services/historical.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getHistoricalSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await historicalService.getSummary();
    return sendSuccess(res, data, { source: 'aqi_history_long.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getHistoricalTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await historicalService.getTrends(req.query as any);
    return sendSuccess(res, data, { source: 'aqi_history_long.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getHistoricalDistribution(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await historicalService.getDistribution();
    return sendSuccess(res, data, { source: 'aqi_history_long.parquet' });
  } catch (err) {
    next(err);
  }
}

