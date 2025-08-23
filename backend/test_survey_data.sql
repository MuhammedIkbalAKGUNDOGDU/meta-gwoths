-- Test için survey_status verisi ekleme
-- Bu dosya test amaçlıdır, production'da kullanmayın

-- Önce bir test kullanıcısı oluştur (eğer yoksa)
INSERT INTO users (first_name, last_name, email, password_hash, company, phone) 
VALUES ('Test', 'User', 'test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'Test Company', '+90 555 123 4567')
ON CONFLICT (email) DO NOTHING;

-- Test kullanıcısının ID'sini al
DO $$
DECLARE
    test_user_id INTEGER;
BEGIN
    SELECT customer_id INTO test_user_id FROM users WHERE email = 'test@example.com';
    
    -- Bu kullanıcı için survey_status kaydı oluştur (anket tamamlanmış)
    INSERT INTO survey_status (customer_id, is_completed, answers, completed_at)
    VALUES (test_user_id, true, '{"test": "data"}', CURRENT_TIMESTAMP)
    ON CONFLICT (customer_id) DO UPDATE SET 
        is_completed = true,
        answers = '{"test": "data"}',
        completed_at = CURRENT_TIMESTAMP;
    
    RAISE NOTICE 'Test user ID: %, Survey status updated', test_user_id;
END $$;

-- Anket tamamlanmamış bir kullanıcı da oluştur
INSERT INTO users (first_name, last_name, email, password_hash, company, phone) 
VALUES ('Test2', 'User', 'test2@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'Test Company 2', '+90 555 123 4568')
ON CONFLICT (email) DO NOTHING;

-- Test2 kullanıcısı için survey_status kaydı oluştur (anket tamamlanmamış)
DO $$
DECLARE
    test2_user_id INTEGER;
BEGIN
    SELECT customer_id INTO test2_user_id FROM users WHERE email = 'test2@example.com';
    
    -- Bu kullanıcı için survey_status kaydı oluştur (anket tamamlanmamış)
    INSERT INTO survey_status (customer_id, is_completed, answers, completed_at)
    VALUES (test2_user_id, false, NULL, NULL)
    ON CONFLICT (customer_id) DO UPDATE SET 
        is_completed = false,
        answers = NULL,
        completed_at = NULL;
    
    RAISE NOTICE 'Test2 user ID: %, Survey status updated (not completed)', test2_user_id;
END $$;

-- Mevcut survey_status kayıtlarını göster
SELECT 
    u.customer_id,
    u.first_name,
    u.last_name,
    u.email,
    ss.is_completed,
    ss.completed_at
FROM users u
LEFT JOIN survey_status ss ON u.customer_id = ss.customer_id
WHERE u.email IN ('test@example.com', 'test2@example.com')
ORDER BY u.customer_id;
