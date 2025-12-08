import express from "express";
import execEvent from "../controller/execEvent.js";
import execDML from "../controller/execDML.js";
import execCreateDoc from "../controller/execCreateDoc.js";
import getDoc from "../controller/getDoc.js";
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
import openTerminal from "../controller/openTerminal.js";
import cloneStep from "../controller/cloneStep.js";
import populateModules from "../controller/populateModules.js";
import copilotQuery from "../controller/copilotQuery.js";
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

  // === Core Runtime APIs ===
  registerRoute("post", "/api/execEvent", execEvent);
  registerRoute("post", "/api/execDML", execDML);
  registerRoute("post", "/api/execCreateDoc", execCreateDoc);
  registerRoute("get", "/api/getDoc", getDoc);

  // === Context Store APIs ===
  registerRoute("get", "/api/getVal", getVal);
  registerRoute("post", "/api/setVals", setVals);
  registerRoute("post", "/api/clearVals", clearVals);

  // === Template Cloning ===
  registerRoute("post", "/api/cloneStep", cloneStep);

  // === System Maintenance APIs ===
  registerRoute("post", "/api/populateModules", populateModules);

  // === GitHub Copilot Query API ===
  registerRoute("post", "/api/copilot/query", copilotQuery);

  // === Studio Development APIs ===
  registerRoute("post", "/api/studio/genFields", genFields);

  // === Application APIs ===
  registerRoute("post", "/api/initialize", initializeController.initialize);
  registerRoute("post", "/api/auth/login", userLogin);
  // === Utility / Development APIs ===
  registerRoute("get", "/api/util/list-routes", (req, res) => {
    logger.debug(`${codeName} Entering /util/list-routes`);
    listRoutesController.listRoutes(app)(req, res);
  });
  registerRoute("post", "/api/util/restart-server", restartServerController.restartServer);
  registerRoute("post", "/api/util/run-migration", runMigration);
  registerRoute("get", "/api/util/migration-status", getMigrationStatus);
  registerRoute("post", "/api/util/open-terminal", openTerminal);

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
