import express from 'express';

const router = express.Router();

// @route   GET /api/feed
// @desc    Get user feed
// @access  Private
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    // TODO: Implement getting user feed
    res.json({
      success: true,
      posts: [
        {
          id: '1',
          content: 'Welcome to Sportigon! 🏆',
          author: 'testuser',
          timestamp: new Date().toISOString(),
        }
      ],
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;