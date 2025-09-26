require("dotenv").config({ path: "./config.env" });
const fs = require("fs");
const path = require("path");
const { query } = require("./config/database");

async function fixFilePaths() {
  try {
    console.log("🔧 Dosya yolları düzeltiliyor...");

    // Database'deki tüm medya mesajlarını al
    const result = await query(`
      SELECT id, file_name, file_url, sender_id
      FROM chat_messages 
      WHERE file_url IS NOT NULL AND file_url != ''
    `);

    console.log(`📁 ${result.rows.length} dosya bulundu`);

    for (const row of result.rows) {
      const originalPath = row.file_url;
      const senderId = row.sender_id;

      // Yanlış yolları tespit et
      let newPath = originalPath;
      let needsUpdate = false;

      // /uploads/chat-media/media-*.ext -> /uploads/chat-media/user-{senderId}/media-*.ext
      if (
        originalPath.includes("/uploads/chat-media/media-") &&
        !originalPath.includes("/user-")
      ) {
        const fileName = path.basename(originalPath);
        newPath = `/uploads/chat-media/user-${senderId}/${fileName}`;
        needsUpdate = true;
        console.log(`🔄 Düzeltiliyor: "${originalPath}" → "${newPath}"`);
      }

      // /uploads/chat-images/image-*.ext -> /uploads/chat-media/user-{senderId}/image-*.ext
      if (originalPath.includes("/uploads/chat-images/")) {
        const fileName = path.basename(originalPath);
        newPath = `/uploads/chat-media/user-${senderId}/${fileName}`;
        needsUpdate = true;
        console.log(`🔄 Düzeltiliyor: "${originalPath}" → "${newPath}"`);
      }

      if (needsUpdate) {
        // Database'de dosya yolunu güncelle
        await query("UPDATE chat_messages SET file_url = $1 WHERE id = $2", [
          newPath,
          row.id,
        ]);

        console.log(`✅ ID ${row.id} güncellendi`);
      }
    }

    console.log("🎉 Tüm dosya yolları düzeltildi!");
  } catch (error) {
    console.error("❌ Hata:", error);
  }
}

// Script'i çalıştır
fixFilePaths().then(() => {
  console.log("🏁 İşlem tamamlandı");
  process.exit(0);
});
