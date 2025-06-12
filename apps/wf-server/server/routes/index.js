require('module-alias/register');
const codeName = `[index.js] `;
const logger = require('@utils/logger');
const router = require('@routes/registerRoutes');

const initializeRoutes = (app) => {
  logger.debug(`${codeName} Initializing routes`);
  const routes = router(app);
  
  // Mount the router to handle all routes
  app.use('/', routes);
  
  logger.debug(`${codeName} Routes initialized`);
};

module.exports = initializeRoutes;  
