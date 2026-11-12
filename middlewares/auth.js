const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

const createAccessToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
    algorithm: "HS256",
  });

const clearRefreshCookie = (res) => {
  res.clearCookie("refresh_token", REFRESH_COOKIE_OPTIONS);
};

module.exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      return res
        .status(500)
        .json({ message: "Authentication is not configured" });
    }
    const user = await User.findOne({ where: { email: email.trim() } });
    if (!user) {
      return res.status(400).json({ message: "invalid email or password" });
    }
    const isPasswordValid =
      user.password && (await bcrypt.compare(password, user.password));
    if (!isPasswordValid) {
      return res.status(400).json({ message: "invalid email or password" });
    }

    const access_token = createAccessToken(user);
    const refresh_token = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_TTL,
        algorithm: "HS256",
      },
    );
    res.cookie("refresh_token", refresh_token, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    });
    return res
      .status(200)
      .set("Cache-Control", "no-store")
      .json({ message: "Login successful", access_token });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
// in login :
//return refresh token contains id
//return access token contains data

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
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {
      algorithms: ["HS256"],
    });
    if (!decoded || typeof decoded !== "object" || decoded.id == null) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const user = await User.findByPk(decoded.id);
    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const access_token = createAccessToken(user);

    return res
      .status(200)
      .set("Cache-Control", "no-store")
      .json({ message: "Token refreshed", access_token });
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      clearRefreshCookie(res);
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.verifytoken = async (req, res, next) => {
  const authHeader = req.get("authorization");
  if (typeof authHeader !== "string" || !/^Bearer\s+/i.test(authHeader)) {
    return res.status(401).json({ message: "Access token is required" });
  }

  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return res.status(401).json({ message: "Access token is required" });
  }

  if (!process.env.JWT_SECRET) {
    return res
      .status(500)
      .json({ message: "Authentication is not configured" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (!decoded || typeof decoded !== "object" || decoded.id == null) {
      return res.status(401).json({ message: "Invalid access token" });
    }
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    req.id = user.id;
    req.role = user.role;
    return next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res
        .status(401)
        .json({ message: "Invalid or expired access token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
// in verify token : |
// the access token must be sent in headers (authHeader)
// if token valid it send the user id and role in the req to next endpoint
