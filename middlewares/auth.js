const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "invalid email or password" });
    }
    const userData = user.toJSON();
    delete userData.password;
    const access_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refresh_token = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "30d",
      },
    );
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    });
    return res
      .status(200)
      .json({ message: "Login successful", access_token, userData });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports.refresh = async (req, res) => {
  const refreshToken =
    req.cookies?.refresh_token ||
    req.headers.cookie
      ?.split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith("refresh_token="))
      ?.slice("refresh_token=".length);

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  if (!process.env.REFRESH_TOKEN_SECRET || !process.env.JWT_SECRET) {
    return res
      .status(500)
      .json({ message: "Authentication is not configured" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.clearCookie("refresh_token", {
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const access_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    return res.status(200).json({ message: "Token refreshed", access_token });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
