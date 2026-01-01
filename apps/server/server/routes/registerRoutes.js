import express from "express";
import execEvent from "../controller/execEvent.js";
import execDML from "../controller/execDML.js";
import { genFields } from "../controller/genFields.js";
import initializeController from "../controller/initialize.js";
import listRoutesController from "../controller/listRegisteredRoutes.js";
import restartServerController from "../controller/restartServer.js";
import githubController from "../controller/githubController.js";
import userLogin from "../controller/userLogin.js";
import getVal from "../controller/getVal.js";
import setVals from "../controller/setVals.js";
import clearVals from "../controller/clearVals.js";
import runMigration from "../controller/runMigration.js";
import getMigrationStatus from "../controller/getMigrationStatus.js";
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

  // === Core Runtime Controllers ===
  registerRoute("get", "/controller/execEvent", execEvent);  // SELECT queries only (HTMX GET)
  registerRoute("post", "/controller/execDML", execDML);     // INSERT (HTMX POST)
  registerRoute("put", "/controller/execDML", execDML);      // UPDATE (HTMX PUT)
  registerRoute("delete", "/controller/execDML", execDML);   // DELETE (HTMX DELETE)

  // === Context Store Controllers ===
  registerRoute("get", "/controller/getVal", getVal);
  registerRoute("post", "/controller/setVals", setVals);
  registerRoute("post", "/controller/clearVals", clearVals);

  // === Studio Development Controllers ===
  registerRoute("post", "/controller/studio/genFields", genFields);

  // === Application Controllers ===
  registerRoute("post", "/controller/initialize", initializeController.initialize);
  registerRoute("post", "/controller/userLogin", userLogin);
  // === Utility / Development APIs ===
  registerRoute("get", "/api/util/list-routes", (req, res) => {
    logger.debug(`${codeName} Entering /util/list-routes`);
    listRoutesController.listRoutes(app)(req, res);
  });
  registerRoute("post", "/api/util/restart-server", restartServerController.restartServer);
  registerRoute("post", "/api/util/run-migration", runMigration);
  registerRoute("get", "/api/util/migration-status", getMigrationStatus);

  // === GitHub Integration ===
  registerRoute("get", "/api/github/labels", githubController.getLabels);
  registerRoute("get", "/api/github/issues", githubController.listIssues);
  registerRoute("post", "/api/github/issues", githubController.createIssue);
  registerRoute("get", "/api/github/issues/:issue_number/comments", githubController.getIssueComments);
  registerRoute("post", "/api/github/upload-image", githubController.uploadImage);

  // Log registered routes
  logger.info(`${codeName} Routes registered:`, routes);
  logger.info(`${codeName} Routes setup complete`);

  return router; // Return the router so it can be mounted
};

export default registerRoutes;
