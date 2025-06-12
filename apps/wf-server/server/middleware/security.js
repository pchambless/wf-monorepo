const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const codeName = '[security.js]';

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 400, // Increase the limit to 200 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Create specific limiters for sensitive routes
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 10, // Increase the limit to 10 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after an hour'
});

// Security headers configuration using helmet
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.whatsfresh.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false, // Modify based on your needs
    crossOriginResourcePolicy: { policy: "cross-origin" }
};

// Export middleware functions
module.exports = {
    // General rate limiter
    rateLimiter: limiter,
    
    // Authentication rate limiter
    authRateLimiter: authLimiter,
    
    // Security headers
    securityHeaders: helmet(helmetConfig),
    
    // CORS configuration
    corsOptions: {
        origin: ['http://localhost:3000', 
          'https://crisp-sharply-mutt.ngrok-free.app', 
          'https://wf.new.whatsfresh.app'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400 // 24 hours
    }
};
