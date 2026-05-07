-- Buat database (opsional)
CREATE DATABASE IF NOT EXISTS esurat
  CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
USE esurat;

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'citizen',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel letters
CREATE TABLE IF NOT EXISTS letters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  letter_type VARCHAR(255),
  subject VARCHAR(255),
  body TEXT,
  status VARCHAR(50) DEFAULT 'submitted',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel attachments
CREATE TABLE IF NOT EXISTS attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  letter_id INT NOT NULL,
  s3_key VARCHAR(1024) NOT NULL,
  filename VARCHAR(255),
  mime_type VARCHAR(100),
  size BIGINT,
  FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

USE esurat;

-- Contoh insert pengguna untuk 2 role (semua password: password123)
-- Hash: $2a$12$zHq9YlvvB0TuD7EgtD6TJeySDAodNGZu5LhoVGmgl0FZL4ZaxCPC2
INSERT IGNORE INTO users (name, email, password_hash, role, created_at) VALUES
  ('Officer User', 'officer@gamil.com', '$2a$12$zHq9YlvvB0TuD7EgtD6TJeySDAodNGZu5LhoVGmgl0FZL4ZaxCPC2', 'officer', NOW()),
  ('Citizen User', 'citizen@gamil.com', '$2a$12$zHq9YlvvB0TuD7EgtD6TJeySDAodNGZu5LhoVGmgl0FZL4ZaxCPC2', 'citizen', NOW());
