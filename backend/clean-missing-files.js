require("dotenv").config({ path: "./config.env" });
const fs = require("fs");
const path = require("path");
const { query } = require("./config/database");

async function cleanMissingFiles() {
  try {
    console.log("🔧 Eksik dosyalar temizleniyor...");

    // Database'deki tüm medya mesajlarını al
    const result = await query(`
      SELECT id, file_name, file_url, sender_id
      FROM chat_messages 
      WHERE file_url IS NOT NULL AND file_url != ''
    `);

    console.log(`📁 ${result.rows.length} dosya kaydı bulundu`);

    let missingCount = 0;
    let deletedCount = 0;

    for (const row of result.rows) {
      const fileUrl = row.file_url;

      // Dosya yolunu oluştur
      let filePath;
      if (fileUrl.includes("/uploads/chat-media/user-")) {
        // Yeni format: /uploads/chat-media/user-1/filename
        const relativePath = fileUrl.replace("/uploads/", "");
        filePath = path.join(__dirname, "uploads", relativePath);
      } else if (fileUrl.includes("/uploads/chat-media/")) {
        // Eski format: /uploads/chat-media/filename
        const filename = path.basename(fileUrl);
        filePath = path.join(__dirname, "uploads", "chat-media", filename);
      } else if (fileUrl.includes("/uploads/chat-images/")) {
        // Eski format: /uploads/chat-images/filename
        const filename = path.basename(fileUrl);
        filePath = path.join(__dirname, "uploads", "chat-images", filename);
      } else {
        console.log(`⚠️ Bilinmeyen format: ${fileUrl}`);
        continue;
      }

      // Dosya var mı kontrol et
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Eksik dosya: ${fileUrl}`);
        console.log(`   Fiziksel yol: ${filePath}`);
        console.log(`   Database ID: ${row.id}`);

        // Database'den kaydı sil
        await query("DELETE FROM chat_messages WHERE id = $1", [row.id]);

        console.log(`🗑️ Database kaydı silindi: ID ${row.id}`);
        missingCount++;
        deletedCount++;
      } else {
        console.log(`✅ Dosya mevcut: ${fileUrl}`);
      }
    }

    console.log(`\n🎉 Temizlik tamamlandı!`);
    console.log(`📊 İstatistikler:`);
    console.log(`   - Toplam kayıt: ${result.rows.length}`);
    console.log(`   - Eksik dosya: ${missingCount}`);
    console.log(`   - Silinen kayıt: ${deletedCount}`);
    console.log(`   - Kalan kayıt: ${result.rows.length - deletedCount}`);
  } catch (error) {
    console.error("❌ Hata:", error);
  }
}

// Script'i çalıştır
cleanMissingFiles().then(() => {
  console.log("🏁 İşlem tamamlandı");
  process.exit(0);
});
