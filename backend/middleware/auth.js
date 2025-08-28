const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access token required",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const result = await query(
      "SELECT customer_id, first_name, last_name, email, company, phone, is_active FROM users WHERE customer_id = $1",
      [decoded.customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token - user not found",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        status: "error",
        message: "Account is deactivated",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: "error",
      message: "Authentication error",
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      "SELECT customer_id, first_name, last_name, email, company, phone, is_active FROM users WHERE customer_id = $1",
      [decoded.customer_id]
    );

    if (result.rows.length > 0 && result.rows[0].is_active) {
      req.user = result.rows[0];
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Admin access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      "SELECT customer_id, first_name, last_name, email, company, phone, role, is_active FROM users WHERE customer_id = $1",
      [decoded.customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid admin token - user not found",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        status: "error",
        message: "Admin account is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid admin token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Admin token expired",
      });
    }

    console.error("Admin auth middleware error:", error);
    return res.status(500).json({
      status: "error",
      message: "Admin authentication error",
    });
  }
};

// Role authorization middleware
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // For now, we'll allow all authenticated users
      // In a real application, you'd check the user's role from the database
      if (!req.user) {
        return res.status(403).json({
          status: "error",
          message: "Access denied - authentication required",
        });
      }

      // Get user role from the database
      const userRole = req.user.role || "customer";

      if (allowedRoles.includes(userRole)) {
        next();
      } else {
        return res.status(403).json({
          status: "error",
          message: "Access denied - insufficient permissions",
        });
      }
    } catch (error) {
      console.error("Role authorization error:", error);
      return res.status(500).json({
        status: "error",
        message: "Authorization error",
      });
    }
  };
};

// Chat admin authentication middleware (includes role)
const authenticateChatAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log("🔍 Backend Chat Admin Debug:", {
      authHeader: authHeader ? `${authHeader.substring(0, 30)}...` : "null",
      token: token ? `${token.substring(0, 20)}...` : "null",
      url: req.url,
      method: req.method,
    });

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Chat admin access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      "SELECT customer_id, first_name, last_name, email, company, phone, role, is_active FROM users WHERE customer_id = $1",
      [decoded.customer_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid chat admin token - user not found",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        status: "error",
        message: "Chat admin account is deactivated",
      });
    }

    // Check if user has chat admin role
    const allowedRoles = ["advertiser", "editor", "admin", "super_admin"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Access denied - chat admin role required",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid chat admin token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Chat admin token expired",
      });
    }

    console.error("Chat admin auth middleware error:", error);
    return res.status(500).json({
      status: "error",
      message: "Chat admin authentication error",
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authenticateAdmin,
  authenticateChatAdmin,
  authorizeRole,
};
