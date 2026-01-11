const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
require("dotenv").config({ path: "./config.env" });

// Import routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");

// Import database connection
const { connectDB } = require("./config/database");

// Import socket.io
const { initializeSocket } = require("./socket");

const app = express();

// Middleware
// app.use(helmet()); // CORS ile çakışabilir, devre dışı bırakıldı
app.use(morgan("combined"));
app.use(
  cors({
    origin: "*", // Tüm origin'lere izin ver
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Static files - medya dosyaları için (CORS ile)
app.use(
  "/uploads",
  (req, res, next) => {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Content-Type headers for different file types
    if (req.path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.header("Content-Type", "image/jpeg");
    } else if (req.path.match(/\.(mp4|webm|ogg)$/i)) {
      res.header("Content-Type", "video/mp4");
    }

    // Cache headers
    res.header("Cache-Control", "public, max-age=31536000");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    next();
  },
  express.static("uploads", {
    setHeaders: (res, path) => {
      // Additional headers for static files
      res.header("Cross-Origin-Resource-Policy", "cross-origin");
      res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "MetaGrowths API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io
    initializeSocket(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 WebSocket server ready`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
