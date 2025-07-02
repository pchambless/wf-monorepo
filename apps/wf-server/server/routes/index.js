import logger from '../utils/logger.js';
import router from './registerRoutes.js';

const codeName = `[index.js] `;

const initializeRoutes = (app) => {
  logger.debug(`${codeName} Initializing routes`);
  const routes = router(app);
  
  // Mount the router to handle all routes
  app.use('/', routes);
  
  logger.debug(`${codeName} Routes initialized`);
};

export default initializeRoutes;  
