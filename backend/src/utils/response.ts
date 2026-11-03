import { Response } from 'express';
import { ApiResponse } from '../types/api.js';

export function sendSuccess<T>(
  res: Response,
  data: T,
  metaExtra: Record<string, any> = {},
  statusCode = 200
): Response {
  const count = Array.isArray(data) ? data.length : 1;
  const payload: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      count,
      generatedAt: new Date().toISOString(),
      source: 'processed_cpcb_datasets',
      ...metaExtra,
    },
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: any
): Response {
  const payload: ApiResponse<null> = {
    success: false,
    data: null,
    meta: {
      generatedAt: new Date().toISOString(),
      source: 'processed_cpcb_datasets',
    },
    error: {
      code,
      message,
      details,
    },
  };
  return res.status(statusCode).json(payload);
}

