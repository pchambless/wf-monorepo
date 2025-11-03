import logger from '../utils/logger.js';
import * as sessionManager from '../utils/cloneTemplate/sessionManager.js';
import { loadHierarchy } from '../utils/cloneTemplate/steps/loadHierarchy.js';
import { cloneComponents } from '../utils/cloneTemplate/steps/cloneComponents.js';
import { cloneProps } from '../utils/cloneTemplate/steps/cloneProps.js';
import { cloneEventSQL } from '../utils/cloneTemplate/steps/cloneEventSQL.js';
import { cloneTriggers } from '../utils/cloneTemplate/steps/cloneTriggers.js';

const codeName = '[cloneStep.js]';

/**
 * Clone Step API Handler
 * Executes individual steps of the template cloning workflow with incremental commits
 *
 * Body params:
 * - sessionID: string (optional) - Session identifier (omit to create new session)
 * - step: string (required) - Step name: 'hierarchy' | 'components' | 'props' | 'eventSQL' | 'triggers'
 * - templateID: number (required for new session) - Template page ID
 * - targetID: number (required for new session) - Target page ID
 *
 * Step Order (IMPORTANT):
 * 1. hierarchy - Load template structure (no commit)
 * 2. components - Clone & commit to eventComp_xref
 * 3. props - Clone & commit to eventProps
 * 4. eventSQL - Clone & commit to eventSQL (BEFORE triggers)
 * 5. triggers - Clone & commit to eventTrigger (references eventSQL qryName)
 *
 * Each step (except hierarchy) commits immediately after staging.
 * This prevents duplicate key errors and allows verification after each step.
 */
const cloneStep = async (req, res) => {
  logger.http(`${codeName} ${req.method} ${req.originalUrl}`);

  try {
    const { sessionID, step, templateID, targetID } = req.body;

    // Validate required params
    if (!step) {
      return res.status(400).json({
        error: 'MISSING_STEP',
        message: 'Step parameter is required'
      });
    }

    let session;

    // If no sessionID, create new session
    if (!sessionID) {
      if (!templateID || !targetID) {
        return res.status(400).json({
          error: 'MISSING_PARAMS',
          message: 'templateID and targetID required for new session'
        });
      }

      const newSessionID = await sessionManager.createSession(templateID, targetID, 'claude');
      session = await sessionManager.loadSession(newSessionID);
      logger.info(`${codeName} Created new session: ${newSessionID}`);
    } else {
      session = await sessionManager.loadSession(sessionID);
      logger.info(`${codeName} Loaded existing session: ${sessionID}`);
    }

    // Execute the requested step
    let result;
    switch (step) {
      case 'hierarchy':
        result = await loadHierarchy(session);
        break;
      case 'components':
        result = await cloneComponents(session);
        break;
      case 'props':
        result = await cloneProps(session);
        break;
      case 'eventSQL':
        result = await cloneEventSQL(session);
        break;
      case 'triggers':
        result = await cloneTriggers(session);
        break;
      default:
        return res.status(400).json({
          error: 'INVALID_STEP',
          message: `Unknown step: ${step}. Valid steps: hierarchy, components, props, eventSQL, triggers`
        });
    }

    logger.info(`${codeName} Step '${step}' completed successfully`);
    res.json({
      success: true,
      sessionID: session.session_id,
      step,
      result
    });

  } catch (error) {
    logger.error(`${codeName} Clone step failed:`, error);

    const status = error.status || 500;
    res.status(status).json({
      error: error.code || 'CLONE_STEP_FAILED',
      message: error.message,
      ...(error.details && { details: error.details })
    });
  }
};

export default cloneStep;
