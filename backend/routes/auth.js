const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { authenticateAdmin, authorizeRole } = require("../middleware/adminAuth");
const {
  registerValidation,
  loginValidation,
  webFormValidation,
  mobileFormValidation,
  handleValidationErrors,
} = require("../utils/validation");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  registerValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, company, phone } = req.body;

      // Check if user already exists
      const existingUser = await query(
        "SELECT customer_id FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "Bu e-posta adresi zaten kayıtlı",
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const result = await query(
        `INSERT INTO users (first_name, last_name, email, password_hash, company, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING customer_id, first_name, last_name, email, company, phone, created_at`,
        [
          firstName,
          lastName,
          email,
          passwordHash,
          company || null,
          phone || null,
        ]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { customer_id: user.customer_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        status: "success",
        message: "Kullanıcı başarıyla oluşturuldu",
        data: {
          user: {
            customer_id: user.customer_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            company: user.company,
            phone: user.phone,
            created_at: user.created_at,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        status: "error",
        message: "Kayıt işlemi sırasında bir hata oluştu",
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  loginValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const result = await query(
        "SELECT customer_id, first_name, last_name, email, password_hash, company, phone, is_active FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          status: "error",
          message: "Geçersiz e-posta veya şifre",
        });
      }

      const user = result.rows[0];

      // Check if account is active
      if (!user.is_active) {
        return res.status(401).json({
          status: "error",
          message: "Hesabınız deaktif edilmiş",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          status: "error",
          message: "Geçersiz e-posta veya şifre",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { customer_id: user.customer_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        status: "success",
        message: "Giriş başarılı",
        data: {
          user: {
            customer_id: user.customer_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            company: user.company,
            phone: user.phone,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        status: "error",
        message: "Giriş işlemi sırasında bir hata oluştu",
      });
    }
  }
);

// @route   POST /api/auth/web-form
// @desc    Submit web development form
// @access  Public (but can be linked to user if authenticated)
router.post(
  "/web-form",
  webFormValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, surname, email, phone, projectDescription, budget } =
        req.body;

      // Check if user is authenticated (optional)
      let customerId = null;
      if (req.headers.authorization) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          customerId = decoded.customer_id;
        } catch (error) {
          // Continue without authentication
        }
      }

      // Insert web form data
      const result = await query(
        `INSERT INTO web_forms (customer_id, name, surname, email, phone, project_description, budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
        [
          customerId,
          name,
          surname,
          email,
          phone,
          projectDescription,
          budget || null,
        ]
      );

      res.status(201).json({
        status: "success",
        message: "Web geliştirme formunuz başarıyla gönderildi",
        data: {
          form_id: result.rows[0].id,
          created_at: result.rows[0].created_at,
        },
      });
    } catch (error) {
      console.error("Web form submission error:", error);
      res.status(500).json({
        status: "error",
        message: "Form gönderimi sırasında bir hata oluştu",
      });
    }
  }
);

// @route   POST /api/auth/mobile-form
// @desc    Submit mobile app form
// @access  Public (but can be linked to user if authenticated)
router.post(
  "/mobile-form",
  mobileFormValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, surname, email, phone, projectDescription, budget } =
        req.body;

      // Check if user is authenticated (optional)
      let customerId = null;
      if (req.headers.authorization) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          customerId = decoded.customer_id;
        } catch (error) {
          // Continue without authentication
        }
      }

      // Insert mobile form data
      const result = await query(
        `INSERT INTO mobile_forms (customer_id, name, surname, email, phone, project_description, budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
        [
          customerId,
          name,
          surname,
          email,
          phone,
          projectDescription,
          budget || null,
        ]
      );

      res.status(201).json({
        status: "success",
        message: "Mobil uygulama formunuz başarıyla gönderildi",
        data: {
          form_id: result.rows[0].id,
          created_at: result.rows[0].created_at,
        },
      });
    } catch (error) {
      console.error("Mobile form submission error:", error);
      res.status(500).json({
        status: "error",
        message: "Form gönderimi sırasında bir hata oluştu",
      });
    }
  }
);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      status: "success",
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Profil bilgileri alınırken bir hata oluştu",
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, company, phone } = req.body;

    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           company = $3,
           phone = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE customer_id = $5
       RETURNING customer_id, first_name, last_name, email, company, phone, updated_at`,
      [first_name, last_name, company, phone, req.user.customer_id]
    );

    res.json({
      status: "success",
      message: "Profil başarıyla güncellendi",
      data: {
        user: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      status: "error",
      message: "Profil güncellenirken bir hata oluştu",
    });
  }
});

// @route   POST /api/auth/survey
// @desc    Submit survey answers and mark as completed
// @access  Private
router.post("/survey", authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const customerId = req.user.customer_id;

    // Check if user already has a survey status
    const existingStatus = await query(
      "SELECT id FROM survey_status WHERE customer_id = $1",
      [customerId]
    );

    if (existingStatus.rows.length > 0) {
      // Update existing status with answers
      await query(
        `UPDATE survey_status 
         SET is_completed = true, answers = $1, completed_at = CURRENT_TIMESTAMP
         WHERE customer_id = $2`,
        [JSON.stringify(answers), customerId]
      );
    } else {
      // Insert new status with answers
      await query(
        `INSERT INTO survey_status (customer_id, is_completed, answers, completed_at)
         VALUES ($1, true, $2, CURRENT_TIMESTAMP)`,
        [customerId, JSON.stringify(answers)]
      );
    }

    res.status(201).json({
      status: "success",
      message: "Anket cevaplarınız başarıyla kaydedildi",
    });
  } catch (error) {
    console.error("Survey submission error:", error);
    res.status(500).json({
      status: "error",
      message: "Anket gönderimi sırasında bir hata oluştu",
    });
  }
});

// @route   GET /api/auth/survey
// @desc    Get user's survey status and answers
// @access  Private
router.get("/survey", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    const result = await query(
      "SELECT is_completed, answers, completed_at FROM survey_status WHERE customer_id = $1",
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Henüz anket doldurmamışsınız",
      });
    }

    res.json({
      status: "success",
      data: {
        survey: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Survey retrieval error:", error);
    res.status(500).json({
      status: "error",
      message: "Anket bilgileri alınırken bir hata oluştu",
    });
  }
});

// @route   GET /api/auth/surveys/all
// @desc    Get all survey statuses and answers (Survey Admin only)
// @access  Private
router.get(
  "/surveys/all",
  authenticateAdmin,
  authorizeRole(["survey_admin", "super_admin"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT 
        ss.id,
        ss.is_completed,
        ss.answers,
        ss.completed_at,
        ss.created_at,
        ss.updated_at,
        u.customer_id,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        u.phone
      FROM survey_status ss
      JOIN users u ON ss.customer_id = u.customer_id
      ORDER BY ss.completed_at DESC NULLS LAST, ss.created_at DESC
    `);

      res.json({
        status: "success",
        data: {
          surveys: result.rows,
          total: result.rows.length,
        },
      });
    } catch (error) {
      console.error("All surveys retrieval error:", error);
      res.status(500).json({
        status: "error",
        message: "Anket bilgileri alınırken bir hata oluştu",
      });
    }
  }
);

// @route   GET /api/auth/customers/all
// @desc    Get all customers (Super Admin only)
// @access  Private
router.get(
  "/customers/all",
  authenticateAdmin,
  authorizeRole(["super_admin"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT 
        customer_id,
        first_name,
        last_name,
        email,
        company,
        phone,
        is_active,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);

      res.json({
        status: "success",
        data: {
          customers: result.rows,
          total: result.rows.length,
        },
      });
    } catch (error) {
      console.error("All customers retrieval error:", error);
      res.status(500).json({
        status: "error",
        message: "Müşteri bilgileri alınırken bir hata oluştu",
      });
    }
  }
);

// @route   GET /api/auth/forms/web/all
// @desc    Get all web forms (Forms Admin only)
// @access  Private
router.get(
  "/forms/web/all",
  authenticateAdmin,
  authorizeRole(["forms_admin", "super_admin"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT 
        wf.id,
        wf.name,
        wf.surname,
        wf.email,
        wf.phone,
        wf.project_description,
        wf.budget,
        wf.status,
        wf.created_at,
        wf.updated_at,
        u.customer_id,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.company
      FROM web_forms wf
      LEFT JOIN users u ON wf.customer_id = u.customer_id
      ORDER BY wf.created_at DESC
    `);

      res.json({
        status: "success",
        data: {
          forms: result.rows,
          total: result.rows.length,
        },
      });
    } catch (error) {
      console.error("Web forms retrieval error:", error);
      res.status(500).json({
        status: "error",
        message: "Web form bilgileri alınırken bir hata oluştu",
      });
    }
  }
);

// @route   GET /api/auth/forms/mobile/all
// @desc    Get all mobile forms (Forms Admin only)
// @access  Private
router.get(
  "/forms/mobile/all",
  authenticateAdmin,
  authorizeRole(["forms_admin", "super_admin"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT 
        mf.id,
        mf.name,
        mf.surname,
        mf.email,
        mf.phone,
        mf.project_description,
        mf.budget,
        mf.status,
        mf.created_at,
        mf.updated_at,
        u.customer_id,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.company
      FROM mobile_forms mf
      LEFT JOIN users u ON mf.customer_id = u.customer_id
      ORDER BY mf.created_at DESC
    `);

      res.json({
        status: "success",
        data: {
          forms: result.rows,
          total: result.rows.length,
        },
      });
    } catch (error) {
      console.error("Mobile forms retrieval error:", error);
      res.status(500).json({
        status: "error",
        message: "Mobil form bilgileri alınırken bir hata oluştu",
      });
    }
  }
);

// @route   PUT /api/auth/forms/web/:id/status
// @desc    Update web form status (Forms Admin only)
// @access  Private
router.put(
  "/forms/web/:id/status",
  authenticateAdmin,
  authorizeRole(["forms_admin", "super_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !["beklemede", "onaylandı", "görüşüldü", "reddedildi"].includes(status)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Geçersiz durum değeri",
        });
      }

      const result = await query(
        `UPDATE web_forms 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Form bulunamadı",
        });
      }

      res.json({
        status: "success",
        message: "Form durumu başarıyla güncellendi",
        data: {
          form: result.rows[0],
        },
      });
    } catch (error) {
      console.error("Web form status update error:", error);
      res.status(500).json({
        status: "error",
        message: "Form durumu güncellenirken bir hata oluştu",
      });
    }
  }
);

// @route   PUT /api/auth/forms/mobile/:id/status
// @desc    Update mobile form status (Forms Admin only)
// @access  Private
router.put(
  "/forms/mobile/:id/status",
  authenticateAdmin,
  authorizeRole(["forms_admin", "super_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (
        !["beklemede", "onaylandı", "görüşüldü", "reddedildi"].includes(status)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Geçersiz durum değeri",
        });
      }

      const result = await query(
        `UPDATE mobile_forms 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Form bulunamadı",
        });
      }

      res.json({
        status: "success",
        message: "Form durumu başarıyla güncellendi",
        data: {
          form: result.rows[0],
        },
      });
    } catch (error) {
      console.error("Mobile form status update error:", error);
      res.status(500).json({
        status: "error",
        message: "Form durumu güncellenirken bir hata oluştu",
      });
    }
  }
);

module.exports = router;
