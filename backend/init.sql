-- MetaGrowths Database Initialization Script
-- PostgreSQL veritabanı için gerekli tabloları oluşturur

-- Veritabanını oluştur (eğer yoksa)
-- CREATE DATABASE metagrowths_db;

-- Veritabanına bağlan
-- \c metagrowths_db;

-- Users tablosu - Kullanıcı bilgileri
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

-- User tokens tablosu - Kullanıcı token sistemi
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

-- Token transactions tablosu - Token işlem geçmişi
CREATE TABLE IF NOT EXISTS token_transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(customer_id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Web development forms tablosu - Web geliştirme formları
CREATE TABLE IF NOT EXISTS web_forms (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(customer_id) ON DELETE SET NULL,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    project_description TEXT NOT NULL,
    budget VARCHAR(20),
    status VARCHAR(20) DEFAULT 'beklemede' CHECK (status IN ('beklemede', 'onaylandı', 'görüşüldü', 'reddedildi')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mobile app forms tablosu - Mobil uygulama formları
CREATE TABLE IF NOT EXISTS mobile_forms (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(customer_id) ON DELETE SET NULL,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    project_description TEXT NOT NULL,
    budget VARCHAR(20),
    status VARCHAR(20) DEFAULT 'beklemede' CHECK (status IN ('beklemede', 'onaylandı', 'görüşüldü', 'reddedildi')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Survey status tablosu - Anket durumu ve cevapları
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

-- Subscriptions tablosu - Abonelik bilgileri
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(customer_id) ON DELETE CASCADE,
    package_name VARCHAR(100) NOT NULL,
    package_details JSONB NOT NULL,
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'expired', 'cancelled', 'suspended')),
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'failed', 'refunded')),
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store setup requests tablosu - Mağaza kurulum istekleri
CREATE TABLE IF NOT EXISTS store_setup_requests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES users(customer_id) ON DELETE CASCADE,
    request_status VARCHAR(20) DEFAULT 'beklemede' CHECK (request_status IN ('beklemede', 'onaylandı', 'görüşüldü', 'reddedildi', 'tamamlandı')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes oluştur - Performans için
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_customer_id ON users(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_customer_id ON user_tokens(customer_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_remaining ON user_tokens(remaining_tokens);
CREATE INDEX IF NOT EXISTS idx_token_transactions_customer_id ON token_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON token_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_web_forms_customer_id ON web_forms(customer_id);
CREATE INDEX IF NOT EXISTS idx_web_forms_created_at ON web_forms(created_at);
CREATE INDEX IF NOT EXISTS idx_mobile_forms_customer_id ON mobile_forms(customer_id);
CREATE INDEX IF NOT EXISTS idx_mobile_forms_created_at ON mobile_forms(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_status_customer_id ON survey_status(customer_id);
CREATE INDEX IF NOT EXISTS idx_survey_status_is_completed ON survey_status(is_completed);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(subscription_status);
CREATE INDEX IF NOT EXISTS idx_store_setup_requests_customer_id ON store_setup_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_store_setup_requests_status ON store_setup_requests(request_status);

-- Trigger function - updated_at alanını otomatik güncelle
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger oluştur - users tablosu için
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger oluştur - user_tokens tablosu için
DROP TRIGGER IF EXISTS update_user_tokens_updated_at ON user_tokens;
CREATE TRIGGER update_user_tokens_updated_at
    BEFORE UPDATE ON user_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger oluştur - survey_status tablosu için
DROP TRIGGER IF EXISTS update_survey_status_updated_at ON survey_status;
CREATE TRIGGER update_survey_status_updated_at
    BEFORE UPDATE ON survey_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger oluştur - web_forms tablosu için
DROP TRIGGER IF EXISTS update_web_forms_updated_at ON web_forms;
CREATE TRIGGER update_web_forms_updated_at
    BEFORE UPDATE ON web_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger oluştur - mobile_forms tablosu için
DROP TRIGGER IF EXISTS update_mobile_forms_updated_at ON mobile_forms;
CREATE TRIGGER update_mobile_forms_updated_at
    BEFORE UPDATE ON mobile_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger oluştur - subscriptions tablosu için
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger oluştur - store_setup_requests tablosu için
DROP TRIGGER IF EXISTS update_store_setup_requests_updated_at ON store_setup_requests;
CREATE TRIGGER update_store_setup_requests_updated_at
    BEFORE UPDATE ON store_setup_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create token record for new users
CREATE OR REPLACE FUNCTION create_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_tokens (customer_id, total_tokens, used_tokens)
    VALUES (NEW.customer_id, 100, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically create token record when new user is created
DROP TRIGGER IF EXISTS trigger_create_user_tokens ON users;
CREATE TRIGGER trigger_create_user_tokens
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_tokens();

-- Örnek veri ekle (opsiyonel - test için)
-- INSERT INTO users (first_name, last_name, email, password_hash, company, phone) VALUES
-- ('Admin', 'User', 'admin@metagrowths.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'MetaGrowths', '+90 555 123 4567');

-- Chat Rooms tablosu - Chat odaları
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

-- Chat Participants tablosu - Chat odası katılımcıları
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

-- Chat Messages tablosu - Chat mesajları
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

-- Chat room permissions tablosu - Chat odası izinleri
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

-- Indexes for chat tables
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_room_type ON chat_rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_active ON chat_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_is_online ON chat_participants(is_online);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_message_type ON chat_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_chat_permissions_room_id ON chat_permissions(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_permissions_user_id ON chat_permissions(user_id);

-- Trigger oluştur - chat_rooms tablosu için
DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger oluştur - chat_messages tablosu için
DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create chat room for new users
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
    
    -- Add user as owner of their chat room
    INSERT INTO chat_participants (room_id, user_id, role)
    VALUES (currval('chat_rooms_id_seq'), NEW.customer_id, 'owner');
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically create chat room when new user is created
DROP TRIGGER IF EXISTS trigger_create_user_chat_room ON users;
CREATE TRIGGER trigger_create_user_chat_room
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_chat_room();

-- Tabloları listele
\dt

-- Tablo yapılarını göster
\d users
\d user_tokens
\d token_transactions
\d web_forms
\d mobile_forms
\d survey_status
\d chat_rooms
\d chat_participants
\d chat_messages
\d chat_permissions
