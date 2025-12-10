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
  chatAdminValidation,
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
      const { firstName, lastName, email, password, company, phone, role } =
        req.body;

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
        `INSERT INTO users (first_name, last_name, email, password_hash, company, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING customer_id, first_name, last_name, email, company, phone, role, created_at`,
        [
          firstName,
          lastName,
          email,
          passwordHash,
          company || null,
          phone || null,
          role || "customer", // Default role is customer
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
            role: user.role,
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

      // Check survey status for the user
      const surveyResult = await query(
        "SELECT is_completed FROM survey_status WHERE customer_id = $1",
        [user.customer_id]
      );

      const hasCompletedSurvey =
        surveyResult.rows.length > 0 && surveyResult.rows[0].is_completed;

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
          survey_completed: hasCompletedSurvey,
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
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE role = 'customer'
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

// @route   PUT /api/auth/customers/:customerId/status
// @desc    Toggle customer active status (Super Admin only)
// @access  Private
router.put(
  "/customers/:customerId/status",
  authenticateAdmin,
  authorizeRole(["super_admin"]),
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== "boolean") {
        return res.status(400).json({
          status: "error",
          message: "is_active değeri boolean olmalıdır",
        });
      }

      // Check if customer exists
      const userResult = await query(
        "SELECT customer_id FROM users WHERE customer_id = $1",
        [customerId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Kullanıcı bulunamadı",
        });
      }

      // Update customer status
      const result = await query(
        `UPDATE users 
         SET is_active = $1, updated_at = CURRENT_TIMESTAMP
         WHERE customer_id = $2
         RETURNING customer_id, first_name, last_name, email, is_active`,
        [is_active, customerId]
      );

      res.json({
        status: "success",
        message: `Kullanıcı ${is_active ? "aktif" : "pasif"} olarak güncellendi`,
        data: {
          customer: result.rows[0],
        },
      });
    } catch (error) {
      console.error("Update customer status error:", error);
      res.status(500).json({
        status: "error",
        message: "Kullanıcı durumu güncellenirken bir hata oluştu",
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

// @route   POST /api/auth/subscription
// @desc    Create new subscription
// @access  Private
router.post("/subscription", authenticateToken, async (req, res) => {
  try {
    const { package_name, package_details, total_amount } = req.body;
    const customerId = req.user.customer_id;

    // Calculate end date based on package duration
    const endDate = new Date();
    const duration = package_details.duration;

    if (duration.includes("4 Ay")) {
      endDate.setMonth(endDate.getMonth() + 4);
    } else if (duration.includes("8 Ay")) {
      endDate.setMonth(endDate.getMonth() + 8);
    } else if (duration.includes("12 Ay")) {
      endDate.setMonth(endDate.getMonth() + 12);
    } else {
      // Default to 1 month
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const result = await query(
      `INSERT INTO subscriptions (customer_id, package_name, package_details, end_date, total_amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        customerId,
        package_name,
        JSON.stringify(package_details),
        endDate,
        total_amount,
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Abonelik başarıyla oluşturuldu",
      data: {
        subscription: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Subscription creation error:", error);
    res.status(500).json({
      status: "error",
      message: "Abonelik oluşturulurken bir hata oluştu",
    });
  }
});

// @route   GET /api/auth/subscription
// @desc    Get user's subscription
// @access  Private
router.get("/subscription", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    // Get subscription and user info including is_chat_page_selected
    const result = await query(
      `SELECT s.*, u.is_chat_page_selected 
       FROM subscriptions s
       LEFT JOIN users u ON s.customer_id = u.customer_id
       WHERE s.customer_id = $1 
       AND s.subscription_status = 'active' 
       AND s.end_date > CURRENT_TIMESTAMP
       ORDER BY s.created_at DESC LIMIT 1`,
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: "success",
        data: {
          subscription: null,
          is_chat_page_selected: false,
        },
        message: "Aktif abonelik bulunmuyor",
      });
    }

    res.json({
      status: "success",
      data: {
        subscription: result.rows[0],
        is_chat_page_selected: result.rows[0].is_chat_page_selected,
      },
    });
  } catch (error) {
    console.error("Subscription retrieval error:", error);
    res.status(500).json({
      status: "error",
      message: "Abonelik bilgileri alınırken bir hata oluştu",
    });
  }
});

// @route   POST /api/auth/store-setup-request
// @desc    Create store setup request
// @access  Private
router.post("/store-setup-request", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    // Check if user already has a pending request
    const existingRequest = await query(
      `SELECT * FROM store_setup_requests 
       WHERE customer_id = $1 
       AND request_status IN ('beklemede', 'onaylandı')
       ORDER BY created_at DESC LIMIT 1`,
      [customerId]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Zaten bekleyen bir mağaza kurulum isteğiniz bulunmaktadır",
      });
    }

    // Create new store setup request
    const result = await query(
      `INSERT INTO store_setup_requests (customer_id, request_status)
       VALUES ($1, $2)
       RETURNING *`,
      [customerId, "beklemede"]
    );

    res.status(201).json({
      status: "success",
      message: "Mağaza kurulum isteği başarıyla oluşturuldu",
      data: {
        request: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Store setup request creation error:", error);
    res.status(500).json({
      status: "error",
      message: "Mağaza kurulum isteği oluşturulurken bir hata oluştu",
    });
  }
});

// @route   GET /api/auth/store-setup-request
// @desc    Get user's store setup request
// @access  Private
router.get("/store-setup-request", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    const result = await query(
      `SELECT * FROM store_setup_requests 
       WHERE customer_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: "success",
        data: {
          request: null,
        },
        message: "Mağaza kurulum isteği bulunmuyor",
      });
    }

    res.json({
      status: "success",
      data: {
        request: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Store setup request retrieval error:", error);
    res.status(500).json({
      status: "error",
      message: "Mağaza kurulum isteği alınırken bir hata oluştu",
    });
  }
});

// @route   POST /api/auth/select-chat-page
// @desc    Set user's chat page selection to true
// @access  Private
router.post("/select-chat-page", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    // Update user's is_chat_page_selected to true
    const result = await query(
      `UPDATE users 
       SET is_chat_page_selected = true, updated_at = CURRENT_TIMESTAMP
       WHERE customer_id = $1
       RETURNING customer_id, is_chat_page_selected`,
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Kullanıcı bulunamadı",
      });
    }

    res.json({
      status: "success",
      message: "Chat sayfası başarıyla seçildi",
      data: {
        customer_id: result.rows[0].customer_id,
        is_chat_page_selected: result.rows[0].is_chat_page_selected,
      },
    });
  } catch (error) {
    console.error("Chat page selection error:", error);
    res.status(500).json({
      status: "error",
      message: "Chat sayfası seçilirken bir hata oluştu",
    });
  }
});

// ==================== TOKEN SYSTEM ENDPOINTS ====================

// @route   GET /api/auth/tokens
// @desc    Get user's token information
// @access  Private
router.get("/tokens", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    const result = await query(
      `SELECT total_tokens, used_tokens, remaining_tokens, created_at, updated_at
       FROM user_tokens 
       WHERE customer_id = $1`,
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Token bilgileri bulunamadı",
      });
    }

    res.json({
      status: "success",
      data: {
        tokens: result.rows[0],
      },
    });
  } catch (error) {
    console.error("Token retrieval error:", error);
    res.status(500).json({
      status: "error",
      message: "Token bilgileri alınırken bir hata oluştu",
    });
  }
});

// @route   GET /api/auth/tokens/transactions
// @desc    Get user's token transaction history
// @access  Private
router.get("/tokens/transactions", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customer_id;

    const result = await query(
      `SELECT transaction_type, amount, description, created_at
       FROM token_transactions 
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [customerId]
    );

    res.json({
      status: "success",
      data: {
        transactions: result.rows,
        total: result.rows.length,
      },
    });
  } catch (error) {
    console.error("Token transactions retrieval error:", error);
    res.status(500).json({
      status: "error",
      message: "Token işlem geçmişi alınırken bir hata oluştu",
    });
  }
});

// @route   POST /api/auth/tokens/use
// @desc    Use tokens for a service
// @access  Private
router.post("/tokens/use", authenticateToken, async (req, res) => {
  try {
    const customerId = req.user.customer_id;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Geçerli bir token miktarı belirtmelisiniz",
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

    if (currentTokens.remaining_tokens < amount) {
      return res.status(400).json({
        status: "error",
        message:
          "Yetersiz token. Mevcut token: " + currentTokens.remaining_tokens,
      });
    }

    // Start transaction
    await query("BEGIN");

    try {
      // Update used tokens
      await query(
        `UPDATE user_tokens 
         SET used_tokens = used_tokens + $1
         WHERE customer_id = $2`,
        [amount, customerId]
      );

      // Record transaction
      await query(
        `INSERT INTO token_transactions (customer_id, transaction_type, amount, description)
         VALUES ($1, 'usage', $2, $3)`,
        [customerId, amount, description || "Token kullanımı"]
      );

      await query("COMMIT");

      // Get updated token info
      const updatedResult = await query(
        `SELECT total_tokens, used_tokens, remaining_tokens
         FROM user_tokens 
         WHERE customer_id = $1`,
        [customerId]
      );

      res.json({
        status: "success",
        message: `${amount} token başarıyla kullanıldı`,
        data: {
          tokens: updatedResult.rows[0],
        },
      });
    } catch (error) {
      await query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Token usage error:", error);
    res.status(500).json({
      status: "error",
      message: "Token kullanımı sırasında bir hata oluştu",
    });
  }
});

// @route   POST /api/auth/tokens/purchase
// @desc    Purchase additional tokens (Admin only)
// @access  Private
router.post(
  "/tokens/purchase",
  authenticateAdmin,
  authorizeRole(["super_admin"]),
  async (req, res) => {
    try {
      const { customer_id, amount, description } = req.body;

      if (!customer_id || !amount || amount <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Geçerli bir müşteri ID ve token miktarı belirtmelisiniz",
        });
      }

      // Check if user exists
      const userResult = await query(
        "SELECT customer_id FROM users WHERE customer_id = $1",
        [customer_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Müşteri bulunamadı",
        });
      }

      // Start transaction
      await query("BEGIN");

      try {
        // Update total tokens
        await query(
          `UPDATE user_tokens 
         SET total_tokens = total_tokens + $1
         WHERE customer_id = $2`,
          [amount, customer_id]
        );

        // Record transaction
        await query(
          `INSERT INTO token_transactions (customer_id, transaction_type, amount, description)
         VALUES ($1, 'purchase', $2, $3)`,
          [customer_id, amount, description || "Token satın alma"]
        );

        await query("COMMIT");

        // Get updated token info
        const updatedResult = await query(
          `SELECT total_tokens, used_tokens, remaining_tokens
         FROM user_tokens 
         WHERE customer_id = $1`,
          [customer_id]
        );

        res.json({
          status: "success",
          message: `${amount} token başarıyla eklendi`,
          data: {
            tokens: updatedResult.rows[0],
          },
        });
      } catch (error) {
        await query("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error("Token purchase error:", error);
      res.status(500).json({
        status: "error",
        message: "Token satın alma işlemi sırasında bir hata oluştu",
      });
    }
  }
);

// @route   GET /api/auth/tokens/all
// @desc    Get all users' token information (Admin only)
// @access  Private
router.get(
  "/tokens/all",
  authenticateAdmin,
  authorizeRole(["super_admin"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT 
        ut.customer_id,
        ut.total_tokens,
        ut.used_tokens,
        ut.remaining_tokens,
        ut.created_at,
        ut.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.company
      FROM user_tokens ut
      JOIN users u ON ut.customer_id = u.customer_id
      ORDER BY ut.remaining_tokens ASC, u.created_at DESC
    `);

      res.json({
        status: "success",
        data: {
          tokens: result.rows,
          total: result.rows.length,
        },
      });
    } catch (error) {
      console.error("All tokens retrieval error:", error);
      res.status(500).json({
        status: "error",
        message: "Token bilgileri alınırken bir hata oluştu",
      });
    }
  }
);

// @route   GET /api/auth/tokens/transactions/all
// @desc    Get all token transactions (Admin only)
// @access  Private
router.get(
  "/tokens/transactions/all",
  authenticateAdmin,
  authorizeRole(["super_admin"]),
  async (req, res) => {
    try {
      const result = await query(`
      SELECT 
        tt.id,
        tt.customer_id,
        tt.transaction_type,
        tt.amount,
        tt.description,
        tt.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM token_transactions tt
      JOIN users u ON tt.customer_id = u.customer_id
      ORDER BY tt.created_at DESC
    `);

      res.json({
        status: "success",
        data: {
          transactions: result.rows,
          total: result.rows.length,
        },
      });
    } catch (error) {
      console.error("All token transactions retrieval error:", error);
      res.status(500).json({
        status: "error",
        message: "Token işlem geçmişi alınırken bir hata oluştu",
      });
    }
  }
);

// @route   POST /auth/chat-admin-register
// @desc    Register a new chat admin user (Super Admin only)
// @access  Private
router.post(
  "/chat-admin-register",
  authenticateAdmin,
  authorizeRole(["super_admin"]),
  chatAdminValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, role, company, phone } =
        req.body;

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
        `INSERT INTO users (first_name, last_name, email, password_hash, company, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING customer_id, first_name, last_name, email, company, phone, role, created_at`,
        [
          firstName,
          lastName,
          email,
          passwordHash,
          company || "MetaGrowths",
          phone || null,
          role,
        ]
      );

      const user = result.rows[0];

      res.status(201).json({
        status: "success",
        message: "Chat yönetimi hesabı başarıyla oluşturuldu",
        data: {
          user,
        },
      });
    } catch (error) {
      console.error("Chat admin registration error:", error);
      res.status(500).json({
        status: "error",
        message: "Hesap oluşturulurken bir hata oluştu",
      });
    }
  }
);

// @route   POST /auth/admin-login
// @desc    Admin login
// @access  Public
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "E-posta ve şifre gereklidir",
      });
    }

    // Check if user exists and is admin
    const result = await query(
      `SELECT * FROM users WHERE email = $1 AND (role = 'admin' OR role = 'super_admin')`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Geçersiz e-posta veya şifre",
      });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Geçersiz e-posta veya şifre",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        customer_id: user.customer_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      status: "success",
      message: "Admin girişi başarılı",
      token,
      user: {
        customer_id: user.customer_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      status: "error",
      message: "Giriş yapılırken bir hata oluştu",
    });
  }
});

// @route   POST /auth/chat-admin-login
// @desc    Chat admin login (for advertiser, editor, admin roles)
// @access  Public
router.post("/chat-admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "E-posta ve şifre gereklidir",
      });
    }

    // Check if user exists and has allowed role
    const result = await query(
      `SELECT * FROM users WHERE email = $1 AND role IN ('advertiser', 'editor', 'admin', 'super_admin')`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Bu hesap chat yönetimine erişemez",
      });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Geçersiz e-posta veya şifre",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        customer_id: user.customer_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      status: "success",
      message: "Chat yönetimi girişi başarılı",
      token,
      user: {
        customer_id: user.customer_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Chat admin login error:", error);
    res.status(500).json({
      status: "error",
      message: "Giriş yapılırken bir hata oluştu",
    });
  }
});

module.exports = router;
