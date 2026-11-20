const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { single_user_signup_validator } = require("../validation/validation");
module.exports.single_signup = async (req, res) => {
  const validation = await single_user_signup_validator(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: validation.message });
  }

  const { name, email, role } = validation.userData;
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });
  const userData = user.toJSON();
  delete userData.password;

  res.status(201).json({ message: "User registered successfully", userData });
};

module.exports.get_all_users = async (req, res) => {
  const users = await User.findAll();
  const userData = users.map((user) => user.toJSON());
  res.status(200).json({ message: "Users fetched successfully", userData });
};

module.exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = user.toJSON();
    delete userData.password;

    return res
      .status(200)
      .json({ message: "User fetched successfully", userData });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
