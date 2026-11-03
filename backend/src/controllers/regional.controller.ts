import { Request, Response, NextFunction } from 'express';
import { regionalService } from '../services/regional.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getStates(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await regionalService.getStates();
    return sendSuccess(res, data, { source: 'state_comparison.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getCities(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await regionalService.getCities();
    return sendSuccess(res, data, { source: 'city_comparison.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getRegionalComparison(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await regionalService.getRegionalMesh();
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

