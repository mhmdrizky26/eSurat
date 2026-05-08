require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const authRoutes = require('./routes/auth');
const letterRoutes = require('./routes/letters');
const db = require('./config/db');
const bcrypt = require('bcryptjs');

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

// ❌ REMOVED: S3 URLs digunakan — tidak perlu static /uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/letters', letterRoutes);

app.get('/', (req, res) => res.json({ status: 'ok' }));

// ensure admin user exists when env provided
(async () => {
  try {
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const [rows] = await db.promise().query('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
      if (!rows.length) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);
        const name = process.env.ADMIN_NAME || 'Admin';
        await db.promise().query('INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, NOW())', [name, process.env.ADMIN_EMAIL, hash, 'admin']);
        console.log('Admin user created:', process.env.ADMIN_EMAIL);
      }
    }
  } catch (err) {
    console.error('Admin seed error', err);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});