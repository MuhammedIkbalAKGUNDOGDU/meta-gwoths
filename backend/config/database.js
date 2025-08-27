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

    // Chat Rooms table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id SERIAL PRIMARY KEY,
        room_name VARCHAR(100) NOT NULL,
        room_description TEXT,
        created_by INTEGER REFERENCES users(customer_id) ON DELETE SET NULL,
        room_type VARCHAR(20) DEFAULT 'customer' CHECK (room_type IN ('customer', 'support', 'general')),
        is_active BOOLEAN DEFAULT true,
        max_participants INTEGER DEFAULT 4,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Chat Participants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(customer_id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('owner', 'admin', 'participant')),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_online BOOLEAN DEFAULT false,
        UNIQUE(room_id, user_id)
      );
    `);

    // Chat Messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(customer_id) ON DELETE SET NULL,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file', 'audio')),
        message_content TEXT,
        file_url VARCHAR(500),
        file_name VARCHAR(255),
        file_size INTEGER,
        file_type VARCHAR(100),
        is_edited BOOLEAN DEFAULT false,
        is_deleted BOOLEAN DEFAULT false,
        reply_to_message_id INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Chat Permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_permissions (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(customer_id) ON DELETE CASCADE,
        permission_type VARCHAR(20) DEFAULT 'read_write' CHECK (permission_type IN ('read_only', 'read_write', 'admin')),
        granted_by INTEGER REFERENCES users(customer_id) ON DELETE SET NULL,
        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(room_id, user_id)
      );
    `);

    // Create indexes for chat tables
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_rooms_room_type ON chat_rooms(room_type);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_active ON chat_rooms(is_active);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON chat_participants(room_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_participants_is_online ON chat_participants(is_online);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_messages_message_type ON chat_messages(message_type);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_permissions_room_id ON chat_permissions(room_id);`
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_chat_permissions_user_id ON chat_permissions(user_id);`
    );

    // Create triggers for chat tables
    await client.query(`
      DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
      CREATE TRIGGER update_chat_rooms_updated_at
        BEFORE UPDATE ON chat_rooms
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
      CREATE TRIGGER update_chat_messages_updated_at
        BEFORE UPDATE ON chat_messages
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create function to automatically create chat room for new users
    await client.query(`
      CREATE OR REPLACE FUNCTION create_user_chat_room()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO chat_rooms (room_name, room_description, created_by, room_type)
        VALUES (
          'Chat Odası - ' || NEW.first_name || ' ' || NEW.last_name,
          NEW.first_name || ' ' || NEW.last_name || ' için özel chat odası',
          NEW.customer_id,
          'customer'
        );
        
        INSERT INTO chat_participants (room_id, user_id, role)
        VALUES (currval('chat_rooms_id_seq'), NEW.customer_id, 'owner');
        
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger to automatically create chat room when new user is created
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_create_user_chat_room ON users;
      CREATE TRIGGER trigger_create_user_chat_room
        AFTER INSERT ON users
        FOR EACH ROW
        EXECUTE FUNCTION create_user_chat_room();
    `);

    // Create chat rooms for existing users who don't have them
    await client.query(`
      INSERT INTO chat_rooms (room_name, room_description, created_by, room_type)
      SELECT 
        'Chat Odası - ' || u.first_name || ' ' || u.last_name,
        u.first_name || ' ' || u.last_name || ' için özel chat odası',
        u.customer_id,
        'customer'
      FROM users u
      LEFT JOIN chat_rooms cr ON u.customer_id = cr.created_by
      WHERE cr.id IS NULL;
    `);

    // Add existing users as participants in their chat rooms
    await client.query(`
      INSERT INTO chat_participants (room_id, user_id, role)
      SELECT cr.id, cr.created_by, 'owner'
      FROM chat_rooms cr
      LEFT JOIN chat_participants cp ON cr.id = cp.room_id AND cr.created_by = cp.user_id
      WHERE cp.id IS NULL;
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
