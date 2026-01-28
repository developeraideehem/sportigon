import { getPostgresPool } from '../config/postgresql';
import { getRedisClient } from '../config/redis';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  favoriteSports?: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  favoriteSports?: string[];
  avatarUrl?: string;
}

export interface UserRelationship {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface UserSearchResult {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  isFollowing?: boolean;
  followerCount: number;
  followingCount: number;
}

// Cache user profiles in Redis for 15 minutes
const USER_CACHE_TTL = 15 * 60; // 15 minutes in seconds

// Get user profile by ID with Redis caching
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const redisClient = getRedisClient();
  const cacheKey = `user:${userId}`;
  
  // Try to get from cache first
  try {
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
  } catch (error) {
    console.warn('Redis cache read failed, falling back to database:', error);
  }
  
  // Get from database
  const pool = getPostgresPool();
  const result = await pool.query(
    `SELECT id, email, username, first_name, last_name, role, 
            avatar_url, bio, favorite_sports, last_login, created_at, updated_at
     FROM profiles WHERE id = $1`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const user = result.rows[0];
  const userProfile: UserProfile = {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    favoriteSports: user.favorite_sports,
    lastLogin: user.last_login,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
  
  // Cache the user profile
  try {
    await redisClient.set(cacheKey, JSON.stringify(userProfile), {
      EX: USER_CACHE_TTL
    });
  } catch (error) {
    console.warn('Redis cache write failed:', error);
  }
  
  return userProfile;
};

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  updates: UpdateProfileData
): Promise<UserProfile> => {
  const pool = getPostgresPool();
  
  const allowedFields = ['first_name', 'last_name', 'bio', 'favorite_sports', 'avatar_url'];
  const setClause: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  Object.entries(updates).forEach(([key, value]) => {
    const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbKey) && value !== undefined) {
      setClause.push(`${dbKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });
  
  if (setClause.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  setClause.push(`updated_at = $${paramCount}`);
  values.push(new Date());
  values.push(userId);
  
  const result = await pool.query(
    `UPDATE profiles 
     SET ${setClause.join(', ')} 
     WHERE id = $${paramCount + 1}
     RETURNING id, email, username, first_name, last_name, role, 
               avatar_url, bio, favorite_sports, last_login, created_at, updated_at`,
    values
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  const user = result.rows[0];
  const userProfile: UserProfile = {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    favoriteSports: user.favorite_sports,
    lastLogin: user.last_login,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
  
  // Invalidate cache
  const redisClient = getRedisClient();
  try {
    await redisClient.del(`user:${userId}`);
  } catch (error) {
    console.warn('Redis cache deletion failed:', error);
  }
  
  return userProfile;
};

// Search users by username, first name, or last name
export const searchUsers = async (
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<UserSearchResult[]> => {
  const pool = getPostgresPool();
  
  const searchQuery = `%${query}%`;
  const result = await pool.query(
    `SELECT 
      p.id, p.username, p.first_name, p.last_name, p.avatar_url, p.bio,
      COUNT(DISTINCT f1.follower_id) as follower_count,
      COUNT(DISTINCT f2.following_id) as following_count
     FROM profiles p
     LEFT JOIN follows f1 ON p.id = f1.following_id
     LEFT JOIN follows f2 ON p.id = f2.follower_id
     WHERE p.username ILIKE $1 OR p.first_name ILIKE $1 OR p.last_name ILIKE $1
     GROUP BY p.id, p.username, p.first_name, p.last_name, p.avatar_url, p.bio
     ORDER BY 
       CASE 
         WHEN p.username ILIKE $1 THEN 1
         WHEN p.first_name ILIKE $1 THEN 2
         ELSE 3
       END,
       follower_count DESC
     LIMIT $2 OFFSET $3`,
    [searchQuery, limit, offset]
  );
  
  return result.rows.map(row => ({
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    followerCount: parseInt(row.follower_count) || 0,
    followingCount: parseInt(row.following_count) || 0
  }));
};

// Get user by username
export const getUserByUsername = async (username: string): Promise<UserProfile | null> => {
  const pool = getPostgresPool();
  const result = await pool.query(
    `SELECT id, email, username, first_name, last_name, role, 
            avatar_url, bio, favorite_sports, last_login, created_at, updated_at
     FROM profiles WHERE username = $1`,
    [username.toLowerCase()]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const user = result.rows[0];
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    favoriteSports: user.favorite_sports,
    lastLogin: user.last_login,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
};

// Follow a user
export const followUser = async (followerId: string, followingId: string): Promise<void> => {
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }
  
  const pool = getPostgresPool();
  
  // Check if already following
  const existing = await pool.query(
    'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
    [followerId, followingId]
  );
  
  if (existing.rows.length > 0) {
    throw new Error('Already following this user');
  }
  
  // Check if target user exists
  const targetUser = await pool.query('SELECT 1 FROM profiles WHERE id = $1', [followingId]);
  if (targetUser.rows.length === 0) {
    throw new Error('User not found');
  }
  
  await pool.query(
    'INSERT INTO follows (follower_id, following_id, created_at) VALUES ($1, $2, $3)',
    [followerId, followingId, new Date()]
  );
  
  // Invalidate cache for both users
  const redisClient = getRedisClient();
  try {
    await redisClient.del(`user:${followerId}`);
    await redisClient.del(`user:${followingId}`);
    await redisClient.del(`followers:${followingId}`);
    await redisClient.del(`following:${followerId}`);
  } catch (error) {
    console.warn('Redis cache deletion failed:', error);
  }
};

// Unfollow a user
export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
  const pool = getPostgresPool();
  
  const result = await pool.query(
    'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
    [followerId, followingId]
  );
  
  if (result.rowCount === 0) {
    throw new Error('Not following this user');
  }
  
  // Invalidate cache for both users
  const redisClient = getRedisClient();
  try {
    await redisClient.del(`user:${followerId}`);
    await redisClient.del(`user:${followingId}`);
    await redisClient.del(`followers:${followingId}`);
    await redisClient.del(`following:${followerId}`);
  } catch (error) {
    console.warn('Redis cache deletion failed:', error);
  }
};

// Get followers of a user
export const getUserFollowers = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<UserSearchResult[]> => {
  const redisClient = getRedisClient();
  const cacheKey = `followers:${userId}`;
  
  // Try cache first
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Redis cache read failed:', error);
  }
  
  const pool = getPostgresPool();
  const result = await pool.query(
    `SELECT 
      p.id, p.username, p.first_name, p.last_name, p.avatar_url, p.bio,
      COUNT(DISTINCT f1.follower_id) as follower_count,
      COUNT(DISTINCT f2.following_id) as following_count
     FROM follows f
     JOIN profiles p ON f.follower_id = p.id
     LEFT JOIN follows f1 ON p.id = f1.following_id
     LEFT JOIN follows f2 ON p.id = f2.follower_id
     WHERE f.following_id = $1
     GROUP BY p.id, p.username, p.first_name, p.last_name, p.avatar_url, p.bio
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  
  const followers = result.rows.map(row => ({
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    followerCount: parseInt(row.follower_count) || 0,
    followingCount: parseInt(row.following_count) || 0
  }));
  
  // Cache the result for 5 minutes
  try {
    await redisClient.set(cacheKey, JSON.stringify(followers), {
      EX: 5 * 60 // 5 minutes
    });
  } catch (error) {
    console.warn('Redis cache write failed:', error);
  }
  
  return followers;
};

// Get users that a user is following
export const getUserFollowing = async (
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<UserSearchResult[]> => {
  const redisClient = getRedisClient();
  const cacheKey = `following:${userId}`;
  
  // Try cache first
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Redis cache read failed:', error);
  }
  
  const pool = getPostgresPool();
  const result = await pool.query(
    `SELECT 
      p.id, p.username, p.first_name, p.last_name, p.avatar_url, p.bio,
      COUNT(DISTINCT f1.follower_id) as follower_count,
      COUNT(DISTINCT f2.following_id) as following_count
     FROM follows f
     JOIN profiles p ON f.following_id = p.id
     LEFT JOIN follows f1 ON p.id = f1.following_id
     LEFT JOIN follows f2 ON p.id = f2.follower_id
     WHERE f.follower_id = $1
     GROUP BY p.id, p.username, p.first_name, p.last_name, p.avatar_url, p.bio
     ORDER BY f.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  
  const following = result.rows.map(row => ({
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    followerCount: parseInt(row.follower_count) || 0,
    followingCount: parseInt(row.following_count) || 0
  }));
  
  // Cache the result for 5 minutes
  try {
    await redisClient.set(cacheKey, JSON.stringify(following), {
      EX: 5 * 60 // 5 minutes
    });
  } catch (error) {
    console.warn('Redis cache write failed:', error);
  }
  
  return following;
};

// Check if user is following another user
export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const pool = getPostgresPool();
  const result = await pool.query(
    'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
    [followerId, followingId]
  );
  return result.rows.length > 0;
};

// Get user statistics
export const getUserStats = async (userId: string): Promise<{
  followerCount: number;
  followingCount: number;
  postCount: number;
}> => {
  const pool = getPostgresPool();
  
  const [followersResult, followingResult, postsResult] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM follows WHERE following_id = $1', [userId]),
    pool.query('SELECT COUNT(*) FROM follows WHERE follower_id = $1', [userId]),
    pool.query('SELECT COUNT(*) FROM posts WHERE author_id = $1', [userId])
  ]);
  
  return {
    followerCount: parseInt(followersResult.rows[0].count) || 0,
    followingCount: parseInt(followingResult.rows[0].count) || 0,
    postCount: parseInt(postsResult.rows[0].count) || 0
  };
};
