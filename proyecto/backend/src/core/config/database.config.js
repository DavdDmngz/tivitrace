require('dotenv').config();

const { Sequelize } = require("sequelize");

const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: "postgres",
        port: process.env.DB_PORT,
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL === "true" ? { require: true, rejectUnauthorized: false } : false
        }
    }
);

module.exports = db;