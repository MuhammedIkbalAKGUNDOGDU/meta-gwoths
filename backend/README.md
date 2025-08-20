# MetaGrowths Backend API

Node.js, Express.js ve PostgreSQL kullanılarak geliştirilmiş RESTful API.

## 🚀 Özellikler

- **Authentication**: JWT tabanlı kullanıcı kimlik doğrulama
- **User Management**: Kayıt olma, giriş yapma, profil yönetimi
- **Form Submissions**: Web geliştirme ve mobil uygulama formları
- **Database**: PostgreSQL ile veri saklama
- **Security**: bcrypt ile şifre hashleme, input validation
- **CORS**: Cross-origin resource sharing desteği

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- PostgreSQL (v12 veya üzeri)
- npm veya yarn

## 🛠️ Kurulum

1. **Bağımlılıkları yükleyin:**

   ```bash
   cd backend
   npm install
   ```

2. **PostgreSQL veritabanını kurun:**

   - PostgreSQL'i yükleyin ve çalıştırın
   - `metagrowths_db` adında bir veritabanı oluşturun

3. **Environment değişkenlerini ayarlayın:**

   ```bash
   cp config.env.example config.env
   ```

   `config.env` dosyasını düzenleyin:

   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=metagrowths_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:3000
   BCRYPT_ROUNDS=12
   ```

4. **Sunucuyu başlatın:**

   ```bash
   # Development modu
   npm run dev

   # Production modu
   npm start
   ```

## 📊 Veritabanı Şeması

### Users Tablosu

```sql
CREATE TABLE users (
  customer_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Web Forms Tablosu

```sql
CREATE TABLE web_forms (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(customer_id),
  name VARCHAR(50) NOT NULL,
  surname VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  project_description TEXT NOT NULL,
  budget VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Mobile Forms Tablosu

```sql
CREATE TABLE mobile_forms (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES users(customer_id),
  name VARCHAR(50) NOT NULL,
  surname VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  project_description TEXT NOT NULL,
  budget VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Authentication

#### POST /api/auth/register

Kullanıcı kaydı

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "company": "Example Corp",
  "phone": "+90 555 123 4567"
}
```

#### POST /api/auth/login

Kullanıcı girişi

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### GET /api/auth/profile

Kullanıcı profili (Authentication gerekli)

#### PUT /api/auth/profile

Profil güncelleme (Authentication gerekli)

### Forms

#### POST /api/auth/web-form

Web geliştirme formu gönderimi

```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "projectDescription": "E-ticaret web sitesi geliştirmek istiyorum",
  "budget": "15k-30k"
}
```

#### POST /api/auth/mobile-form

Mobil uygulama formu gönderimi

```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "phone": "+90 555 123 4567",
  "projectDescription": "iOS ve Android için mobil uygulama geliştirmek istiyorum",
  "budget": "50k-100k"
}
```

## 🔒 Güvenlik

- **Password Hashing**: bcrypt ile şifre hashleme
- **JWT Tokens**: Güvenli token tabanlı kimlik doğrulama
- **Input Validation**: Express-validator ile giriş doğrulama
- **CORS**: Cross-origin resource sharing koruması
- **Helmet**: Güvenlik başlıkları

## 📝 Validation Kuralları

### Kayıt Formu

- Ad/Soyad: 2-50 karakter, sadece harf
- E-posta: Geçerli e-posta formatı
- Şifre: En az 6 karakter, büyük/küçük harf + rakam
- Telefon: 10-15 karakter, sayı ve özel karakterler

### Form Gönderimi

- Ad/Soyad: 2-50 karakter
- E-posta: Geçerli e-posta formatı
- Telefon: 10-15 karakter
- Proje açıklaması: 10-1000 karakter
- Bütçe: Belirtilen aralıklardan biri

## 🚀 Deployment

### Production için öneriler:

1. Environment değişkenlerini güvenli şekilde ayarlayın
2. JWT_SECRET'ı güçlü bir değerle değiştirin
3. Database bağlantısını production ayarlarıyla güncelleyin
4. CORS origin'i production domain ile güncelleyin
5. SSL sertifikası ekleyin

## 📞 Destek

Herhangi bir sorun yaşarsanız, lütfen issue açın veya iletişime geçin.
