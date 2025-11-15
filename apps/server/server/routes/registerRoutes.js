import express from "express";
import execEvent from "../controller/execEvent.js";
import fetchEventType from "../controller/fetchEventType.js";
import getEventTypes from "../controller/getEventTypes.js";
import getTriggers from "../controller/getTriggers.js";
import execDML from "../controller/execDML.js";
import execCreateDoc from "../controller/execCreateDoc.js";
import getDoc from "../controller/getDoc.js";
import genPageConfigController from "../controller/genPageConfigController.js";
import initializeController from "../controller/initialize.js";
import listRoutesController from "../controller/listRegisteredRoutes.js";
import restartServerController from "../controller/restartServer.js";
import githubController from "../controller/githubController.js";
// Removed obsolete imports:
// - fetchEventTypes (file-based)
// - fetchQueryEvents (file-based)
// - fetchParams (file-based)
import { genFields } from "../controller/genFields.js";
import userLogin from "../controller/userLogin.js";
import getVal from "../controller/getVal.js";
import setVals from "../controller/setVals.js";
import clearVals from "../controller/clearVals.js";
import logImpactController, {
  getRecentImpacts,
  getBatchImpacts,
} from "../controller/logImpact.js";
import runMigration from "../controller/runMigration.js";
import getMigrationStatus from "../controller/getMigrationStatus.js";
import openTerminal from "../controller/openTerminal.js";
import cloneStep from "../controller/cloneStep.js";
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
  registerRoute("post", "/api/execEvent", execEvent);
  registerRoute("get", "/api/eventType/:xrefId", fetchEventType);
  registerRoute("get", "/api/eventTypes", getEventTypes);
  registerRoute("get", "/api/triggers", getTriggers);
  registerRoute("post", "/api/execDML", execDML);
  registerRoute("post", "/api/execCreateDoc", execCreateDoc);
  registerRoute("get", "/api/getDoc", getDoc);
  // Removed: /api/server/queries - obsolete with database-driven eventTypes
  registerRoute("post", "/api/studio/genFields", genFields);

  // Context operations
  registerRoute("get", "/api/getVal", getVal);
  registerRoute("post", "/api/setVals", setVals);
  registerRoute("post", "/api/clearVals", clearVals);

  // Impact logging for Claude/Kiro coordination
  registerRoute("post", "/api/logImpact", logImpactController);
  registerRoute("get", "/api/impacts/recent", getRecentImpacts);
  registerRoute("get", "/api/impacts/batch/:batchId", getBatchImpacts);

  // Template cloning workflow
  registerRoute("post", "/api/cloneStep", cloneStep);

  // Removed Studio Discovery APIs - replaced with database queries:
  // - /api/studio/apps -> SELECT FROM api_wf.app
  // - /api/studio/pages -> SELECT FROM eventType_xref WHERE eventType=page
  // - /api/studio/templates -> SELECT FROM api_wf.eventType
  // - /api/studio/structure -> use vw_hier_components
  // - /api/studio/eventTypes -> use vw_hier_components
  registerRoute("get", "/api/studio/genPageConfig", genPageConfigController);
  registerRoute("post", "/api/genPageConfig", genPageConfigController);
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
  registerRoute("post", "/api/util/run-migration", runMigration);
  registerRoute("get", "/api/util/migration-status", getMigrationStatus);
  registerRoute("post", "/api/util/open-terminal", openTerminal);
  registerRoute("post", "/api/auth/login", userLogin);
  // Removed: /api/util/event-types-status - no longer needed with database-driven system

  // GitHub integration routes
  registerRoute("get", "/api/github/labels", githubController.getLabels);
  registerRoute("get", "/api/github/issues", githubController.listIssues);
  registerRoute("post", "/api/github/issues", githubController.createIssue);
  registerRoute(
    "get",
    "/api/github/issues/:issue_number/comments",
    githubController.getIssueComments
  );
  registerRoute(
    "post",
    "/api/github/upload-image",
    githubController.uploadImage
  );

  // Log registered routes
  logger.info(`${codeName} Routes registered:`, routes);
  logger.info(`${codeName} Routes setup complete`);

  return router; // Return the router so it can be mounted
};

export default registerRoutes;
