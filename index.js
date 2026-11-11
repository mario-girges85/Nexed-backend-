require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { Sequelize } = require("sequelize");
const sequelize = require("./util/db");
const app = require("./app");
PORT = process.env.PORT;
// Start the server locally, but export the app for Vercel.
try {
  sequelize
    .sync({ alter: true, force: false })
    .then(() => {
      app.listen(PORT, () => {
        console.log("Database tables are synchronized.");
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Database synchronization failed:", error);
      process.exitCode = 1;
    });
} catch (error) {
  console.error("error in connecting the db", error);
}
