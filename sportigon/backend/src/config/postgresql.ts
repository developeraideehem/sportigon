import { Pool } from 'pg';

export const connectPostgreSQL = async (): Promise<void> => {
  try {
    const postgresURI = process.env.POSTGRES_URI || 'postgresql://postgres:password@localhost:5432/sportigon_sports';

    const pool = new Pool({
      connectionString: postgresURI,
    });

    // Test the connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected');

    // Release the test client
    client.release();

    // Handle connection events
    pool.on('error', (err) => {
      console.error('❌ PostgreSQL connection error:', err);
    });

    // Store pool globally for use in other modules
    global.__postgresPool = pool;

  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    throw error;
  }
};

// Export pool getter for use in other modules
export const getPostgresPool = (): Pool => {
  if (!global.__postgresPool) {
    throw new Error('PostgreSQL not connected. Call connectPostgreSQL() first.');
  }
  return global.__postgresPool;
};