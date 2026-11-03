import { Request, Response, NextFunction } from 'express';
import { qualityService } from '../services/quality.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getQualitySummary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await qualityService.getSummary();
    return sendSuccess(res, data, { source: 'data_quality_report.json' });
  } catch (err) {
    next(err);
  }
}

export async function getQualityMissingness(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await qualityService.getMissingness();
    return sendSuccess(res, data, { source: 'missing_values_2025.csv' });
  } catch (err) {
    next(err);
  }
}

export async function getQualityCoverage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await qualityService.getStationCoverage();
    return sendSuccess(res, data, { source: 'station_coverage_2025.csv' });
  } catch (err) {
    next(err);
  }
}

export async function getQualityStationIdentities(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await qualityService.getStationIdentities();
    return sendSuccess(res, data, { source: 'station_identity_crosswalk.csv' });
  } catch (err) {
    next(err);
  }
}

