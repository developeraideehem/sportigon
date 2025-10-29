import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sportigon Backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API is working!',
    data: {
      sports: ['Football', 'Basketball', 'Tennis'],
      features: ['Live Scores', 'Social Feed', 'Messaging']
    }
  });
});

// Users endpoint
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    users: [
      {
        id: '1',
        username: 'sportsfan2024',
        name: 'Sports Fan',
        avatar: '/avatars/default.jpg'
      }
    ]
  });
});

// Feed endpoint
app.get('/api/feed', (req, res) => {
  res.json({
    success: true,
    posts: [
      {
        id: '1',
        content: 'Excited for the big game tonight! 🏆',
        author: 'sportsfan2024',
        timestamp: new Date().toISOString(),
        likes: 42
      }
    ]
  });
});

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Sportigon server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`📱 Feed: http://localhost:${PORT}/api/feed`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully');
  process.exit(0);
});