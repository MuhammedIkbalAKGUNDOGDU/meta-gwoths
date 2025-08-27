const { body, validationResult } = require("express-validator");

// Validation rules for registration
const registerValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Ad en az 2, en fazla 50 karakter olmalıdır")
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage("Ad sadece harf içerebilir"),

  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Soyad en az 2, en fazla 50 karakter olmalıdır")
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage("Soyad sadece harf içerebilir"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Geçerli bir e-posta adresi giriniz"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Şifre en az 6 karakter olmalıdır")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Şifreler eşleşmiyor");
    }
    return true;
  }),

  body("company")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Şirket adı en fazla 100 karakter olabilir"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage("Geçerli bir telefon numarası giriniz"),
];

// Validation rules for login
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Geçerli bir e-posta adresi giriniz"),

  body("password").notEmpty().withMessage("Şifre gereklidir"),
];

// Validation rules for web form
const webFormValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Ad en az 2, en fazla 50 karakter olmalıdır"),

  body("surname")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Soyad en az 2, en fazla 50 karakter olmalıdır"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Geçerli bir e-posta adresi giriniz"),

  body("phone")
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage("Geçerli bir telefon numarası giriniz"),

  body("projectDescription")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Proje açıklaması en az 10, en fazla 1000 karakter olmalıdır"),

  body("budget")
    .notEmpty()
    .withMessage("Bütçe aralığı seçimi zorunludur")
    .isIn(["5k-15k", "15k-30k", "30k-50k", "50k-100k", "100k+"])
    .withMessage("Geçerli bir bütçe aralığı seçiniz"),
];

// Validation rules for chat admin user creation (simplified)
const chatAdminValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Ad en az 2, en fazla 50 karakter olmalıdır")
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage("Ad sadece harf içerebilir"),

  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Soyad en az 2, en fazla 50 karakter olmalıdır")
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage("Soyad sadece harf içerebilir"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Geçerli bir e-posta adresi giriniz"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Şifre en az 6 karakter olmalıdır"),

  body("role")
    .isIn(["advertiser", "editor", "admin"])
    .withMessage("Geçerli bir rol seçiniz"),

  body("company")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Şirket adı en fazla 100 karakter olabilir"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage("Geçerli bir telefon numarası giriniz"),
];

// Validation rules for mobile form
const mobileFormValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Ad en az 2, en fazla 50 karakter olmalıdır"),

  body("surname")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Soyad en az 2, en fazla 50 karakter olmalıdır"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Geçerli bir e-posta adresi giriniz"),

  body("phone")
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .withMessage("Geçerli bir telefon numarası giriniz"),

  body("projectDescription")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Proje açıklaması en az 10, en fazla 1000 karakter olmalıdır"),

  body("budget")
    .notEmpty()
    .withMessage("Bütçe aralığı seçimi zorunludur")
    .isIn(["15k-30k", "30k-50k", "50k-100k", "100k-200k", "200k+"])
    .withMessage("Geçerli bir bütçe aralığı seçiniz"),
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Şifre ile ilgili hataları özel olarak handle et
    const passwordErrors = errors
      .array()
      .filter(
        (error) => error.path === "password" || error.path === "confirmPassword"
      );

    const otherErrors = errors
      .array()
      .filter(
        (error) => error.path !== "password" && error.path !== "confirmPassword"
      );

    let errorMessage = "Lütfen form bilgilerini kontrol ediniz";

    if (passwordErrors.length > 0) {
      errorMessage = "Şifre gereksinimleri karşılanmıyor";
    } else if (otherErrors.length > 0) {
      errorMessage = "Lütfen tüm alanları doğru şekilde doldurunuz";
    }

    return res.status(400).json({
      status: "error",
      message: errorMessage,
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  webFormValidation,
  mobileFormValidation,
  chatAdminValidation,
  handleValidationErrors,
};
