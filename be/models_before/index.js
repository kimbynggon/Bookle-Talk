const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config(); 
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
db.Book = require('./book')(sequelize, DataTypes);

module.exports = db;
