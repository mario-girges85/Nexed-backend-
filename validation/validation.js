const User = require("../models/User");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports.single_user_signup_validator = async (user) => {
  const { name, email, password, role } = user || {};

  if (!name || !email || !password || !role) {
    return { success: false, message: "All fields are required" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, message: "Please provide a valid email address" };
  }

  if (String(password).length < 8) {
    console.log("less");

    return {
      success: false,
      message: "Password must be at least 8 characters long",
    };
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return { success: false, message: "User already exists" };
  }

  return {
    success: true,
    userData: { name, email, role },
  };
};
