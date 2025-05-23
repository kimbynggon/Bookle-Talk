require('dotenv').config();

module.exports = {
  db: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgresql',
  logging: false,
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
    evict: 1000
  }
};