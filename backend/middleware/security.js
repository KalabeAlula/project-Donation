/**
 * Security middleware configuration
 * Implements various security best practices
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const config = require('../config/config');

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW_MS || 15) * 60 * 1000, // Default: 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // Default: 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later',
});

// Apply security middleware to Express app
const applySecurityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());
  
  // Parse cookies
  app.use(cookieParser());
  
  // Rate limiting
  app.use('/api/', limiter);
  
  // Data sanitization against NoSQL query injection - only for body and params
  app.use((req, res, next) => {
    if (req.body) {
      req.body = mongoSanitize.sanitize(req.body);
    }
    if (req.params) {
      req.params = mongoSanitize.sanitize(req.params);
    }
    next();
  });
  
  // Data sanitization against XSS - only for body and params
  app.use((req, res, next) => {
    if (req.body) {
      // Apply XSS filtering to each string in the body
      const filterXSS = (obj) => {
        if (!obj) return obj;
        if (typeof obj === 'string') {
          return xss.filterXSS(obj);
        }
        if (typeof obj === 'object') {
          Object.keys(obj).forEach(key => {
            obj[key] = filterXSS(obj[key]);
          });
        }
        return obj;
      };
      req.body = filterXSS(req.body);
    }
    next();
  });
  
  // Prevent parameter pollution
  app.use(hpp({
    whitelist: [
      'amount', // Allow duplicate amount parameters for donation filtering
      'date',   // Allow duplicate date parameters for filtering
    ]
  }));
  
  // Add security headers for production
  if (config.app.env === 'production') {
    // Set strict Content Security Policy in production
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          scriptSrc: ["'self'", 'https://trusted-cdn.com'],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", `${config.urls.frontend}`],
        },
      })
    );
    
    // Use secure cookies in production
    app.set('trust proxy', 1); // Trust first proxy
  }
};

module.exports = applySecurityMiddleware;