import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  registerUser, 
  loginUser, 
  refreshTokens, 
  logoutUser,
  RegisterData,
  LoginData 
} from '../services/authService';
import { authenticateToken, xssProtection, validateInput } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

// Zod schemas for validation
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return JWT tokens
// @access  Public
router.post('/login', 
  xssProtection,
  validateInput(loginSchema),
  async (req: express.Request, res: express.Response) => {
    try {
      const { email, password }: LoginData = req.body;

      const result = await loginUser({ email, password });

      res.json({
        success: true,
        user: result.user,
        tokens: result.tokens
      });

    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Server error during login'
      });
    }
  }
);

// @route   POST /api/auth/register
// @desc    Register new user and return JWT tokens
// @access  Public
router.post('/register', 
  xssProtection,
  validateInput(registerSchema),
  async (req: express.Request, res: express.Response) => {
    try {
      const { username, email, password, firstName, lastName }: RegisterData = req.body;

      const result = await registerUser({
        username,
        email,
        password,
        firstName,
        lastName
      });

      res.status(201).json({
        success: true,
        user: result.user,
        tokens: result.tokens,
        message: 'Registration successful'
      });

    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message.includes('Email already registered') || 
          error.message.includes('Username already taken') ||
          error.message.includes('Invalid email format') ||
          error.message.includes('Password validation failed')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Server error during registration'
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private
router.get('/me', 
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const authReq = req as any;
      res.json({
        success: true,
        user: authReq.user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post('/refresh',
  validateInput(refreshTokenSchema),
  async (req: express.Request, res: express.Response) => {
    try {
      const { refreshToken } = req.body;

      const tokens = await refreshTokens(refreshToken);

      res.json({
        success: true,
        tokens
      });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user and revoke refresh token
// @access  Private
router.post('/logout',
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const authReq = req as any;
      await logoutUser(authReq.user.id);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during logout'
      });
    }
  }
);

export default router;
