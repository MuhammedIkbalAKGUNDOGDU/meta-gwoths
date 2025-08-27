-- Chat Yönetimi için Test Hesapları
-- Bu hesaplar chat admin girişi için kullanılacak

-- Şifre: 123456 (bcrypt hash)
-- Bcrypt rounds: 12

-- 1. Reklamcı Hesabı
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password_hash, 
    company, 
    phone, 
    role, 
    is_active
) VALUES (
    'Ahmet',
    'Reklamcı',
    'reklamci@test.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Reklam Ajansı A.Ş.',
    '+90 555 123 4567',
    'advertiser',
    true
);

-- 2. Editör Hesabı
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password_hash, 
    company, 
    phone, 
    role, 
    is_active
) VALUES (
    'Ayşe',
    'Editör',
    'editor@test.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'İçerik Editörlüğü Ltd.',
    '+90 555 234 5678',
    'editor',
    true
);

-- 3. Admin Hesabı
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password_hash, 
    company, 
    phone, 
    role, 
    is_active
) VALUES (
    'Mehmet',
    'Admin',
    'admin@test.com',
    '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Sistem Yönetimi',
    '+90 555 345 6789',
    'admin',
    true
);

-- Hesapları kontrol etmek için sorgu
SELECT 
    customer_id,
    first_name,
    last_name,
    email,
    role,
    company,
    phone,
    is_active,
    created_at
FROM users 
WHERE role IN ('advertiser', 'editor', 'admin')
ORDER BY role, created_at;
