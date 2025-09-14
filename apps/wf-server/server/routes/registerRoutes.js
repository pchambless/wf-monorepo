import express from "express";
import execEventType from "../controller/execEventType.js";
import execDML from "../controller/execDML.js";
import execCreateDoc from "../controller/execCreateDoc.js";
import getDoc from "../controller/getDoc.js";
import { fetchStudioEventTypes } from "../controller/fetchStudioEventTypes.js";
import { discoverApps, discoverPages, discoverTemplates, discoverStructure, discoverEventTypes, genPageConfig } from "../controller/studioDiscovery/index.js";
import writeFileDirectly from "../controller/writeFileDirectly.js";
import initializeController from "../controller/initialize.js";
import listRoutesController from "../controller/listRegisteredRoutes.js";
import restartServerController from "../controller/restartServer.js";
import { fetchEventTypes } from "../controller/fetchEventTypes.js";
import { fetchQueryEvents } from "../controller/fetchQueryEvents.js";
import { fetchParams } from "../controller/fetchParams.js";
import { genFields } from "../controller/genFields.js";
import userLogin from "../controller/userLogin.js";
import eventTypeManager from "../utils/eventTypeManager.js";
import logger from "../utils/logger.js";

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
  registerRoute("post", "/api/execEventType", execEventType);
  registerRoute("post", "/api/execDML", execDML);
  registerRoute("post", "/api/execCreateDoc", execCreateDoc);
  registerRoute("get", "/api/getDoc", getDoc);
  registerRoute("get", "/api/server/queries", fetchQueryEvents);
  registerRoute("post", "/api/studio/genFields", genFields);
  
  // Studio Discovery APIs
  registerRoute("get", "/api/studio/apps", discoverApps);
  registerRoute("get", "/api/studio/pages", discoverPages);
  registerRoute("get", "/api/studio/templates", discoverTemplates);
  registerRoute("get", "/api/studio/structure", discoverStructure);
  registerRoute("get", "/api/studio/eventTypes", discoverEventTypes);
  registerRoute("get", "/api/studio/genPageConfig", genPageConfig);
  registerRoute("post", "/api/writeFileDirectly", writeFileDirectly);
  registerRoute("post", "/api/initialize", initializeController.initialize);
  registerRoute("get", "/api/util/list-routes", (req, res) => {
    logger.debug(`${codeName} Entering /util/list-routes`);
    listRoutesController.listRoutes(app)(req, res);
  });
  registerRoute(
    "post",
    "/api/util/restart-server",
    restartServerController.restartServer
  );
  registerRoute("get", "/api/util/fetchEventTypes", fetchEventTypes);
  registerRoute("post", "/api/eventType/params", fetchParams);
  registerRoute("post", "/api/auth/login", userLogin);
  registerRoute("get", "/api/util/event-types-status", (req, res) => {
    logger.debug(`${codeName} Fetching event types cache status`);
    const status = eventTypeManager.getCacheStatus();
    res.json(status);
  });

  // Log registered routes
  logger.info(`${codeName} Routes registered:`, routes);
  logger.info(`${codeName} Routes setup complete`);

  return router; // Return the router so it can be mounted
};

export default registerRoutes;
