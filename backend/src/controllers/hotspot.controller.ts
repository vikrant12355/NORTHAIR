import { Request, Response, NextFunction } from 'express';
import { hotspotService } from '../services/hotspot.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getHotspots(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await hotspotService.getHotspotRankings(10);
    return sendSuccess(res, data, { source: 'hotspot_rankings.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getHotspotRankings(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 48;
    const data = await hotspotService.getHotspotRankings(limit);
    return sendSuccess(res, data, { source: 'hotspot_rankings.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getHotspotDistribution(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await hotspotService.getDistribution();
    return sendSuccess(res, data, { source: 'hotspot_rankings.parquet' });
  } catch (err) {
    next(err);
  }
}

export async function getHotspotHeatmap(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await hotspotService.getHeatmapMatrix();
    return sendSuccess(res, data, { source: 'air_quality_2025_ist.parquet' });
  } catch (err) {
    next(err);
  }
}

