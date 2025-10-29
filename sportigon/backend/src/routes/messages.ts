import express from 'express';

const router = express.Router();

// @route   GET /api/messages
// @desc    Get user messages
// @access  Private
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    // TODO: Implement getting user messages
    res.json({
      success: true,
      messages: [
        {
          id: '1',
          from: 'testuser',
          content: 'Welcome to Sportigon!',
          timestamp: new Date().toISOString(),
        }
      ],
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;