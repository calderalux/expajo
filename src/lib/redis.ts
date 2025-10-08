import Redis from 'ioredis';

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client instance
let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
    
    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });
    
    redisClient.on('error', (error) => {
      console.error('Redis client error:', error);
    });
    
    redisClient.on('close', () => {
      console.log('Redis client connection closed');
    });
  }
  
  return redisClient;
};

// Graceful shutdown
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

// Health check for Redis connection
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};

export default getRedisClient;
