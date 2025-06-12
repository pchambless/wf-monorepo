// This must be the very first line
const moduleAlias = require('module-alias');

// Register aliases based on the actual root directory
moduleAlias.addAliases({
  '@root': __dirname,
  '@utils': __dirname + '/utils',
  '@routes': __dirname + '/routes',
  '@controller': __dirname + '/controller',
  '@services': __dirname + '/services', 
  '@models': __dirname + '/models',
  '@middleware': __dirname + '/middleware',
  '@shared-config': '../../packages/shared-config'
});

// Then other imports
require('dotenv').config();
const { app } = require('./app');
const logger = require('@utils/logger');
const initializeRoutes = require('@routes/index');
const { genApiColumnFile } = require('@controller/fetchApiColumns');
const dbManager = require('@utils/dbManager');
const codeName = '[server.js]';

// Simple test route to verify routing
app.get('/test-route', (req, res) => {
  res.send('Test route is working!');
});

async function startServer() {
    try {
        // Initialize database connection
        const pool = await dbManager.initialize();
        global.pool = pool;

        const port = process.env.PORT || 3001;

        // Check if running under nodemon
        if (process.env.NODE_ENV === 'development' && process.env.NODEMON) {
            logger.info(`${codeName} Running under nodemon, avoiding duplicate start`);
            return;
        }

        // Add database status endpoint
        app.get('/api/status/database', (req, res) => {
            res.json(dbManager.getStatus());
        });

        // Initialize routes before starting the server
        logger.info(`${codeName} Initializing routes`);
        initializeRoutes(app);
        logger.info(`${codeName} Routes initialized`);

        // Generate necessary files
        await dbManager.executeWithRetry(async () => {
            // Remove genEventTypeFile call - we're now using shared-events package
            console.log('Using event types from shared-events package');
            await genApiColumnFile(pool);
        });

        // Handle 404 - Register after all routes
        app.use((req, res) => {
            // Don't log 404s for favicon.ico
            if (req.path !== '/favicon.ico') {
                logger.warn(`${codeName} Route not found: ${req.method} ${req.path}`);
            }
            
            // Send a more helpful 404 response
            res.status(404).json({
                status: 'error',
                message: 'Route not found',
                availableEndpoints: {
                    auth: {
                        login: '/api/auth/login'
                    },
                    events: {
                        execute: '/api/execEventType'
                    },
                    status: {
                        health: '/health',
                        database: '/api/status/database'
                    }
                },
                documentation: 'Visit / for API documentation'
            });
        });

        logger.info(`${codeName} Starting server on port ${port}`);
        const server = app.listen(port, () => {
            logger.info(`${codeName} Server is running on http://localhost:${port}`);
        });

        // Configure keep-alive
        server.keepAliveTimeout = 5000; // 5 seconds
        server.headersTimeout = 6000; // 6 seconds (should be greater than keepAliveTimeout)
        logger.info(`${codeName} Server timeouts configured: keepAlive=5s, headers=6s`);

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.info(`${codeName} SIGTERM received, shutting down gracefully`);
            await dbManager.end();
            logger.info(`${codeName} Database connections closed`);
            server.close(() => {
                logger.info(`${codeName} Server closed`);
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error(`${codeName} Error starting server:`, error);
        process.exit(1);
    }
}

startServer();
