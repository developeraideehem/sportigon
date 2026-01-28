import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const app = express();

// Import database connections
import { connectPostgreSQL } from './config/postgresql';
import { connectRedis } from './config/redis';
import { connectMongoDB } from './config/mongodb';

// Initialize database connections
(async () => {
  try {
    await connectPostgreSQL();
    await connectRedis();
    await connectMongoDB();
    console.log('✅ All database connections established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
})();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import feedRoutes from './routes/feed';
import sportsRoutes from './routes/sports';
import messagesRoutes from './routes/messages';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/sports', sportsRoutes);
app.use('/api/messages', messagesRoutes);

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
