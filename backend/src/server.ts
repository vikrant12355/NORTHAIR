import { createApp } from './app.js';
import { dbManager } from './config/database.js';
import { ENV } from './config/env.js';
import { logger } from './middleware/requestLogger.js';

async function bootstrap() {
  try {
    logger.info('Initializing NorthAir Intelligence DuckDB connection...');
    await dbManager.initialize();
    logger.info('DuckDB views created successfully.');

    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`🚀 NorthAir Intelligence Server listening on http://localhost:${ENV.PORT}`);
      logger.info(`📊 Health check: http://localhost:${ENV.PORT}/api/health`);
      logger.info(`🗺️ API Base: http://localhost:${ENV.PORT}/api`);
    });

    const shutdown = () => {
      logger.info('Gracefully shutting down server...');
      server.close(() => {
        logger.info('Server closed. Goodbye.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err: any) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

