const jwt = require("jsonwebtoken");

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  try {
    console.log("Admin auth middleware çalışıyor...");
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth header eksik veya yanlış format");
      return res.status(401).json({
        status: "error",
        message: "Admin token gerekli",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token:", token);

    if (!token) {
      console.log("Token boş");
      return res.status(401).json({
        status: "error",
        message: "Admin token gerekli",
      });
    }

    // Admin token kontrolü (basit kontrol)
    if (token === "admin_token_123") {
      console.log("Admin token doğru, devam ediliyor...");
      req.admin = { isAdmin: true };
      next();
    } else {
      console.log("Geçersiz admin token:", token);
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
