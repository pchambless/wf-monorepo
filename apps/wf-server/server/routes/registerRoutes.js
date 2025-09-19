import express from "express";
import execEventType from "../controller/execEventType.js";
import fetchEventType from "../controller/fetchEventType.js";
import execDML from "../controller/execDML.js";
import execCreateDoc from "../controller/execCreateDoc.js";
import getDoc from "../controller/getDoc.js";
import { genPageConfig } from "../controller/studioDiscovery/index.js";
import writeFileDirectly from "../controller/writeFileDirectly.js";
import initializeController from "../controller/initialize.js";
import listRoutesController from "../controller/listRegisteredRoutes.js";
import restartServerController from "../controller/restartServer.js";
// Removed obsolete imports:
// - fetchEventTypes (file-based)
// - fetchQueryEvents (file-based)
// - fetchParams (file-based)
import { genFields } from "../controller/genFields.js";
import userLogin from "../controller/userLogin.js";
// Removed: eventTypeManager - no longer needed with database-driven system
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
  registerRoute("get", "/api/eventType/:xrefId", fetchEventType);
  registerRoute("post", "/api/execDML", execDML);
  registerRoute("post", "/api/execCreateDoc", execCreateDoc);
  registerRoute("get", "/api/getDoc", getDoc);
  // Removed: /api/server/queries - obsolete with database-driven eventTypes
  registerRoute("post", "/api/studio/genFields", genFields);
  
  // Removed Studio Discovery APIs - replaced with database queries:
  // - /api/studio/apps -> SELECT FROM api_wf.app
  // - /api/studio/pages -> SELECT FROM eventType_xref WHERE eventType=page
  // - /api/studio/templates -> SELECT FROM api_wf.eventType
  // - /api/studio/structure -> use vw_hier_components
  // - /api/studio/eventTypes -> use vw_hier_components
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
  // Removed: /api/util/fetchEventTypes - obsolete with database-driven eventTypes
  // Removed: /api/eventType/params - use GET /api/eventType/:xrefId instead
  registerRoute("post", "/api/auth/login", userLogin);
  // Removed: /api/util/event-types-status - no longer needed with database-driven system

  // Log registered routes
  logger.info(`${codeName} Routes registered:`, routes);
  logger.info(`${codeName} Routes setup complete`);

  return router; // Return the router so it can be mounted
};

export default registerRoutes;
