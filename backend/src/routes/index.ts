import { Router } from 'express';
import overviewRoutes from './overview.routes.js';
import regionalRoutes from './regional.routes.js';
import stationsRoutes from './stations.routes.js';
import hotspotsRoutes from './hotspots.routes.js';
import pollutantsRoutes from './pollutants.routes.js';
import weatherRoutes from './weather.routes.js';
import historicalRoutes from './historical.routes.js';
import analyticsRoutes from './analytics.routes.js';
import qualityRoutes from './quality.routes.js';
import exportsRoutes from './exports.routes.js';
import { getHealth, getMeta, getFilters, getFindings, getMethodology } from '../controllers/system.controller.js';

const apiRouter = Router();

// System routes
apiRouter.get('/health', getHealth);
apiRouter.get('/meta', getMeta);
apiRouter.get('/filters', getFilters);
apiRouter.get('/reports/findings', getFindings);
apiRouter.get('/reports/methodology', getMethodology);

// Domain routes
apiRouter.use('/overview', overviewRoutes);
apiRouter.use('/regions', regionalRoutes);
apiRouter.use('/stations', stationsRoutes);
apiRouter.use('/hotspots', hotspotsRoutes);
apiRouter.use('/pollutants', pollutantsRoutes);
apiRouter.use('/weather', weatherRoutes);
apiRouter.use('/historical', historicalRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/quality', qualityRoutes);
apiRouter.use('/exports', exportsRoutes);

export default apiRouter;

