const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
module.exports.single_signup = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

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
  req.body.id = id;
  const myuser = User.findOne({ where: { id } });
  res
    .status(201)
    .send({ success: true, message: "got my data successfully", myuser });
};
