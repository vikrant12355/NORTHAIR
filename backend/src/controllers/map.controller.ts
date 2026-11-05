import { Request, Response } from 'express';
import { mapService } from '../services/map.service.js';

export const getMapStations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { state, city, pollutant, startDate, endDate } = req.query as Record<string, string>;
    const result = await mapService.getMapStations({ state, city, pollutant, startDate, endDate });
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
    const { pollutant, startDate, endDate } = req.query as Record<string, string>;
    const result = await mapService.getMapRegions({ pollutant, startDate, endDate });
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

export const getMapSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { state, city, pollutant, startDate, endDate } = req.query as Record<string, string>;
    const result = await mapService.getMapSummary({ state, city, pollutant, startDate, endDate });
    res.json({
      success: true,
      data: result,
      meta: {
        generatedAt: new Date().toISOString(),
        source: 'NorthAir Intelligence Geospatial Summary Engine',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'MAP_SUMMARY_ERROR', message: err.message } });
  }
};

export const getMapLegend = async (req: Request, res: Response): Promise<void> => {
  try {
    const { state, city, pollutant, startDate, endDate } = req.query as Record<string, string>;
    const result = await mapService.getMapStations({ state, city, pollutant, startDate, endDate });
    res.json({
      success: true,
      data: result.legend,
      meta: {
        generatedAt: new Date().toISOString(),
        method: result.legend.method,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'MAP_LEGEND_ERROR', message: err.message } });
  }
};

export const getMapFeatureValues = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pollutant, state } = req.query as Record<string, string>;
    const result = await mapService.getMapFeatureValues({ pollutant, state });
    res.json({
      success: true,
      data: result,
      meta: {
        generatedAt: new Date().toISOString(),
        source: 'Spatial Feature KV Join Table',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'MAP_FEATURES_ERROR', message: err.message } });
  }
};

export const getStationDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stationId } = req.params;
    const { pollutant } = req.query as Record<string, string>;
    const result = await mapService.getStationDetail(stationId, { pollutant });
    if (!result) {
      res.status(404).json({ success: false, error: { code: 'STATION_NOT_FOUND', message: `Station ${stationId} not found` } });
      return;
    }
    res.json({
      success: true,
      data: result,
      meta: {
        generatedAt: new Date().toISOString(),
        source: 'CPCB CAAQMS Single Station Profile',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'STATION_DETAIL_ERROR', message: err.message } });
  }
};
