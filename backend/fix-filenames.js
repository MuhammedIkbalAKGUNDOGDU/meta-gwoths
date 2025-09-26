require("dotenv").config({ path: "./config.env" });
const fs = require("fs");
const path = require("path");
const { query } = require("./config/database");

// Türkçe karakterleri düzelt
function fixTurkishCharacters(str) {
  return str
    .replace(/Ã§/g, "ç")
    .replace(/Ã¼/g, "ü")
    .replace(/Ã¶/g, "ö")
    .replace(/Ä±/g, "ı")
    .replace(/Ã/g, "ğ")
    .replace(/Å/g, "ş")
    .replace(/Ä°/g, "İ")
    .replace(/Ã‡/g, "Ç")
    .replace(/Ãœ/g, "Ü")
    .replace(/Ã–/g, "Ö")
    .replace(/Ä°/g, "Ğ")
    .replace(/Åž/g, "Ş");
}

async function fixFilenames() {
  try {
    console.log("🔧 Dosya adları düzeltiliyor...");

    // Database'deki tüm medya mesajlarını al
    const result = await query(`
      SELECT id, file_name, file_url 
      FROM chat_messages 
      WHERE file_url IS NOT NULL AND file_url != ''
    `);

    console.log(`📁 ${result.rows.length} dosya bulundu`);

    for (const row of result.rows) {
      const originalFileName = row.file_name;
      const fixedFileName = fixTurkishCharacters(originalFileName);

      if (originalFileName !== fixedFileName) {
        console.log(
          `🔄 Düzeltiliyor: "${originalFileName}" → "${fixedFileName}"`
        );

        // Database'de dosya adını güncelle
        await query("UPDATE chat_messages SET file_name = $1 WHERE id = $2", [
          fixedFileName,
          row.id,
        ]);

        console.log(`✅ ID ${row.id} güncellendi`);
      }
    }

    console.log("🎉 Tüm dosya adları düzeltildi!");
  } catch (error) {
    console.error("❌ Hata:", error);
  }
}

// Script'i çalıştır
fixFilenames().then(() => {
  console.log("🏁 İşlem tamamlandı");
  process.exit(0);
});
