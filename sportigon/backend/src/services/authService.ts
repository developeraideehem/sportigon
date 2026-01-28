import bcrypt from 'bcryptjs';
import { getPostgresPool } from '../config/postgresql';
import { generateTokens, storeRefreshToken, revokeRefreshToken, verifyRefreshToken } from '../middleware/auth';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  bio?: string;
  favoriteSports?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: Omit<User, 'password'>;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Hash password with bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password with bcrypt
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Check if email already exists
export const emailExists = async (email: string): Promise<boolean> => {
  const pool = getPostgresPool();
  const result = await pool.query(
    'SELECT id FROM profiles WHERE email = $1',
    [email.toLowerCase()]
  );
  return result.rows.length > 0;
};

// Check if username already exists
export const usernameExists = async (username: string): Promise<boolean> => {
  const pool = getPostgresPool();
  const result = await pool.query(
    'SELECT id FROM profiles WHERE username = $1',
    [username.toLowerCase()]
  );
  return result.rows.length > 0;
};

// Register new user
export const registerUser = async (userData: RegisterData): Promise<AuthResponse> => {
  const pool = getPostgresPool();
  
  // Validate email
  if (!validateEmail(userData.email)) {
    throw new Error('Invalid email format');
  }
  
  // Validate password strength
  const passwordValidation = validatePassword(userData.password);
  if (!passwordValidation.valid) {
    throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
  }
  
  // Check if email already exists
  if (await emailExists(userData.email)) {
    throw new Error('Email already registered');
  }
  
  // Check if username already exists
  if (await usernameExists(userData.username)) {
    throw new Error('Username already taken');
  }
  
  // Hash password
  const hashedPassword = await hashPassword(userData.password);
  
  // Create user in database
  const result = await pool.query(
    `INSERT INTO profiles (
      email, username, password_hash, first_name, last_name, role, 
      favorite_sports, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, email, username, first_name, last_name, role, 
              avatar_url, bio, favorite_sports, created_at, updated_at`,
    [
      userData.email.toLowerCase(),
      userData.username.toLowerCase(),
      hashedPassword,
      userData.firstName,
      userData.lastName,
      'user', // Default role
      [], // Empty favorite sports array
      new Date(),
      new Date()
    ]
  );
  
  const user = result.rows[0];
  
  // Generate tokens
  const tokens = generateTokens({
    id: user.id,
    email: user.email,
    username: user.username
  });
  
  // Store refresh token in Redis
  await storeRefreshToken(user.id, tokens.refreshToken);
  
  // Return user data without password
  const userResponse: Omit<User, 'password'> = {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    favoriteSports: user.favorite_sports,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
  
  return {
    success: true,
    user: userResponse,
    tokens
  };
};

// Login user
export const loginUser = async (loginData: LoginData): Promise<AuthResponse> => {
  const pool = getPostgresPool();
  
  // Find user by email
  const result = await pool.query(
    `SELECT id, email, username, first_name, last_name, role, 
            avatar_url, bio, favorite_sports, password_hash, created_at, updated_at
     FROM profiles WHERE email = $1`,
    [loginData.email.toLowerCase()]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }
  
  const user = result.rows[0];
  
  // Verify password
  const isPasswordValid = await verifyPassword(loginData.password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }
  
  // Generate tokens
  const tokens = generateTokens({
    id: user.id,
    email: user.email,
    username: user.username
  });
  
  // Store refresh token in Redis
  await storeRefreshToken(user.id, tokens.refreshToken);
  
  // Update last login time
  await pool.query(
    'UPDATE profiles SET last_login = $1, updated_at = $2 WHERE id = $3',
    [new Date(), new Date(), user.id]
  );
  
  // Return user data without password
  const userResponse: Omit<User, 'password'> = {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    favoriteSports: user.favorite_sports,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
  
  return {
    success: true,
    user: userResponse,
    tokens
  };
};

// Refresh tokens
export const refreshTokens = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
  const { verifyToken } = await import('../middleware/auth');
  
  // Verify refresh token
  const decoded = verifyToken(refreshToken, true) as any;
  
  // Check if refresh token exists in Redis
  const isValid = await verifyRefreshToken(decoded.id, refreshToken);
  if (!isValid) {
    throw new Error('Invalid refresh token');
  }
  
  // Generate new tokens
  const tokens = generateTokens({
    id: decoded.id,
    email: decoded.email,
    username: decoded.username
  });
  
  // Store new refresh token in Redis
  await storeRefreshToken(decoded.id, tokens.refreshToken);
  
  return tokens;
};

// Logout user
export const logoutUser = async (userId: string): Promise<void> => {
  await revokeRefreshToken(userId);
};

// Get user by ID
export const getUserById = async (userId: string): Promise<Omit<User, 'password'> | null> => {
  const pool = getPostgresPool();
  const result = await pool.query(
    `SELECT id, email, username, first_name, last_name, role, 
            avatar_url, bio, favorite_sports, created_at, updated_at, last_login
     FROM profiles WHERE id = $1`,
    [userId]
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
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
};

// Update user profile
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<{
    firstName: string;
    lastName: string;
    bio: string;
    favoriteSports: string[];
  }>
): Promise<Omit<User, 'password'>> => {
  const pool = getPostgresPool();
  
  const allowedFields = ['first_name', 'last_name', 'bio', 'favorite_sports'];
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
               avatar_url, bio, favorite_sports, created_at, updated_at`,
    values
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
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
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
};
