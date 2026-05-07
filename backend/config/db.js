const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'db-esurat.cu7s86q8qmcp.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'db-esurat',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;