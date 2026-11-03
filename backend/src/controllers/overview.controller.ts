import { Request, Response, NextFunction } from 'express';
import { overviewService } from '../services/overview.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getOverviewSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await overviewService.getSummary(req.query);
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getOverviewTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await overviewService.getTrends(req.query);
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getRegionalComparison(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await overviewService.getRegionalComparison();
    return sendSuccess(res, data, { source: 'state_comparison.parquet' });
  } catch (err) {
    next(err);
  }
}

