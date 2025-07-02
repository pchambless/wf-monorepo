import express from 'express';
import execEventType from '../controller/execEventType.js';
import initializeController from '../controller/initialize.js';
import listRoutesController from '../controller/listRegisteredRoutes.js';
import restartServerController from '../controller/restartServer.js';
import { fetchEventTypes } from '../controller/fetchEventTypes.js';
import userLogin from '../controller/userLogin.js';
import eventTypeManager from '../utils/eventTypeManager.js';
import logger from '../utils/logger.js';

const codeName = `[registerRoutes.js]`;

const registerRoutes = (app) => {
  logger.info(`${codeName} Started registering routes`);
  const router = express.Router();
  const routes = [];

  // Register routes directly with the paths as they will be called
  const registerRoute = (method, path, handler) => {
    // The client is already sending requests with /api prefix
    router[method](path, handler);
    routes.push(`${method.toUpperCase()} ${path}`);
  };

  // Register all routes using the helper function
  registerRoute('post', '/api/execEventType', execEventType);
  registerRoute('post', '/api/initialize', initializeController.initialize);
  registerRoute('get', '/api/util/list-routes', (req, res) => {
    logger.debug(`${codeName} Entering /util/list-routes`);
    listRoutesController.listRoutes(app)(req, res);
  });
  registerRoute('post', '/api/util/restart-server', restartServerController.restartServer);
  registerRoute('get', '/api/util/fetchEventTypes', fetchEventTypes);
  registerRoute('post', '/api/auth/login', userLogin);
  registerRoute('get', '/api/util/event-types-status', (req, res) => {
    logger.debug(`${codeName} Fetching event types cache status`);
    const status = eventTypeManager.getCacheStatus();
    res.json(status);
  });

  // Log registered routes
  logger.info(`${codeName} Routes registered:`, routes);
  logger.info(`${codeName} Routes setup complete`);

  return router;  // Return the router so it can be mounted
};

export default registerRoutes;
