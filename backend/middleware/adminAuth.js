const jwt = require("jsonwebtoken");

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Admin token gerekli",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Admin token gerekli",
      });
    }

    // Admin token kontrolü (basit kontrol)
    if (token === "admin_token_123") {
      req.admin = { isAdmin: true };
      next();
    } else {
      return res.status(401).json({
        status: "error",
        message: "Geçersiz admin token",
      });
    }
  } catch (error) {
    console.error("Admin auth error:", error);
    return res.status(401).json({
      status: "error",
      message: "Admin authentication hatası",
    });
  }
};

module.exports = { authenticateAdmin };
