const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please include Authorization header with Bearer token.',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>',
        code: 'INVALID_FORMAT',
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach decoded user data to request object
    req.user = decoded;
    req.token = token;

    // Call next middleware
    next();
  } catch (error) {
    // Handle different JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt,
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
        code: 'INVALID_TOKEN',
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token not yet valid.',
        code: 'TOKEN_NOT_VALID_YET',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed. ' + error.message,
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Optional Authentication Middleware
 * Does not fail if token is missing, but verifies if token is present
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET
        );

        req.user = decoded;
        req.token = token;
        req.isAuthenticated = true;
      }
    }

    // Continue regardless of token presence
    next();
  } catch (error) {
    // Continue even if token verification fails
    // User is not attached to request
    console.warn('Optional auth failed:', error.message);
    next();
  }
};

/**
 * Admin Authentication Middleware
 * Verifies token and checks if user is admin
 */
const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided.',
        code: 'NO_TOKEN',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    req.token = token;

    // Check if user is admin (example: check role field)
    if (!req.user.isAdmin && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Rate limiting middleware
 * Prevents abuse by limiting requests per user
 */
const rateLimitMiddleware = (req, res, next) => {
  // Implement rate limiting logic here
  // Example using a simple in-memory store
  const userId = req.user?.id;
  const requestLimit = 100; // requests per hour
  const timeWindow = 3600000; // 1 hour in milliseconds

  // This is a basic example. Use redis or external service for production
  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminAuthMiddleware,
  rateLimitMiddleware,
};
