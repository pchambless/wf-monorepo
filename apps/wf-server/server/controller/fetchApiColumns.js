require('module-alias/register');
const fs = require('fs').promises;
const path = require('path');
const { executeQuery } = require('@utils/dbUtils'); // Assuming executeQuery is a function to run SQL queries
const logger = require('@utils/logger');
const codeName = '[fetchApiColumns.js]';

// Function to generate apiColumns file by running a direct SQL query
const genApiColumnFile = async (connection) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM api_wf.apiColumns');
    logger.info(`${codeName} API columns loaded from database`, { count: rows.length });

    const apiColumnsPath = path.join(__dirname, '../middleware/apiColumns.js');
    const fileContent = `module.exports = ${JSON.stringify(rows, null, 2)};`;

    await fs.writeFile(apiColumnsPath, fileContent, 'utf8');
    logger.info(`${codeName} apiColumns.js file generated successfully`);

    return rows;
  } catch (error) {
    logger.error(`${codeName} Error generating apiColumns.js:`, error);
    throw error;
  }
};

// Function to fetch apiColumns from the file
const fetchApiColumns = async (req, res) => {
  try {
    const connection = global.pool;
    const apiColumns = await genApiColumnFile(connection);
    
    logger.debug(`${codeName} Fetched API columns`, { count: apiColumns.length });
    res.json({
      success: true,
      data: apiColumns
    });
  } catch (error) {
    logger.error(`${codeName} Error fetching API columns:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API columns',
      error: error.message
    });
  }
};

module.exports = { genApiColumnFile, fetchApiColumns };
