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
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_"); // Güvenli dosya adı
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
        creator.first_name as creator_first_name,
        creator.last_name as creator_last_name,
        creator.email as creator_email,
        COUNT(cp.user_id) as participant_count
      FROM chat_rooms cr
      LEFT JOIN users creator ON cr.created_by = creator.customer_id
      LEFT JOIN chat_participants cp ON cr.id = cp.room_id
      GROUP BY cr.id, creator.first_name, creator.last_name, creator.email
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
    const fileName = req.file.originalname;
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

module.exports = router;
