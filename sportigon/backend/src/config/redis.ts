import Redis from 'redis';

export const connectRedis = async (): Promise<void> => {
  try {
    const redisURI = process.env.REDIS_URI || 'redis://localhost:6379';

    const client = Redis.createClient({
      url: redisURI,
    });

    await client.connect();
    console.log('✅ Redis Connected');

    // Store client globally for use in other modules
    global.__redisClient = client;

    // Handle connection events
    client.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    client.on('disconnect', () => {
      console.log('⚠️ Redis disconnected');
    });

  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    throw error;
  }
};

// Export client getter for use in other modules
export const getRedisClient = (): Redis.RedisClientType => {
  if (!global.__redisClient) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return global.__redisClient;
};