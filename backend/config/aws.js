require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3');

// Fail fast: kalau env wajib tidak ada, server crash di startup
// (lebih baik daripada diam-diam balik ke disk lokal)
const S3_BUCKET = process.env.S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

if (!S3_BUCKET) {
  console.error('\n❌ S3_BUCKET tidak diset di .env');
  console.error('   Pastikan file .env ada di direktori yang sama dengan app.js');
  console.error('   dan berisi: S3_BUCKET=nama-bucket-anda\n');
  process.exit(1);
}

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('\n❌ AWS credentials tidak lengkap di .env');
  console.error('   Butuh: AWS_ACCESS_KEY_ID dan AWS_SECRET_ACCESS_KEY\n');
  process.exit(1);
}

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

console.log(`✓ S3 client siap — bucket: ${S3_BUCKET} · region: ${AWS_REGION}`);

module.exports = { s3, S3_BUCKET, AWS_REGION };