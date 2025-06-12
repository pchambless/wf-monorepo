require('module-alias/register');
const mysql = require('mysql2/promise');
const dbConfig = require('@utils/dbConfig'); // Ensure correct path

(async () => {
  try {
    // Create the connection using the correct configuration
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      port: dbConfig.port,
      charset: dbConfig.charset
    });

    console.log(`[Test Connection] Connected successfully`);
    const query = `SELECT name, description, id FROM ingredient_types WHERE account_id = 1 AND active = "Y" ORDER BY name`;
    const [rows] = await connection.execute(query);
    console.log(`[Test Connection] Query executed, rows fetched:`, rows.length);

    connection.end();
  } catch (error) {
    console.error(`[Test Connection] Error:`, error.message);
  }
})();
