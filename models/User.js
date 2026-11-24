const sequelize = require("../util/db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  national_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phonenumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  birth_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 31,
    },
  },
  birth_month: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 12,
    },
  },
  birth_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("admin", "staff", "employee", "student"),
    allowNull: false,
    defaultValue: "student",
  },
  profil_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = User;
