const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { query } = require("../config/database");
const {
  authenticateToken,
  authenticateAdmin,
  authenticateChatAdmin,
  authorizeRole,
} = require("../middleware/auth");

// Multer konfigürasyonu - kullanıcı bazlı medya yükleme için
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Kullanıcı ID'sini al (token'dan)
    let userId = null;
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.customer_id;
      }
    } catch (error) {
      console.error("Token decode error:", error);
    }

    // Kullanıcı klasörü oluştur
    const userDir = userId ? `user-${userId}` : "anonymous";
    const uploadDir = path.join(__dirname, "../uploads/chat-media", userDir);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Türkçe karakterleri koruyarak güvenli dosya adı oluştur
    const originalName = file.originalname
      .normalize("NFC") // Unicode normalization
      .replace(/[<>:"/\\|?*]/g, "_") // Sadece tehlikeli karakterleri değiştir
      .replace(/\s+/g, "_"); // Boşlukları underscore ile değiştir
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + originalName);
  },
});

const fileFilter = (req, file, cb) => {
  // Resim ve video dosyalarına izin ver
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Sadece resim ve video dosyaları yüklenebilir!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (video için daha büyük)
  },
});

// @route   GET /api/chat/rooms
// @desc    Get user's chat rooms
// @access  Private
router.get("/rooms", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    const result = await query(
      `
      SELECT DISTINCT 
        cr.id,
        cr.room_name,
        cr.room_description,
        cr.room_type,
        cr.is_active,
        cr.max_participants,
        cr.created_at,
        cr.updated_at,
        cp.role as user_role,
        cp.joined_at,
        cp.is_online,
        u.first_name,
        u.last_name,
        u.email,
        u.company
      FROM chat_rooms cr
      INNER JOIN chat_participants cp ON cr.id = cp.room_id
      INNER JOIN users u ON cp.user_id = u.customer_id
      WHERE cp.user_id = $1 AND cr.is_active = true
      ORDER BY cr.updated_at DESC
    `,
      [customerId]
    );

    res.json({
      status: "success",
      data: {
        rooms: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error) {
    console.error("Chat rooms retrieval error:", error);
    res.status(500).json({
      status: "error",
      message: "Chat odaları alınırken bir hata oluştu",
    });
  }
});

// @route   GET /api/chat/rooms/all
// @desc    Get all chat rooms (Admin only)
// @access  Private
router.get(
  "/rooms/all",
  authenticateAdmin,
  authorizeRole(["super_admin", "admin", "editor", "advertiser"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT 
        cr.id,
        cr.room_name,
        cr.room_description,
        cr.room_type,
        cr.is_active,
        cr.max_participants,
        cr.created_at,
        cr.updated_at,
        cr.created_by as creator_id,
        creator.first_name as creator_first_name,
        creator.last_name as creator_last_name,
        creator.email as creator_email,
        creator.company as creator_company,
        (SELECT COUNT(*) FROM chat_participants WHERE room_id = cr.id) as participant_count
      FROM chat_rooms cr
      LEFT JOIN users creator ON cr.created_by = creator.customer_id
      ORDER BY cr.updated_at DESC
    `);

      res.json({
        status: "success",
        data: {
          rooms: result.rows,
          total: result.rows.length,
        },
      });
    } catch (error) {
      console.error("All chat rooms retrieval error:", error);
      res.status(500).json({
        status: "error",
        message: "Tüm chat odaları alınırken bir hata oluştu",
      });
    }
  }
);

// @route   GET /api/chat/rooms/:roomId
// @desc    Get specific chat room details (Chat Admin - can access any room, Normal User - can access own room)
// @access  Private
router.get("/rooms/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    // Authentication logic
    let user = null;
    let isChatAdmin = false;

    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await query(
          "SELECT customer_id, first_name, last_name, email, company, phone, role, is_active FROM users WHERE customer_id = $1",
          [decoded.customer_id]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
          user = result.rows[0];
          const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];
          isChatAdmin = allowedRoles.includes(user.role);
        }
      }
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const customerId = user.customer_id;

    // Access control: Normal users can only access their own room (roomId = customerId)
    if (!isChatAdmin && parseInt(roomId) !== customerId) {
      return res.status(403).json({
        status: "error",
        message: "Access denied - you can only access your own chat room",
      });
    }

    // Get room details with participants
    const result = await query(
      `
      SELECT 
        cr.id,
        cr.room_name,
        cr.room_description,
        cr.room_type,
        cr.is_active,
        cr.max_participants,
        cr.created_at,
        cr.updated_at,
        cp.role as user_role,
        cp.joined_at,
        cp.is_online,
        u.first_name,
        u.last_name,
        u.email,
        u.company
      FROM chat_rooms cr
      INNER JOIN chat_participants cp ON cr.id = cp.room_id
      INNER JOIN users u ON cp.user_id = u.customer_id
      WHERE cr.id = $1 AND cr.is_active = true
      ORDER BY cp.joined_at ASC
    `,
      [roomId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Chat odası bulunamadı",
      });
    }

    // Update user's online status
    await query(
      `
      UPDATE chat_participants 
      SET is_online = true, last_seen = CURRENT_TIMESTAMP
      WHERE room_id = $1 AND user_id = $2
    `,
      [roomId, customerId]
    );

    res.json({
      status: "success",
      data: {
        room: {
          id: result.rows[0].id,
          room_name: result.rows[0].room_name,
          room_description: result.rows[0].room_description,
          room_type: result.rows[0].room_type,
          is_active: result.rows[0].is_active,
          max_participants: result.rows[0].max_participants,
          created_at: result.rows[0].created_at,
          updated_at: result.rows[0].updated_at,
        },
        participants: result.rows.map((row) => ({
          user_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          company: row.company,
          role: row.role,
          joined_at: row.joined_at,
          is_online: row.is_online,
        })),
        user_role: result.rows.find((p) => p.user_id === customerId)?.role,
      },
    });
  } catch (error) {
    console.error("Chat room details error:", error);
    res.status(500).json({
      status: "error",
      message: "Chat oda detayları alınırken bir hata oluştu",
    });
  }
});

// @route   GET /api/chat/messages/:roomId
// @desc    Get messages for a specific chat room
// @access  Private
router.get("/messages/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Authentication logic
    let user = null;
    let isChatAdmin = false;

    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await query(
          "SELECT customer_id, first_name, last_name, email, company, phone, role, is_active FROM users WHERE customer_id = $1",
          [decoded.customer_id]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
          user = result.rows[0];
          const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];
          isChatAdmin = allowedRoles.includes(user.role);
        }
      }
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const customerId = user.customer_id;

    // Access control: Normal users can only access their own room (roomId = customerId)
    if (!isChatAdmin && parseInt(roomId) !== customerId) {
      return res.status(403).json({
        status: "error",
        message: "Access denied - you can only access your own chat room",
      });
    }

    const result = await query(
      `
      SELECT 
        cm.id,
        cm.room_id,
        cm.sender_id,
        cm.message_type,
        cm.message_content,
        cm.file_url,
        cm.file_name,
        cm.file_size,
        cm.file_type,
        cm.is_edited,
        cm.is_deleted,
        cm.reply_to_message_id,
        cm.created_at,
        cm.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        u.role,
        reply.message_content as reply_content,
        reply_sender.first_name as reply_sender_first_name,
        reply_sender.last_name as reply_sender_last_name
      FROM chat_messages cm
      INNER JOIN users u ON cm.sender_id = u.customer_id
      LEFT JOIN chat_messages reply ON cm.reply_to_message_id = reply.id
      LEFT JOIN users reply_sender ON reply.sender_id = reply_sender.customer_id
      WHERE cm.room_id = $1 AND cm.is_deleted = false
      ORDER BY cm.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [roomId, parseInt(limit), parseInt(offset)]
    );

    // Modify display names for chat admin users
    const messagesWithDisplayNames = result.rows.map((row) => {
      let displayName = `${row.first_name} ${row.last_name}`;
      const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];

      if (allowedRoles.includes(row.role)) {
        // Map role to Turkish display name
        const roleDisplayNames = {
          advertiser: "Reklamcı",
          editor: "Editör",
          admin: "Admin",
          super_admin: "Süper Admin",
        };
        displayName = roleDisplayNames[row.role] || row.role;
      }

      return {
        ...row,
        display_name: displayName,
      };
    });

    res.json({
      status: "success",
      data: {
        messages: messagesWithDisplayNames.reverse(), // Reverse to get chronological order
        total: messagesWithDisplayNames.length,
      },
    });
  } catch (error) {
    console.error("Chat messages retrieval error:", error);
    res.status(500).json({
      status: "error",
      message: "Mesajlar alınırken bir hata oluştu",
    });
  }
});

// @route   POST /api/chat/messages/image
// @desc    Send an image message to a chat room
// @access  Private
router.post("/messages/image", upload.single("image"), async (req, res) => {
  try {
    const { room_id, message_content = "" } = req.body;

    // Authentication logic
    let user = null;
    let isChatAdmin = false;

    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await query(
          "SELECT customer_id, first_name, last_name, email, company, phone, role, is_active FROM users WHERE customer_id = $1",
          [decoded.customer_id]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
          user = result.rows[0];
          const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];
          isChatAdmin = allowedRoles.includes(user.role);
        }
      }
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const customerId = user.customer_id;

    if (!room_id || !req.file) {
      return res.status(400).json({
        status: "error",
        message: "Oda ID ve resim dosyası gereklidir",
      });
    }

    // Access control: Normal users can only send messages to their own room (roomId = customerId)
    if (!isChatAdmin && parseInt(room_id) !== customerId) {
      return res.status(403).json({
        status: "error",
        message:
          "Access denied - you can only send messages to your own chat room",
      });
    }

    // Resim dosyası bilgilerini al
    const fileUrl = `/uploads/chat-images/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;

    // Insert image message
    const result = await query(
      `
      INSERT INTO chat_messages (room_id, sender_id, message_type, message_content, file_url, file_name, file_size, file_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        room_id,
        customerId,
        "image",
        message_content,
        fileUrl,
        fileName,
        fileSize,
        fileType,
      ]
    );

    // Get message with sender info
    const messageWithSender = await query(
      `
      SELECT 
        cm.id,
        cm.room_id,
        cm.sender_id,
        cm.message_type,
        cm.message_content,
        cm.file_url,
        cm.file_name,
        cm.file_size,
        cm.file_type,
        cm.is_edited,
        cm.is_deleted,
        cm.reply_to_message_id,
        cm.created_at,
        cm.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        u.role
      FROM chat_messages cm
      INNER JOIN users u ON cm.sender_id = u.customer_id
      WHERE cm.id = $1
    `,
      [result.rows[0].id]
    );

    // Modify display name for chat admin users
    let displayName = `${messageWithSender.rows[0].first_name} ${messageWithSender.rows[0].last_name}`;
    const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];

    if (allowedRoles.includes(messageWithSender.rows[0].role)) {
      // Map role to Turkish display name
      const roleDisplayNames = {
        advertiser: "Reklamcı",
        editor: "Editör",
        admin: "Admin",
        super_admin: "Süper Admin",
      };
      displayName =
        roleDisplayNames[messageWithSender.rows[0].role] ||
        messageWithSender.rows[0].role;
    }

    // Add display_name to the response
    const messageData = {
      ...messageWithSender.rows[0],
      display_name: displayName,
    };

    // Update room's updated_at timestamp
    await query(
      `
      UPDATE chat_rooms 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [room_id]
    );

    res.json({
      status: "success",
      message: "Resim mesajı başarıyla gönderildi",
      data: {
        message: messageData,
      },
    });
  } catch (error) {
    console.error("Send image message error:", error);
    res.status(500).json({
      status: "error",
      message: "Resim mesajı gönderilirken bir hata oluştu",
    });
  }
});

// @route   POST /api/chat/messages/media
// @desc    Send a media message (image/video) to a chat room
// @access  Private
router.post("/messages/media", upload.single("media"), async (req, res) => {
  try {
    const { room_id, message_content = "" } = req.body;

    // Authentication logic
    let user = null;
    let isChatAdmin = false;

    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await query(
          "SELECT customer_id, first_name, last_name, email, company, phone, role, is_active FROM users WHERE customer_id = $1",
          [decoded.customer_id]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
          user = result.rows[0];
          const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];
          isChatAdmin = allowedRoles.includes(user.role);
        }
      }
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const customerId = user.customer_id;

    if (!room_id || !req.file) {
      return res.status(400).json({
        status: "error",
        message: "Oda ID ve medya dosyası gereklidir",
      });
    }

    // Access control: Normal users can only send messages to their own room (roomId = customerId)
    if (!isChatAdmin && parseInt(room_id) !== customerId) {
      return res.status(403).json({
        status: "error",
        message:
          "Access denied - you can only send messages to your own chat room",
      });
    }

    // Dosya türünü belirle
    const isVideo = req.file.mimetype.startsWith("video/");
    const messageType = isVideo ? "video" : "image";

    // Medya dosyası bilgilerini al
    const userDir = `user-${customerId}`;
    const fileUrl = `/uploads/chat-media/${userDir}/${req.file.filename}`;
    // Türkçe karakterleri koruyarak dosya adını normalize et
    const fileName = req.file.originalname
      .normalize("NFC") // Unicode normalization
      .replace(/[<>:"/\\|?*]/g, "_") // Sadece tehlikeli karakterleri değiştir
      .replace(/\s+/g, "_"); // Boşlukları underscore ile değiştir
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;

    // Insert media message
    const result = await query(
      `
      INSERT INTO chat_messages (room_id, sender_id, message_type, message_content, file_url, file_name, file_size, file_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        room_id,
        customerId,
        messageType,
        message_content,
        fileUrl,
        fileName,
        fileSize,
        fileType,
      ]
    );

    // Get message with sender info
    const messageWithSender = await query(
      `
      SELECT 
        cm.id,
        cm.room_id,
        cm.sender_id,
        cm.message_type,
        cm.message_content,
        cm.file_url,
        cm.file_name,
        cm.file_size,
        cm.file_type,
        cm.is_edited,
        cm.is_deleted,
        cm.reply_to_message_id,
        cm.created_at,
        cm.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        u.role
      FROM chat_messages cm
      INNER JOIN users u ON cm.sender_id = u.customer_id
      WHERE cm.id = $1
    `,
      [result.rows[0].id]
    );

    // Modify display name for chat admin users
    let displayName = `${messageWithSender.rows[0].first_name} ${messageWithSender.rows[0].last_name}`;
    const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];

    if (allowedRoles.includes(messageWithSender.rows[0].role)) {
      // Map role to Turkish display name
      const roleDisplayNames = {
        advertiser: "Reklamcı",
        editor: "Editör",
        admin: "Admin",
        super_admin: "Süper Admin",
      };
      displayName =
        roleDisplayNames[messageWithSender.rows[0].role] ||
        messageWithSender.rows[0].role;
    }

    // Add display_name to the response
    const messageData = {
      ...messageWithSender.rows[0],
      display_name: displayName,
    };

    // Update room's updated_at timestamp
    await query(
      `
      UPDATE chat_rooms 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [room_id]
    );

    res.json({
      status: "success",
      message: `${isVideo ? "Video" : "Resim"} mesajı başarıyla gönderildi`,
      data: {
        message: messageData,
      },
    });
  } catch (error) {
    console.error("Send media message error:", error);
    res.status(500).json({
      status: "error",
      message: "Medya mesajı gönderilirken bir hata oluştu",
    });
  }
});

// @route   POST /api/chat/messages
// @desc    Send a message to a chat room
// @access  Private
router.post("/messages", async (req, res) => {
  try {
    const {
      room_id,
      message_content,
      message_type = "text",
      reply_to_message_id,
    } = req.body;

    // Authentication logic
    let user = null;
    let isChatAdmin = false;

    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await query(
          "SELECT customer_id, first_name, last_name, email, company, phone, role, is_active FROM users WHERE customer_id = $1",
          [decoded.customer_id]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
          user = result.rows[0];
          const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];
          isChatAdmin = allowedRoles.includes(user.role);
        }
      }
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const customerId = user.customer_id;

    if (!room_id || !message_content) {
      return res.status(400).json({
        status: "error",
        message: "Oda ID ve mesaj içeriği gereklidir",
      });
    }

    // Access control: Normal users can only send messages to their own room (roomId = customerId)
    if (!isChatAdmin && parseInt(room_id) !== customerId) {
      return res.status(403).json({
        status: "error",
        message:
          "Access denied - you can only send messages to your own chat room",
      });
    }

    // Insert message
    const result = await query(
      `
      INSERT INTO chat_messages (room_id, sender_id, message_type, message_content, reply_to_message_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [
        room_id,
        customerId,
        message_type,
        message_content,
        reply_to_message_id || null,
      ]
    );

    // Get message with sender info
    const messageWithSender = await query(
      `
      SELECT 
        cm.id,
        cm.room_id,
        cm.sender_id,
        cm.message_type,
        cm.message_content,
        cm.file_url,
        cm.file_name,
        cm.file_size,
        cm.file_type,
        cm.is_edited,
        cm.is_deleted,
        cm.reply_to_message_id,
        cm.created_at,
        cm.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        u.role
      FROM chat_messages cm
      INNER JOIN users u ON cm.sender_id = u.customer_id
      WHERE cm.id = $1
    `,
      [result.rows[0].id]
    );

    // Modify display name for chat admin users
    let displayName = `${messageWithSender.rows[0].first_name} ${messageWithSender.rows[0].last_name}`;
    const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];

    if (allowedRoles.includes(messageWithSender.rows[0].role)) {
      // Map role to Turkish display name
      const roleDisplayNames = {
        advertiser: "Reklamcı",
        editor: "Editör",
        admin: "Admin",
        super_admin: "Süper Admin",
      };
      displayName =
        roleDisplayNames[messageWithSender.rows[0].role] ||
        messageWithSender.rows[0].role;
    }

    // Add display_name to the response
    const messageData = {
      ...messageWithSender.rows[0],
      display_name: displayName,
    };

    // Update room's updated_at timestamp
    await query(
      `
      UPDATE chat_rooms 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `,
      [room_id]
    );

    res.json({
      status: "success",
      message: "Mesaj başarıyla gönderildi",
      data: {
        message: messageData,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      status: "error",
      message: "Mesaj gönderilirken bir hata oluştu",
    });
  }
});

// @route   PUT /api/chat/messages/:messageId
// @desc    Edit a message
// @access  Private
router.put("/messages/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message_content } = req.body;
    const customerId = req.user.customer_id;

    if (!message_content) {
      return res.status(400).json({
        status: "error",
        message: "Mesaj içeriği gereklidir",
      });
    }

    // Check if user owns this message
    const messageCheck = await query(
      `
      SELECT cm.id, cm.sender_id, cm.room_id, cp.role
      FROM chat_messages cm
      INNER JOIN chat_participants cp ON cm.room_id = cp.room_id
      WHERE cm.id = $1 AND cp.user_id = $2
    `,
      [messageId, customerId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Mesaj bulunamadı",
      });
    }

    const message = messageCheck.rows[0];
    const userRole = messageCheck.rows[0].role;

    // Only message owner or admin can edit
    if (
      message.sender_id !== customerId &&
      userRole !== "admin" &&
      userRole !== "owner"
    ) {
      return res.status(403).json({
        status: "error",
        message: "Bu mesajı düzenleme izniniz yok",
      });
    }

    // Update message
    const result = await query(
      `
      UPDATE chat_messages 
      SET message_content = $1, is_edited = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
      [message_content, messageId]
    );

    res.json({
      status: "success",
      message: "Mesaj başarıyla düzenlendi",
      data: {
        message: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Edit message error:", error);
    res.status(500).json({
      status: "error",
      message: "Mesaj düzenlenirken bir hata oluştu",
    });
  }
});

// @route   DELETE /api/chat/messages/:messageId
// @desc    Delete a message (soft delete)
// @access  Private
router.delete("/messages/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const customerId = req.user.customer_id;

    // Check if user owns this message or is admin
    const messageCheck = await query(
      `
      SELECT cm.id, cm.sender_id, cm.room_id, cp.role
      FROM chat_messages cm
      INNER JOIN chat_participants cp ON cm.room_id = cp.room_id
      WHERE cm.id = $1 AND cp.user_id = $2
    `,
      [messageId, customerId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Mesaj bulunamadı",
      });
    }

    const message = messageCheck.rows[0];
    const userRole = messageCheck.rows[0].role;

    // Only message owner or admin can delete
    if (
      message.sender_id !== customerId &&
      userRole !== "admin" &&
      userRole !== "owner"
    ) {
      return res.status(403).json({
        status: "error",
        message: "Bu mesajı silme izniniz yok",
      });
    }

    // Soft delete message
    const result = await query(
      `
      UPDATE chat_messages 
      SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
      [messageId]
    );

    res.json({
      status: "success",
      message: "Mesaj başarıyla silindi",
      data: {
        message: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      status: "error",
      message: "Mesaj silinirken bir hata oluştu",
    });
  }
});

// @route   POST /api/chat/rooms/:roomId/join
// @desc    Join a chat room
// @access  Private
router.post("/rooms/:roomId/join", authenticateChatAdmin, async (req, res) => {
  try {
    const { roomId } = req.params;
    const customerId = req.user.customer_id;

    // Check if room exists and is active
    const roomCheck = await query(
      `
      SELECT cr.id, cr.max_participants, COUNT(cp.user_id) as current_participants
      FROM chat_rooms cr
      LEFT JOIN chat_participants cp ON cr.id = cp.room_id
      WHERE cr.id = $1 AND cr.is_active = true
      GROUP BY cr.id, cr.max_participants
    `,
      [roomId]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Chat odası bulunamadı",
      });
    }

    const room = roomCheck.rows[0];

    // Check if room is full
    if (room.current_participants >= room.max_participants) {
      return res.status(400).json({
        status: "error",
        message: "Chat odası dolu",
      });
    }

    // Check if user is already a participant
    const participantCheck = await query(
      `
      SELECT cp.id FROM chat_participants cp
      WHERE cp.room_id = $1 AND cp.user_id = $2
    `,
      [roomId, customerId]
    );

    if (participantCheck.rows.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Zaten bu odanın katılımcısısınız",
      });
    }

    // Get user's role
    const userResult = await query(
      `SELECT role FROM users WHERE customer_id = $1`,
      [customerId]
    );

    const userRole = userResult.rows[0].role;
    let participantRole = "participant";

    // Map user roles to chat participant roles
    switch (userRole) {
      case "advertiser":
        participantRole = "advertiser";
        break;
      case "editor":
        participantRole = "editor";
        break;
      case "admin":
      case "super_admin":
        participantRole = "admin";
        break;
      default:
        participantRole = "participant";
    }

    // Add user to room
    await query(
      `
      INSERT INTO chat_participants (room_id, user_id, role, is_online)
      VALUES ($1, $2, $3, true)
    `,
      [roomId, customerId, participantRole]
    );

    res.json({
      status: "success",
      message: "Chat odasına başarıyla katıldınız",
    });
  } catch (error) {
    console.error("Join room error:", error);
    res.status(500).json({
      status: "error",
      message: "Odaya katılırken bir hata oluştu",
    });
  }
});

// @route   POST /api/chat/rooms/:roomId/leave
// @desc    Leave a chat room
// @access  Private
router.post("/rooms/:roomId/leave", authenticateChatAdmin, async (req, res) => {
  try {
    const { roomId } = req.params;
    const customerId = req.user.customer_id;

    // Check if user is a participant
    const participantCheck = await query(
      `
      SELECT cp.role, cr.created_by
      FROM chat_participants cp
      INNER JOIN chat_rooms cr ON cp.room_id = cr.id
      WHERE cp.room_id = $1 AND cp.user_id = $2
    `,
      [roomId, customerId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Bu odanın katılımcısı değilsiniz",
      });
    }

    const participant = participantCheck.rows[0];

    // Room owner cannot leave their own room
    if (participant.role === "owner") {
      return res.status(400).json({
        status: "error",
        message: "Oda sahibi kendi odasından ayrılamaz",
      });
    }

    // Remove user from room
    await query(
      `
      DELETE FROM chat_participants 
      WHERE room_id = $1 AND user_id = $2
    `,
      [roomId, customerId]
    );

    res.json({
      status: "success",
      message: "Chat odasından başarıyla ayrıldınız",
    });
  } catch (error) {
    console.error("Leave room error:", error);
    res.status(500).json({
      status: "error",
      message: "Odadan ayrılırken bir hata oluştu",
    });
  }
});

// @route   POST /api/chat/rooms/:roomId/participants/:userId/remove
// @desc    Remove a participant from chat room (Admin/Owner only)
// @access  Private
router.post(
  "/rooms/:roomId/participants/:userId/remove",
  authenticateToken,
  async (req, res) => {
    try {
      const { roomId, userId } = req.params;
      const customerId = req.user.customer_id;

      // Check if user has admin/owner role
      const userRoleCheck = await query(
        `
      SELECT cp.role
      FROM chat_participants cp
      WHERE cp.room_id = $1 AND cp.user_id = $2
    `,
        [roomId, customerId]
      );

      if (
        userRoleCheck.rows.length === 0 ||
        (userRoleCheck.rows[0].role !== "admin" &&
          userRoleCheck.rows[0].role !== "owner")
      ) {
        return res.status(403).json({
          status: "error",
          message: "Bu işlem için yetkiniz yok",
        });
      }

      // Check if target user is a participant
      const targetCheck = await query(
        `
      SELECT cp.role
      FROM chat_participants cp
      WHERE cp.room_id = $1 AND cp.user_id = $2
    `,
        [roomId, userId]
      );

      if (targetCheck.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Kullanıcı bu odanın katılımcısı değil",
        });
      }

      // Cannot remove owner
      if (targetCheck.rows[0].role === "owner") {
        return res.status(400).json({
          status: "error",
          message: "Oda sahibi kaldırılamaz",
        });
      }

      // Remove user from room
      await query(
        `
      DELETE FROM chat_participants 
      WHERE room_id = $1 AND user_id = $2
    `,
        [roomId, userId]
      );

      res.json({
        status: "success",
        message: "Kullanıcı odadan kaldırıldı",
      });
    } catch (error) {
      console.error("Remove participant error:", error);
      res.status(500).json({
        status: "error",
        message: "Kullanıcı kaldırılırken bir hata oluştu",
      });
    }
  }
);

// Proxy endpoint for media files (bypasses CORS)
router.get(
  "/media/proxy/:filename",
  authenticateChatAdmin,
  async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, "../uploads/chat-media", filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: "error",
          message: "Dosya bulunamadı",
        });
      }

      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if ([".mp4", ".webm", ".ogg"].includes(ext)) {
        res.setHeader("Content-Type", "video/mp4");
      }

      res.setHeader("Cache-Control", "public, max-age=31536000");

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Media proxy error:", error);
      res.status(500).json({
        status: "error",
        message: "Dosya yüklenirken hata oluştu",
      });
    }
  }
);

// Get room media files (all users in a room)
router.get("/media/room/:roomId", authenticateChatAdmin, async (req, res) => {
  try {
    console.log("🔍 Chat Room Media API Debug:", {
      roomId: req.params.roomId,
      user: req.user,
      headers: req.headers.authorization ? "var" : "yok",
      query: req.query,
    });

    const { roomId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!roomId || isNaN(roomId)) {
      return res.status(400).json({
        status: "error",
        message: "Geçersiz oda ID'si",
      });
    }

    // Check if room exists
    const roomQuery =
      "SELECT id, room_name, room_description FROM chat_rooms WHERE id = $1";
    const roomResult = await query(roomQuery, [roomId]);

    if (roomResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Chat odası bulunamadı",
      });
    }

    const room = roomResult.rows[0];

    // Get all users who have sent messages in this room (only customers)
    const usersQuery = `
      SELECT DISTINCT 
        u.customer_id as id,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        u.role,
        COUNT(cm.id) as message_count,
        MAX(cm.created_at) as last_message_at
      FROM users u
      INNER JOIN chat_messages cm ON u.customer_id = cm.sender_id
      WHERE cm.room_id = $1 AND u.role = 'customer'
      GROUP BY u.customer_id, u.first_name, u.last_name, u.email, u.company, u.role
      ORDER BY last_message_at DESC
    `;
    const usersResult = await query(usersQuery, [roomId]);
    console.log("🔍 Debug - Room users:", usersResult.rows);

    // Get all media messages from this room
    const offset = (page - 1) * limit;
    const mediaQuery = `
      SELECT
        cm.id,
        cm.file_name,
        cm.file_url,
        cm.file_size,
        cm.file_type,
        cm.message_type,
        cm.created_at,
        cm.room_id,
        cm.sender_id,
        u.first_name,
        u.last_name,
        u.email
      FROM chat_messages cm
      INNER JOIN users u ON cm.sender_id = u.customer_id
      WHERE cm.room_id = $1
        AND (cm.message_type IN ('image', 'video') OR cm.file_url IS NOT NULL)
        AND cm.file_url IS NOT NULL
        AND cm.file_url != ''
      ORDER BY cm.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const mediaResult = await query(mediaQuery, [roomId, limit, offset]);
    console.log("🔍 Debug - Room media messages:", mediaResult.rows);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM chat_messages
      WHERE room_id = $1
        AND (message_type IN ('image', 'video') OR file_url IS NOT NULL)
        AND file_url IS NOT NULL
        AND file_url != ''
    `;
    const countResult = await query(countQuery, [roomId]);
    const total = parseInt(countResult.rows[0].total);

    const media = mediaResult.rows.map((row) => {
      const fullUrl = `${req.protocol}://${req.get("host")}${row.file_url}`;

      return {
        id: row.id,
        file_name: row.file_name,
        file_url: row.file_url,
        file_size: row.file_size,
        file_type: row.file_type,
        message_type: row.message_type,
        created_at: row.created_at,
        room_id: row.room_id,
        sender_id: row.sender_id,
        sender_name: `${row.first_name} ${row.last_name}`,
        sender_email: row.email,
        full_url: fullUrl,
      };
    });

    res.json({
      status: "success",
      data: {
        room: {
          id: room.id,
          room_name: room.room_name,
          room_description: room.room_description,
        },
        users: usersResult.rows.map((user) => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          company: user.company || null,
          full_name: `${user.first_name} ${user.last_name}`,
          message_count: parseInt(user.message_count),
          last_message_at: user.last_message_at,
        })),
        media,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get room media error:", error);
    res.status(500).json({
      status: "error",
      message: "Oda medya dosyaları alınırken bir hata oluştu",
    });
  }
});

// Get user media files
router.get("/media/user/:userId", authenticateChatAdmin, async (req, res) => {
  try {
    console.log("🔍 Chat Media API Debug:", {
      userId: req.params.userId,
      user: req.user,
      headers: req.headers.authorization ? "var" : "yok",
      query: req.query,
    });

    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate userId
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        status: "error",
        message: "Geçersiz kullanıcı ID'si",
      });
    }

    // Get user info
    const userQuery =
      "SELECT customer_id as id, first_name, last_name, email FROM users WHERE customer_id = $1";
    const userResult = await query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Kullanıcı bulunamadı",
      });
    }

    const user = userResult.rows[0];

    // Get media messages for this user
    const offset = (page - 1) * limit;
    const mediaQuery = `
        SELECT 
          id,
          file_name,
          file_url,
          file_size,
          file_type,
          message_type,
          created_at,
          room_id
        FROM chat_messages 
        WHERE sender_id = $1 
          AND (message_type IN ('image', 'video') OR file_url IS NOT NULL)
          AND file_url IS NOT NULL
          AND file_url != ''
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;

    // Debug: Önce tüm mesajları kontrol et
    const debugQuery = `
        SELECT id, sender_id, message_type, file_url, file_name, created_at
        FROM chat_messages 
        WHERE sender_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `;
    const debugResult = await query(debugQuery, [userId]);
    console.log("🔍 Debug - Tüm mesajlar:", debugResult.rows);

    // Debug: Tüm chat_messages tablosundaki sender_id'leri kontrol et
    const allMessagesQuery = `
        SELECT DISTINCT sender_id, COUNT(*) as message_count
        FROM chat_messages 
        GROUP BY sender_id
        ORDER BY sender_id
      `;
    const allMessagesResult = await query(allMessagesQuery);
    console.log("🔍 Debug - Tüm sender_id'ler:", allMessagesResult.rows);

    // Debug: Tüm mesajları kontrol et (file_url olanlar)
    const allMediaQuery = `
        SELECT id, sender_id, message_type, file_url, file_name, created_at
        FROM chat_messages 
        WHERE file_url IS NOT NULL AND file_url != ''
        ORDER BY created_at DESC
        LIMIT 10
      `;
    const allMediaResult = await query(allMediaQuery);
    console.log("🔍 Debug - Tüm medya mesajları:", allMediaResult.rows);

    // Debug: Kullanıcı ID'si 1 için test
    const testUser1Query = `
        SELECT id, sender_id, message_type, file_url, file_name, created_at
        FROM chat_messages 
        WHERE sender_id = 1 AND file_url IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 5
      `;
    const testUser1Result = await query(testUser1Query);
    console.log("🔍 Debug - User ID 1 medya mesajları:", testUser1Result.rows);

    // Debug: Kullanıcı ID'si 12 için test
    const testUser12Query = `
        SELECT id, sender_id, message_type, file_url, file_name, created_at
        FROM chat_messages 
        WHERE sender_id = 12 AND file_url IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 5
      `;
    const testUser12Result = await query(testUser12Query);
    console.log(
      "🔍 Debug - User ID 12 medya mesajları:",
      testUser12Result.rows
    );

    // Debug: Bu chat room'da hangi kullanıcılar mesaj atmış?
    const roomMessagesQuery = `
      SELECT DISTINCT sender_id, COUNT(*) as message_count, 
             MAX(created_at) as last_message
      FROM chat_messages
      WHERE room_id = 1
      GROUP BY sender_id
      ORDER BY last_message DESC
    `;
    const roomMessagesResult = await query(roomMessagesQuery);
    console.log(
      "🔍 Debug - Chat Room 1'deki kullanıcılar:",
      roomMessagesResult.rows
    );

    // Debug: Bu chat room'daki medya mesajları
    const roomMediaQuery = `
      SELECT id, sender_id, message_type, file_url, file_name, created_at
      FROM chat_messages
      WHERE room_id = 1 AND file_url IS NOT NULL AND file_url != ''
      ORDER BY created_at DESC
      LIMIT 10
    `;
    const roomMediaResult = await query(roomMediaQuery);
    console.log(
      "🔍 Debug - Chat Room 1 medya mesajları:",
      roomMediaResult.rows
    );

    const mediaResult = await query(mediaQuery, [userId, limit, offset]);
    console.log("🔍 Debug - Media sorgusu sonucu:", mediaResult.rows);

    // Get total count
    const countQuery = `
        SELECT COUNT(*) as total
        FROM chat_messages 
        WHERE sender_id = $1 
          AND message_type IN ('image', 'video')
          AND file_url IS NOT NULL
      `;
    const countResult = await query(countQuery, [userId]);
    console.log("🔍 Debug - Toplam sayı:", countResult.rows[0]);
    const total = parseInt(countResult.rows[0].total);

    // Format media data
    const media = mediaResult.rows.map((row) => ({
      id: row.id,
      file_name: row.file_name,
      file_url: row.file_url,
      file_size: row.file_size,
      file_type: row.file_type,
      message_type: row.message_type,
      created_at: row.created_at,
      room_id: row.room_id,
      // Add full URL for frontend
      full_url: `${req.protocol}://${req.get("host")}${row.file_url}`,
    }));

    res.json({
      status: "success",
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          full_name: `${user.first_name} ${user.last_name}`,
        },
        media,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          total_pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user media error:", error);
    res.status(500).json({
      status: "error",
      message: "Medya dosyaları alınırken bir hata oluştu",
    });
  }
});

// @route   POST /api/chat/requests
// @desc    Create a chat request (uses tokens)
// @access  Private
router.post("/requests", async (req, res) => {
  try {
    const { room_id, description } = req.body;
    const token_cost = 100; // Sabit token maliyeti

    // Authentication logic
    let user = null;
    let isChatAdmin = false;

    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await query(
          "SELECT customer_id, first_name, last_name, email, company, phone, role, is_active FROM users WHERE customer_id = $1",
          [decoded.customer_id]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
          user = result.rows[0];
          const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];
          isChatAdmin = allowedRoles.includes(user.role);
        }
      }
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const customerId = user.customer_id;

    if (!room_id || !description) {
      return res.status(400).json({
        status: "error",
        message: "Oda ID ve açıklama gereklidir",
      });
    }

    // Token maliyeti sabit 100

    // Check if user has access to this room
    const accessCheck = await query(
      `SELECT 1 FROM chat_participants WHERE room_id = $1 AND user_id = $2`,
      [room_id, customerId]
    );

    if (accessCheck.rows.length === 0 && !isChatAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Bu odaya erişim yetkiniz yok",
      });
    }

    // Check if user has enough tokens
    const tokenResult = await query(
      `SELECT total_tokens, used_tokens, remaining_tokens
       FROM user_tokens 
       WHERE customer_id = $1`,
      [customerId]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Token bilgileri bulunamadı",
      });
    }

    const currentTokens = tokenResult.rows[0];

    if (currentTokens.remaining_tokens < token_cost) {
      return res.status(400).json({
        status: "error",
        message: `Yetersiz token. Mevcut token: ${currentTokens.remaining_tokens}, Gerekli: ${token_cost}`,
      });
    }

    // Start transaction
    await query("BEGIN");

    try {
      // Create request
      const requestResult = await query(
        `INSERT INTO chat_requests (room_id, user_id, description, token_cost, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [room_id, customerId, description, token_cost]
      );

      // Update used tokens
      await query(
        `UPDATE user_tokens 
         SET used_tokens = used_tokens + $1
         WHERE customer_id = $2`,
        [token_cost, customerId]
      );

      // Record transaction
      await query(
        `INSERT INTO token_transactions (customer_id, transaction_type, amount, description)
         VALUES ($1, 'usage', $2, $3)`,
        [customerId, token_cost, `Chat isteği: ${description.substring(0, 50)}`]
      );

      await query("COMMIT");

      // Get request with user info
      const requestWithUser = await query(
        `SELECT 
          cr.id,
          cr.room_id,
          cr.user_id,
          cr.description,
          cr.token_cost,
          cr.status,
          cr.created_at,
          cr.updated_at,
          cr.completed_at,
          cr.completed_by,
          u.first_name,
          u.last_name,
          u.email,
          u.company
         FROM chat_requests cr
         INNER JOIN users u ON cr.user_id = u.customer_id
         WHERE cr.id = $1`,
        [requestResult.rows[0].id]
      );

      res.json({
        status: "success",
        message: "İstek başarıyla oluşturuldu",
        data: {
          request: requestWithUser.rows[0],
        },
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({
      status: "error",
      message: "İstek oluşturulurken bir hata oluştu",
    });
  }
});

// @route   GET /api/chat/requests/:roomId
// @desc    Get requests for a specific room
// @access  Private
router.get("/requests/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    // Authentication logic
    let user = null;
    let isChatAdmin = false;

    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await query(
          "SELECT customer_id, first_name, last_name, email, company, phone, role, is_active FROM users WHERE customer_id = $1",
          [decoded.customer_id]
        );

        if (result.rows.length > 0 && result.rows[0].is_active) {
          user = result.rows[0];
          const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];
          isChatAdmin = allowedRoles.includes(user.role);
        }
      }
    } catch (error) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const customerId = user.customer_id;

    // Check if user has access to this room
    const accessCheck = await query(
      `SELECT 1 FROM chat_participants WHERE room_id = $1 AND user_id = $2`,
      [roomId, customerId]
    );

    if (accessCheck.rows.length === 0 && !isChatAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Bu odaya erişim yetkiniz yok",
      });
    }

    const result = await query(
      `SELECT 
        cr.id,
        cr.room_id,
        cr.user_id,
        cr.description,
        cr.token_cost,
        cr.status,
        cr.created_at,
        cr.updated_at,
        cr.completed_at,
        cr.completed_by,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        completed_by_user.first_name as completed_by_first_name,
        completed_by_user.last_name as completed_by_last_name
       FROM chat_requests cr
       INNER JOIN users u ON cr.user_id = u.customer_id
       LEFT JOIN users completed_by_user ON cr.completed_by = completed_by_user.customer_id
       WHERE cr.room_id = $1
       ORDER BY cr.created_at DESC`,
      [roomId]
    );

    res.json({
      status: "success",
      data: {
        requests: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({
      status: "error",
      message: "İstekler alınırken bir hata oluştu",
    });
  }
});

// @route   PUT /api/chat/requests/:requestId/complete
// @desc    Mark request as completed (Admin only)
// @access  Private
router.put("/requests/:requestId/complete", authenticateChatAdmin, async (req, res) => {
  try {
    const { requestId } = req.params;
    const customerId = req.user.customer_id;

    const result = await query(
      `UPDATE chat_requests 
       SET status = 'completed', 
           completed_at = CURRENT_TIMESTAMP,
           completed_by = $1
       WHERE id = $2
       RETURNING *`,
      [customerId, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "İstek bulunamadı",
      });
    }

    // Get request with user info
    const requestWithUser = await query(
      `SELECT 
        cr.id,
        cr.room_id,
        cr.user_id,
        cr.description,
        cr.token_cost,
        cr.status,
        cr.created_at,
        cr.updated_at,
        cr.completed_at,
        cr.completed_by,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        completed_by_user.first_name as completed_by_first_name,
        completed_by_user.last_name as completed_by_last_name
       FROM chat_requests cr
       INNER JOIN users u ON cr.user_id = u.customer_id
       LEFT JOIN users completed_by_user ON cr.completed_by = completed_by_user.customer_id
       WHERE cr.id = $1`,
      [requestId]
    );

    res.json({
      status: "success",
      message: "İstek tamamlandı olarak işaretlendi",
      data: {
        request: requestWithUser.rows[0],
      },
    });
  } catch (error) {
    console.error("Complete request error:", error);
    res.status(500).json({
      status: "error",
      message: "İstek tamamlanırken bir hata oluştu",
    });
  }
});

// @route   GET /api/chat/requests/all
// @desc    Get all requests (Admin only)
// @access  Private
router.get("/requests/all", authenticateChatAdmin, async (req, res) => {
  try {
    const { roomId, status } = req.query;

    let queryText = `
      SELECT 
        cr.id,
        cr.room_id,
        cr.user_id,
        cr.description,
        cr.token_cost,
        cr.status,
        cr.created_at,
        cr.updated_at,
        cr.completed_at,
        cr.completed_by,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        completed_by_user.first_name as completed_by_first_name,
        completed_by_user.last_name as completed_by_last_name,
        cr_room.room_name
       FROM chat_requests cr
       INNER JOIN users u ON cr.user_id = u.customer_id
       LEFT JOIN users completed_by_user ON cr.completed_by = completed_by_user.customer_id
       LEFT JOIN chat_rooms cr_room ON cr.room_id = cr_room.id
       WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    if (roomId) {
      queryText += ` AND cr.room_id = $${paramIndex}`;
      queryParams.push(roomId);
      paramIndex++;
    }

    if (status) {
      queryText += ` AND cr.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    queryText += ` ORDER BY cr.created_at DESC`;

    const result = await query(queryText, queryParams);

    res.json({
      status: "success",
      data: {
        requests: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error) {
    console.error("Get all requests error:", error);
    res.status(500).json({
      status: "error",
      message: "İstekler alınırken bir hata oluştu",
    });
  }
});

module.exports = router;
