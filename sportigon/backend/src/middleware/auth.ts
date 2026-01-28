import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRedisClient } from '../config/redis';
import { getPostgresPool } from '../config/postgresql';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'sportigon-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'sportigon-refresh-secret-change-in-production';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

// Generate JWT tokens
export const generateTokens = (payload: { id: string; email: string; username: string }) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  
  return { accessToken, refreshToken };
};

// Verify JWT token
export const verifyToken = (token: string, isRefresh = false): any => {
  try {
    const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Store refresh token in Redis
export const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  const redisClient = getRedisClient();
  await redisClient.set(`refresh_token:${userId}`, refreshToken, {
    EX: 7 * 24 * 60 * 60, // 7 days in seconds
  });
};

// Verify refresh token from Redis
export const verifyRefreshToken = async (userId: string, refreshToken: string): Promise<boolean> => {
  const redisClient = getRedisClient();
  const storedToken = await redisClient.get(`refresh_token:${userId}`);
  return storedToken === refreshToken;
};

// Revoke refresh token (logout)
export const revokeRefreshToken = async (userId: string): Promise<void> => {
  const redisClient = getRedisClient();
  await redisClient.del(`refresh_token:${userId}`);
};

// Authentication middleware
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = verifyToken(token) as any;
    
    // Get user from database
    const pool = getPostgresPool();
    const userResult = await pool.query(
      `SELECT id, email, username, first_name, last_name, role, avatar_url, bio, favorite_sports 
       FROM profiles WHERE id = $1`,
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role || 'user'
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token) as any;
      const pool = getPostgresPool();
      const userResult = await pool.query(
        `SELECT id, email, username, first_name, last_name, role, avatar_url, bio, favorite_sports 
         FROM profiles WHERE id = $1`,
        [decoded.id]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        req.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role || 'user'
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Rate limiting by user ID
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const redisClient = getRedisClient();
    const key = `rate_limit:${req.user.id}:${req.path}`;
    const current = await redisClient.get(key);

    if (current) {
      const requests = parseInt(current);
      if (requests >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests'
        });
      }
      await redisClient.incr(key);
    } else {
      await redisClient.set(key, '1', { EX: windowMs / 1000 });
    }

    next();
  };
};

// Input validation middleware
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};

// XSS protection middleware
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body to prevent XSS
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Basic XSS prevention - remove script tags and dangerous attributes
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '')
        .replace(/on\w+='[^']*'/g, '')
        .replace(/javascript:/gi, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  next();
};
