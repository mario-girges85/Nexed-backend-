require("dotenv").config();

const { Sequelize } = require("sequelize");
const mysql2 = require("mysql2");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    },
    dialectModule: mysql2,
    logging: false,
  },
);

module.exports = sequelize;
