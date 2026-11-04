import { Request, Response } from 'express';
import { mapService } from '../services/map.service.js';

export const getMapStations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { state, city, pollutant } = req.query as Record<string, string>;
    const result = await mapService.getMapStations({ state, city, pollutant });
    res.json({
      success: true,
      data: result,
      meta: {
        count: result.stations.length,
        generatedAt: new Date().toISOString(),
        source: 'CPCB/SPCB CAAQMS 2025 Telemetry + Verified WGS-84 Coordinates',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'MAP_ERROR', message: err.message } });
  }
};

export const getMapRegions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pollutant } = req.query as Record<string, string>;
    const result = await mapService.getMapRegions({ pollutant });
    res.json({
      success: true,
      data: result,
      meta: {
        count: result.regions.length,
        generatedAt: new Date().toISOString(),
        source: 'CPCB/SPCB CAAQMS 2025 Telemetry — State Aggregates',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'MAP_REGIONS_ERROR', message: err.message } });
  }
};

