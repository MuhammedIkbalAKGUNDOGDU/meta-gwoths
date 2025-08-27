const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { query } = require("./config/database");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userResult = await query(
        "SELECT customer_id, first_name, last_name, email FROM users WHERE customer_id = $1",
        [decoded.customer_id]
      );

      if (userResult.rows.length === 0) {
        return next(new Error("User not found"));
      }

      socket.user = userResult.rows[0];
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `User connected: ${socket.user.first_name} ${socket.user.last_name}`
    );

    // Join room
    socket.on("join_room", async (data) => {
      try {
        const { roomId } = data;

        // Check if user has access to this room
        const accessCheck = await query(
          `
          SELECT 1 FROM chat_participants 
          WHERE room_id = $1 AND user_id = $2
        `,
          [roomId, socket.user.customer_id]
        );

        if (accessCheck.rows.length === 0) {
          socket.emit("error", { message: "Access denied to this room" });
          return;
        }

        // Join the room
        socket.join(`room_${roomId}`);

        // Update user's online status
        await query(
          `
          UPDATE chat_participants 
          SET is_online = true, last_seen = CURRENT_TIMESTAMP
          WHERE room_id = $1 AND user_id = $2
        `,
          [roomId, socket.user.customer_id]
        );

        // Notify other users
        socket.to(`room_${roomId}`).emit("user_joined", {
          userId: socket.user.customer_id,
          user: {
            user_id: socket.user.customer_id,
            first_name: socket.user.first_name,
            last_name: socket.user.last_name,
            email: socket.user.email,
            is_online: true,
          },
        });

        console.log(`User ${socket.user.first_name} joined room ${roomId}`);
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Leave room
    socket.on("leave_room", async (data) => {
      try {
        const { roomId } = data;

        // Leave the room
        socket.leave(`room_${roomId}`);

        // Update user's online status
        await query(
          `
          UPDATE chat_participants 
          SET is_online = false, last_seen = CURRENT_TIMESTAMP
          WHERE room_id = $1 AND user_id = $2
        `,
          [roomId, socket.user.customer_id]
        );

        // Notify other users
        socket.to(`room_${roomId}`).emit("user_left", {
          userId: socket.user.customer_id,
        });

        console.log(`User ${socket.user.first_name} left room ${roomId}`);
      } catch (error) {
        console.error("Leave room error:", error);
      }
    });

    // Send message
    socket.on("send_message", async (data) => {
      try {
        const {
          roomId,
          messageContent,
          messageType = "text",
          replyToMessageId,
        } = data;

        // Check if user has access to this room
        const accessCheck = await query(
          `
          SELECT cp.role, cperm.permission_type
          FROM chat_participants cp
          LEFT JOIN chat_permissions cperm ON cp.room_id = cperm.room_id AND cp.user_id = cperm.user_id
          WHERE cp.room_id = $1 AND cp.user_id = $2
        `,
          [roomId, socket.user.customer_id]
        );

        if (accessCheck.rows.length === 0) {
          socket.emit("error", { message: "Access denied to this room" });
          return;
        }

        const userRole = accessCheck.rows[0].role;
        const permissionType = accessCheck.rows[0].permission_type;

        // Check if user has write permission
        if (
          userRole !== "owner" &&
          userRole !== "admin" &&
          permissionType !== "read_write" &&
          permissionType !== "admin"
        ) {
          socket.emit("error", { message: "No permission to send messages" });
          return;
        }

        // Insert message into database
        const result = await query(
          `
          INSERT INTO chat_messages (room_id, sender_id, message_type, message_content, reply_to_message_id)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `,
          [
            roomId,
            socket.user.customer_id,
            messageType,
            messageContent,
            replyToMessageId || null,
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
            u.company
          FROM chat_messages cm
          INNER JOIN users u ON cm.sender_id = u.customer_id
          WHERE cm.id = $1
        `,
          [result.rows[0].id]
        );

        // Update room's updated_at timestamp
        await query(
          `
          UPDATE chat_rooms 
          SET updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
          [roomId]
        );

        // Broadcast message to all users in the room
        io.to(`room_${roomId}`).emit(
          "receive_message",
          messageWithSender.rows[0]
        );

        console.log(
          `Message sent in room ${roomId} by ${socket.user.first_name}`
        );
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Typing indicator
    socket.on("typing", (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit("user_typing", {
        userId: socket.user.customer_id,
        userName: `${socket.user.first_name} ${socket.user.last_name}`,
      });
    });

    socket.on("stop_typing", (data) => {
      const { roomId } = data;
      socket.to(`room_${roomId}`).emit("user_stopped_typing", {
        userId: socket.user.customer_id,
      });
    });

    // Disconnect
    socket.on("disconnect", async () => {
      try {
        // Update user's online status in all rooms
        await query(
          `
          UPDATE chat_participants 
          SET is_online = false, last_seen = CURRENT_TIMESTAMP
          WHERE user_id = $1
        `,
          [socket.user.customer_id]
        );

        console.log(
          `User disconnected: ${socket.user.first_name} ${socket.user.last_name}`
        );
      } catch (error) {
        console.error("Disconnect error:", error);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
