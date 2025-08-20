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

    console.log("✅ Database tables created/verified successfully");
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
