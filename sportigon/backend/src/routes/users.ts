import express from 'express';
import { z } from 'zod';
import {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  getUserByUsername,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  isFollowing,
  getUserStats,
  UpdateProfileData
} from '../services/userService';
import { authenticateToken, optionalAuth, validateInput, xssProtection } from '../middleware/auth';

const router = express.Router();

// Zod schemas for validation
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  favoriteSports: z.array(z.string()).max(10).optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

const searchUsersSchema = z.object({
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0)
});

const followUserSchema = z.object({
  userId: z.string().uuid()
});

// @route   GET /api/users
// @desc    Search users by query
// @access  Private
router.get('/',
  authenticateToken,
  validateInput(searchUsersSchema),
  async (req: express.Request, res: express.Response) => {
    try {
      const { query, limit, offset } = req.query;
      
      const users = await searchUsers(
        query as string,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        users,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: users.length
        }
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during user search'
      });
    }
  }
);

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Private
router.get('/profile/:id',
  optionalAuth,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const authReq = req as any;

      const userProfile = await getUserProfile(id);
      
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if current user is following this user
      let isFollowingUser = false;
      if (authReq.user) {
        isFollowingUser = await isFollowing(authReq.user.id, id);
      }

      // Get user statistics
      const stats = await getUserStats(id);

      res.json({
        success: true,
        user: {
          ...userProfile,
          isFollowing: isFollowingUser
        },
        stats
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
);

// @route   GET /api/users/username/:username
// @desc    Get user profile by username
// @access  Private
router.get('/username/:username',
  optionalAuth,
  async (req: express.Request, res: express.Response) => {
    try {
      const { username } = req.params;
      const authReq = req as any;

      const userProfile = await getUserByUsername(username);
      
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if current user is following this user
      let isFollowingUser = false;
      if (authReq.user) {
        isFollowingUser = await isFollowing(authReq.user.id, userProfile.id);
      }

      // Get user statistics
      const stats = await getUserStats(userProfile.id);

      res.json({
        success: true,
        user: {
          ...userProfile,
          isFollowing: isFollowingUser
        },
        stats
      });
    } catch (error) {
      console.error('Get user by username error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
);

// @route   PUT /api/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile',
  authenticateToken,
  xssProtection,
  validateInput(updateProfileSchema),
  async (req: express.Request, res: express.Response) => {
    try {
      const authReq = req as any;
      const updates: UpdateProfileData = req.body;

      const updatedProfile = await updateUserProfile(authReq.user.id, updates);

      res.json({
        success: true,
        user: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Server error during profile update'
      });
    }
  }
);

// @route   POST /api/users/follow/:userId
// @desc    Follow a user
// @access  Private
router.post('/follow/:userId',
  authenticateToken,
  validateInput(followUserSchema),
  async (req: express.Request, res: express.Response) => {
    try {
      const authReq = req as any;
      const { userId } = req.params;

      await followUser(authReq.user.id, userId);

      res.json({
        success: true,
        message: 'User followed successfully'
      });
    } catch (error: any) {
      console.error('Follow user error:', error);
      
      if (error.message === 'Cannot follow yourself') {
        return res.status(400).json({
          success: false,
          error: 'Cannot follow yourself'
        });
      }

      if (error.message === 'Already following this user') {
        return res.status(400).json({
          success: false,
          error: 'Already following this user'
        });
      }

      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Server error during follow operation'
      });
    }
  }
);

// @route   POST /api/users/unfollow/:userId
// @desc    Unfollow a user
// @access  Private
router.post('/unfollow/:userId',
  authenticateToken,
  validateInput(followUserSchema),
  async (req: express.Request, res: express.Response) => {
    try {
      const authReq = req as any;
      const { userId } = req.params;

      await unfollowUser(authReq.user.id, userId);

      res.json({
        success: true,
        message: 'User unfollowed successfully'
      });
    } catch (error: any) {
      console.error('Unfollow user error:', error);
      
      if (error.message === 'Not following this user') {
        return res.status(400).json({
          success: false,
          error: 'Not following this user'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Server error during unfollow operation'
      });
    }
  }
);

// @route   GET /api/users/:userId/followers
// @desc    Get user's followers
// @access  Private
router.get('/:userId/followers',
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const { userId } = req.params;
      const { limit = '50', offset = '0' } = req.query;

      const followers = await getUserFollowers(
        userId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        followers,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: followers.length
        }
      });
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
);

// @route   GET /api/users/:userId/following
// @desc    Get users that a user is following
// @access  Private
router.get('/:userId/following',
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const { userId } = req.params;
      const { limit = '50', offset = '0' } = req.query;

      const following = await getUserFollowing(
        userId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        following,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: following.length
        }
      });
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
);

// @route   GET /api/users/:userId/stats
// @desc    Get user statistics
// @access  Private
router.get('/:userId/stats',
  authenticateToken,
  async (req: express.Request, res: express.Response) => {
    try {
      const { userId } = req.params;

      const stats = await getUserStats(userId);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  }
);

export default router;
