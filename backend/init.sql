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

-- Örnek veri ekle (opsiyonel - test için)
-- INSERT INTO users (first_name, last_name, email, password_hash, company, phone) VALUES
-- ('Admin', 'User', 'admin@metagrowths.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'MetaGrowths', '+90 555 123 4567');

-- Tabloları listele
\dt

-- Tablo yapılarını göster
\d users
\d web_forms
\d mobile_forms
\d survey_status
