import { Request, Response, NextFunction } from 'express';
import { logger } from './requestLogger.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error({
    message: err.message || 'Unhandled error',
    stack: err.stack,
    url: req.originalUrl,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  sendError(res, message, statusCode, code, err.details);
}

