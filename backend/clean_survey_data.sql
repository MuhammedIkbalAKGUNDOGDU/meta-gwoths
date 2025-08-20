-- Survey status tablosundaki mevcut kayıtları temizle
DELETE FROM survey_status;

-- Tabloyu sıfırla (sequence'i de sıfırla)
ALTER SEQUENCE survey_status_id_seq RESTART WITH 1;

-- Temizlik tamamlandı
SELECT 'Survey status tablosu temizlendi' as message;
