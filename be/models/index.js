const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config(); // 반드시 최상단에서 호출

const db = {};

const sequelize = new Sequelize(
  process.env.DB_DATABASE,      
  process.env.DB_ID,            
  process.env.DB_PASS,          
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT, 
    logging: false,
  }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./user")(sequelize, Sequelize);

module.exports = db;
