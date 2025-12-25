import rateLimit from "express-rate-limit";
import helmet from "helmet";

const codeName = "[security.js]";

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 400, // Increase the limit to 200 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Create specific limiters for sensitive routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10, // Increase the limit to 10 requests per windowMs
  message:
    "Too many login attempts from this IP, please try again after an hour",
});

// Security headers configuration using helmet
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],  // Allow HTMX from CDN
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.whatsfresh.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Modify based on your needs
  crossOriginResourcePolicy: { policy: "cross-origin" },
};

// Export middleware functions
export { limiter as rateLimiter, authLimiter as authRateLimiter };

export const securityHeaders = helmet(helmetConfig);

export const corsOptions = {
  origin: [
    "http://localhost:3000", // wf-client app
    "http://localhost:3004", // wf-studio app (Studio)
    "http://localhost:3006", // wf-adming app (Admin)
    "http://localhost:3005", // wf-login app
    "http://localhost:1420", // wf-order-management app (Studio)
    "https://crisp-sharply-mutt.ngrok-free.app",
    "https://wf.new.whatsfresh.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
};
