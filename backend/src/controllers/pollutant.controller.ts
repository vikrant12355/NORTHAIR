import { Request, Response, NextFunction } from 'express';
import { pollutantService } from '../services/pollutant.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getPollutants(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pollutantService.getSummary(req.query);
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getPollutantSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pollutantService.getSummary(req.query);
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getPollutantTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pollutantService.getTrends(req.query);
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getPollutantRelationships(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await pollutantService.getRelationships();
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

