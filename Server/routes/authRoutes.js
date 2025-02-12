const express = require("express");
const {
  signupUser,
  loginUser,
  checkUser,
  verifyMail,
  requestPassReset,
  resetPassword,
} = require("../controllers/User");
const isAuth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts
  message: "Too many  attempts. Try again later.",
});

router
  .post(
    "/signup",

    signupUser
  )
  .get("/verify-email/:token", verifyMail)

  .post("/login", loginLimiter, loginUser)
  .post("/request-reset", loginLimiter, requestPassReset)
  .post("/reset-password/:token", resetPassword)
  .get("/own", isAuth, checkUser);
module.exports = router;
