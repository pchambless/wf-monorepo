import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  rateLimiter,
  authRateLimiter,
  securityHeaders,
  corsOptions
} from './middleware/security.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import userLogin from './controller/userLogin.js';
import execEvent from './controller/execEvent.js';
const codeName = `[app.js] `;

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(securityHeaders); // Apply security headers
app.use(rateLimiter); // Apply general rate limiting
app.use('/api/auth/login', authRateLimiter); // Apply stricter rate limiting to login

// Configure morgan to skip certain requests and only log API calls
morgan.token('custom-status', (req, res) => {
  const status = res.statusCode;
  const color = status >= 500 ? 'red' : status >= 400 ? 'yellow' : 'green';
  return `\x1b[${color}m${status}\x1b[0m`;
});

// Custom morgan format - only log API calls and errors
app.use(morgan(':method :url :custom-status :response-time ms', {
  skip: (req) => {
    return req.path === '/favicon.ico' || 
           req.path === '/health' || 
           !req.path.startsWith('/api/') || 
           req.path === '/api/health';
  }
}));

// CORS and parsing middleware
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payload size

// Add parsing error handling
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        logger.error(`${codeName} JSON parsing error:`, err);
        return res.status(400).json({ 
            error: 'Bad Request',
            message: 'Invalid JSON payload'
        });
    }
    next(err);
});

// Serve static files if they exist
app.use(express.static(path.join(__dirname, 'public')));

logger.info(`${codeName} Application initialized`);

// Request performance monitoring middleware
app.use((req, res, next) => {
  const start = process.hrtime();

  // Override res.end to measure response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;

    // Only log performance metrics for API requests
    if (req.path.startsWith('/api') && 
        !req.path.includes('health')) {
      logger.info(`${codeName} Response: ${req.method} ${req.path} ${res.statusCode} (${Math.round(duration)}ms)`);
      
      // Only log detailed metrics for slow responses or errors
      if (duration > 500 || res.statusCode >= 400) {
        logger.logPerformance('http_request', duration, {
          method: req.method,
          path: req.path,
          status: res.statusCode
        });
      }
    }

    originalEnd.apply(res, args);
  };

  next();
});

// Request logging middleware
app.use((req, res, next) => {
  // Only log essential information
  const logData = {
    method: req.method,
    path: req.path
  };

  // Only include sanitized query parameters if they exist
  if (Object.keys(req.query).length > 0) {
    logData.query = logger.sanitizeLogData(req.query);
  }

  // Only log content-type header - the rest is browser noise
  if (req.get('content-type')) {
    logData.contentType = req.get('content-type');
  }

  // If body exists, log sanitized version with minimal details
  if (req.body && Object.keys(req.body).length > 0) {
    // For API calls, log just the event type but not all parameters
    if (req.body.eventType) {
      logData.eventType = req.body.eventType;
    } else {
      // For other endpoints, log sanitized body
      logData.body = logger.sanitizeLogData(req.body);
    }
  }

  // Use debug level instead of http for less important logs
  const logLevel = req.path.includes('health') ? 'debug' : 'http';
  logger[logLevel](`${codeName} Request`, logData);
  next();
});

// No more port-based email injection - Gateway handles authentication via sessions

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route handler
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'WhatsNew API Server',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: '/api/auth/login'
      },
      events: {
        execute: '/api/execEvent'
      },
      status: {
        health: '/health',
        database: '/api/status/database'
      }
    }
  });
});

// API routes are registered in registerRoutes.js
// Do not register routes here to avoid duplicates

// Error handling middleware
app.use(errorHandler);

export {
  app,
  port
};

// Note: 404 handler will be registered after routes in server.js
