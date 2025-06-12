require('module-alias/register');
const express = require('express');
const execEventType = require('@controller/execEventType');
const initializeController = require('@controller/initialize');
const listRoutesController = require('@controller/listRegisteredRoutes');
const restartServerController = require('@controller/restartServer');
const { fetchEventTypes } = require('@controller/fetchEventTypes');
const userLogin = require('@controller/userLogin'); // Import userLogin controller
const eventTypeManager = require('@utils/eventTypeManager');
const logger = require('@utils/logger');
const codeName = `[registerRoutes.js]`;

module.exports = (app) => {
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
