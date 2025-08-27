const { Pool } = require("pg");

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test database connection
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL database connected successfully");

    // Create tables if they don't exist
    await createTables(client);

    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
};

// Create necessary tables
const createTables = async (client) => {
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        customer_id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        company VARCHAR(100),
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        is_chat_page_selected BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Web development forms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS web_forms (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(customer_id),
        name VARCHAR(50) NOT NULL,
        surname VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        project_description TEXT NOT NULL,
        budget VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Mobile app forms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS mobile_forms (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(customer_id),
        name VARCHAR(50) NOT NULL,
        surname VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        project_description TEXT NOT NULL,
        budget VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Survey status table
    await client.query(`
      CREATE TABLE IF NOT EXISTS survey_status (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(customer_id) ON DELETE CASCADE,
        is_completed BOOLEAN DEFAULT false,
        answers JSONB,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(customer_id)
      );
    `);

    // User tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_tokens (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(customer_id) ON DELETE CASCADE,
        total_tokens INTEGER DEFAULT 100 NOT NULL,
        used_tokens INTEGER DEFAULT 0 NOT NULL,
        remaining_tokens INTEGER GENERATED ALWAYS AS (total_tokens - used_tokens) STORED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(customer_id)
      );
    `);

    // Token transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS token_transactions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(customer_id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
        amount INTEGER NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create trigger function for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for user_tokens table
    await client.query(`
      DROP TRIGGER IF EXISTS update_user_tokens_updated_at ON user_tokens;
      CREATE TRIGGER update_user_tokens_updated_at
        BEFORE UPDATE ON user_tokens
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create function to automatically create token record for new users
    await client.query(`
      CREATE OR REPLACE FUNCTION create_user_tokens()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO user_tokens (customer_id, total_tokens, used_tokens)
        VALUES (NEW.customer_id, 100, 0);
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger to automatically create token record when new user is created
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_create_user_tokens ON users;
      CREATE TRIGGER trigger_create_user_tokens
        AFTER INSERT ON users
        FOR EACH ROW
        EXECUTE FUNCTION create_user_tokens();
    `);

    // Create token records for existing users who don't have them
    await client.query(`
      INSERT INTO user_tokens (customer_id, total_tokens, used_tokens)
      SELECT u.customer_id, 100, 0
      FROM users u
      LEFT JOIN user_tokens ut ON u.customer_id = ut.customer_id
      WHERE ut.customer_id IS NULL;
    `);

    console.log(
      "✅ Database tables and triggers created/verified successfully"
    );
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  }
};

// Helper function to execute queries
const query = (text, params) => pool.query(text, params);

module.exports = {
  connectDB,
  query,
  pool,
};
