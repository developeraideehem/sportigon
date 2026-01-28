# Sportigon Backend Setup Guide

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Docker** (optional, for containerized development)

### Database Setup Options

#### Option 1: Local Development (Recommended)
1. **PostgreSQL**: Install locally or use Docker
2. **MongoDB**: Install locally or use Docker  
3. **Redis**: Install locally or use Docker

#### Option 2: Cloud Services
1. **Supabase**: For PostgreSQL (already configured)
2. **MongoDB Atlas**: Cloud MongoDB
3. **Redis Cloud**: Cloud Redis

#### Option 3: Docker Compose (Easiest)
Use the provided `docker-compose.yml` to run all databases locally.

## Quick Start with Docker

### 1. Start Databases
```bash
cd sportigon/backend
docker-compose up -d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
```bash
cp .env.example .env
```

### 4. Run Database Migrations
```bash
# Apply the users table migration
psql -h localhost -U postgres -d sportigon_sports -f src/database/migrations/001_create_users_table.sql
```

### 5. Start Development Server
```bash
npm run dev
```

## Manual Database Setup

### PostgreSQL Setup
1. Install PostgreSQL locally or use cloud service
2. Create database:
```sql
CREATE DATABASE sportigon_sports;
```
3. Run migration:
```sql
\i src/database/migrations/001_create_users_table.sql
```

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. No initial schema required - MongoDB is schemaless

### Redis Setup
1. Install Redis locally or use Redis Cloud
2. Default configuration works for development

## Environment Configuration

Update `.env` file with your actual values:

### Required Configuration
```env
# JWT Secrets (generate strong secrets)
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here

# Database Connections
POSTGRES_URI=postgresql://postgres:password@localhost:5432/sportigon_sports
MONGODB_URI=mongodb://localhost:27017/sportigon
REDIS_URI=redis://localhost:6379
```

### Optional Configuration
```env
# Sports API Keys (for live scores)
RAPIDAPI_KEY=your-rapidapi-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## API Testing

### Test Authentication Endpoints

1. **Register User**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

2. **Login User**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

3. **Get Current User**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Sample Endpoints

1. **Health Check**
```bash
curl http://localhost:3001/api/health
```

2. **Test Endpoint**
```bash
curl http://localhost:3001/api/test
```

## Sample Users

The migration includes two sample users:

### Admin User
- **Email**: admin@sportigon.com
- **Password**: Admin123!
- **Role**: admin

### Regular User  
- **Email**: user@sportigon.com
- **Password**: User123!
- **Role**: user

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Security Features Implemented

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Refresh token rotation
- ✅ Role-based access control
- ✅ Password hashing with bcrypt
- ✅ Session management with Redis

### Security Headers
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ XSS protection
- ✅ Input validation with Zod

### Database Security
- ✅ SQL injection prevention
- ✅ Parameterized queries
- ✅ Input sanitization
- ✅ Password strength validation

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Health & Test Endpoints
- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL/MongoDB/Redis are running
   - Verify connection strings in `.env`
   - Ensure ports are not blocked

2. **JWT Errors**
   - Verify JWT secrets are set in `.env`
   - Check token expiration times

3. **Port Already in Use**
   - Change `PORT` in `.env`
   - Kill process using port: `npx kill-port 3001`

### Logs
Check console output for detailed error messages and connection status.

## Next Steps

After successful setup:
1. Test authentication endpoints
2. Implement user profile management
3. Add social feed features
4. Integrate sports data APIs
5. Set up real-time messaging

## Support

For issues:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Ensure environment variables are set correctly
4. Check database connections

---
**Status**: ✅ Backend security and authentication system complete
**Next Phase**: User Management & Profiles
