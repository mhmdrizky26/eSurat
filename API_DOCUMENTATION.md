# eSurat API - Daftar Lengkap URI/Endpoints

## 📌 Base URL

**Development:**
```
http://localhost:3000
```

**Production:**
```
https://esuratku.my.id/api
```

---

## 🔐 Authentication Endpoints

### 1. Register (Daftar Akun Baru)
```
POST /api/auth/register
```

**Request:**
```json
{
  "name": "Muhammad Rizky",
  "email": "rizky@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Muhammad Rizky",
    "email": "rizky@example.com",
    "role": "citizen"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200` - Success
- `400` - Email sudah terdaftar / validation error
- `500` - Server error

---

### 2. Login (Masuk Akun)
```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "rizky@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "Muhammad Rizky",
    "email": "rizky@example.com",
    "role": "citizen"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid credentials
- `500` - Server error

---

## 📄 Letters Endpoints

**Requirement:** Semua endpoint memerlukan **Authorization header:**
```
Authorization: Bearer <token>
```

### 3. Create Letter (Ajukan Surat Baru)
```
POST /api/letters
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
- subject: "Permohonan Surat Keterangan Domisili"
- body: "Saya membutuhkan surat keterangan domisili..."
- attachments: [file1.pdf, file2.jpg] (max 5 files, 10MB each)
```

**Accepted File Types:**
- `application/pdf` (.pdf)
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)

**Response (200):**
```json
{
  "id": 5,
  "message": "Letter submitted",
  "attachments": 2
}
```

**Status Codes:**
- `200` - Success, letter created
- `400` - File type not allowed / file too large
- `401` - Unauthorized (no token / invalid token)
- `500` - Server error

---

### 4. List Letters (Daftar Surat)
```
GET /api/letters
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:** (optional)
```
?status=submitted    // Filter by status
?user_id=5          // Filter by user (only for officer role)
```

**Response (200) - Citizen:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "letter_type": "keterangan_domisili",
    "subject": "Permohonan Surat Keterangan Domisili",
    "body": "Saya membutuhkan surat keterangan...",
    "status": "approved",
    "created_at": "2026-05-08T10:30:00.000Z",
    "updated_at": "2026-05-08T15:45:00.000Z"
  },
  ...
]
```

**Response (200) - Officer:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "letter_type": "keterangan_domisili",
    "subject": "Permohonan Surat Keterangan Domisili",
    "body": "Saya membutuhkan surat keterangan...",
    "status": "submitted",
    "created_at": "2026-05-08T10:30:00.000Z",
    "updated_at": "2026-05-08T15:45:00.000Z"
  },
  // Officer bisa lihat SEMUA surat dari semua user
  ...
]
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### 5. Get Letter Detail (Lihat Detail Surat + Attachments)
```
GET /api/letters/:id
```

**Parameters:**
```
:id = letter ID (integer)
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "letter": {
    "id": 1,
    "user_id": 1,
    "letter_type": "keterangan_domisili",
    "subject": "Permohonan Surat Keterangan Domisili",
    "body": "Saya membutuhkan surat keterangan...",
    "status": "approved",
    "created_at": "2026-05-08T10:30:00.000Z",
    "updated_at": "2026-05-08T15:45:00.000Z"
  },
  "attachments": [
    {
      "id": 1,
      "filename": "KTP.pdf",
      "mime_type": "application/pdf",
      "url": "https://bucket-esurat.s3.amazonaws.com/letters/1/1778185804095_KTP.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&..."
    },
    {
      "id": 2,
      "filename": "Photo.jpg",
      "mime_type": "image/jpeg",
      "url": "https://bucket-esurat.s3.amazonaws.com/letters/1/1778185804096_Photo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&..."
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden (citizen hanya bisa lihat surat sendiri)
- `404` - Letter not found
- `500` - Server error

---

### 6. Update Letter Status (Update Status Surat)
```
PUT /api/letters/:id/status
```

**Parameters:**
```
:id = letter ID (integer)
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "status": "processing"
}
```

**Valid Status Values:**
- `submitted` - Baru diajukan
- `processing` - Sedang diproses
- `approved` - Disetujui
- `rejected` - Ditolak

**Response (200):**
```json
{
  "message": "Status updated"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid status
- `401` - Unauthorized
- `403` - Forbidden (only officer can update)
- `500` - Server error

---

## 🔍 Health Check Endpoints

### 7. Health Check (Status Aplikasi)
```
GET /
```

**Response (200):**
```json
{
  "status": "ok"
}
```

---

## 📊 Summary Table

| Method | Endpoint | Auth Required | Role | Purpose |
|--------|----------|---------------|------|---------|
| POST | `/api/auth/register` | ❌ | - | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | - | Login |
| GET | `/api/letters` | ✅ | citizen/officer | List surat |
| POST | `/api/letters` | ✅ | citizen | Ajukan surat baru |
| GET | `/api/letters/:id` | ✅ | citizen/officer | Lihat detail surat |
| PUT | `/api/letters/:id/status` | ✅ | officer | Update status surat |
| GET | `/` | ❌ | - | Health check |

---

## 🧪 Testing dengan cURL

### Test Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test List Letters (dengan token):
```bash
curl -X GET http://localhost:3000/api/letters \
  -H "Authorization: Bearer <token_dari_login>"
```

### Test Create Letter with File:
```bash
curl -X POST http://localhost:3000/api/letters \
  -H "Authorization: Bearer <token>" \
  -F "subject=Permohonan Surat" \
  -F "body=Isi surat..." \
  -F "attachments=@file.pdf"
```

---

## ⚠️ Error Responses

Semua error response akan return:

```json
{
  "message": "Error description"
}
```

atau

```json
{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 🔐 Role-Based Access

**Citizen (Warga):**
- ✅ Register, Login
- ✅ Create letter (ajukan surat)
- ✅ List only own letters
- ✅ View own letter details
- ❌ Update status
- ❌ See other people's letters

**Officer (Petugas):**
- ✅ Register, Login
- ✅ List ALL letters (dari semua warga)
- ✅ View any letter details
- ✅ Update letter status
- ❌ Create letter

---

## 📝 Notes

1. **Token Expiry:** 8 hours
2. **File Upload:** Max 10MB per file, max 5 files per letter
3. **CORS Origin:** `https://esuratku.my.id` (production)
4. **S3 URLs:** Presigned URLs valid untuk 5 menit
5. **JWT Secret:** Dari `.env` file (atau default 'secret')
