import { Request, Response, NextFunction } from 'express';
import { exportService } from '../services/export.service.js';

export async function exportMeasurementsCsv(req: Request, res: Response, next: NextFunction) {
  try {
    await exportService.exportMeasurements(res, req.query as any);
  } catch (err) {
    next(err);
  }
}

export async function exportStationsCsv(req: Request, res: Response, next: NextFunction) {
  try {
    await exportService.exportStations(res);
  } catch (err) {
    next(err);
  }
}

