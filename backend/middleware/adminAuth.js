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

    // Admin token kontrolü
    const adminTokens = {
      admin_token_123: { role: "survey_admin", username: "admin" },
      forms_admin_token_456: { role: "forms_admin", username: "forms_admin" },
      super_admin_token_789: { role: "super_admin", username: "super_admin" },
    };

    if (adminTokens[token]) {
      req.admin = adminTokens[token];
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

// Role-based authorization middleware
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        status: "error",
        message: "Admin authentication gerekli",
      });
    }

    if (allowedRoles.includes(req.admin.role)) {
      next();
    } else {
      return res.status(403).json({
        status: "error",
        message: "Bu işlem için yetkiniz bulunmuyor",
      });
    }
  };
};

module.exports = { authenticateAdmin, authorizeRole };
