/**
 * Test script for enhanced genPageConfig
 */

import { genPageConfig } from './server/utils/pageConfig/index.js';
import logger from './server/utils/logger.js';

const codeName = '[test-genPageConfig.js]';

async function testGenPageConfig() {
  try {
    logger.info(`${codeName} Testing genPageConfig with login page (ID: 41)`);

    const result = await genPageConfig(41);

    logger.info(`${codeName} Generated pageConfig:`, JSON.stringify(result.pageConfig, null, 2));
    logger.info(`${codeName} Meta info:`, result.meta);

  } catch (error) {
    logger.error(`${codeName} Test failed:`, error);
  }
}

testGenPageConfig();