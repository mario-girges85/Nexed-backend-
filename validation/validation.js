const User = require("../models/User");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports.single_user_signup_validator = async (user) => {
  const { name, email, password, role, national_id } = user || {};

  if (!name || !email || !password || !role) {
    return { success: false, message: "All fields are required" };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, message: "Please provide a valid email address" };
  }

  if (national_id && !/^\d{14}$/.test(String(national_id).trim())) {
    return {
      success: false,
      message: "National ID must contain exactly 14 digits",
    };
  }

  if (String(password).length < 8) {
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
    userData: {
      name,
      email,
      role,
      national_id: user.national_id,
      phonenumber: user.phonenumber,
      birth_day: user.birth_day,
      birth_month: user.birth_month,
      birth_year: user.birth_year,
      address: user.address,
      gender: user.gender,
      profil_image: user.profil_image,
    },
  };
};
