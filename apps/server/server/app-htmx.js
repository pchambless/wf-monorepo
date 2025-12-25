// Minimal Express app for HTMX rendering

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import htmxRoutes from './routes/htmxRoutes.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/', htmxRoutes);

const PORT = process.env.HTMX_PORT || 3010;
app.listen(PORT, () => {
  logger.info(`[app-htmx.js] Server running on port ${PORT}`);
});
