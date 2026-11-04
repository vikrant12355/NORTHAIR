import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveDataDir(): string {
  if (process.env.DATA_DIR && fs.existsSync(process.env.DATA_DIR)) {
    return path.resolve(process.env.DATA_DIR);
  }
  const candidates = [
    path.resolve(__dirname, '../../../data'),
    path.resolve(process.cwd(), '../data'),
    path.resolve(process.cwd(), 'data'),
    path.resolve(__dirname, '../../data'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return path.resolve(__dirname, '../../../data');
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  DATA_DIR: resolveDataDir(),
  FRONTEND_DIST: process.env.FRONTEND_DIST
    ? path.resolve(process.env.FRONTEND_DIST)
    : path.resolve(__dirname, '../../../frontend/dist'),
  CACHE_TTL_MS: parseInt(process.env.CACHE_TTL_MS || '60000', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '300', 10),
};
