const express = require("express");
const router = express.Router();
const { login, refresh, verifytoken } = require("../middlewares/auth");
const {
  single_signup,
  get_all_users,
  me,
} = require("../controllers/user.controller");

router.post("/signup", single_signup);
router.get("/all-users", get_all_users);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", verifytoken, me);
module.exports = router;
