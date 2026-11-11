const express = require("express");
const router = express.Router();
const { login, refresh } = require("../middlewares/auth");
const {
  single_signup,
  get_all_users,
} = require("../controllers/user.controller");

router.post("/signup", single_signup);
router.get("/all-users", get_all_users);
router.post("/login", login);
router.post("/refresh", refresh);
module.exports = router;
