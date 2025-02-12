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

router
  .post(
    "/signup",
    [body("fullName").notEmpty().withMessage("Full name is required")],
    [body("username").notEmpty().withMessage("username is required")],
    [body("email").notEmpty().withMessage("email is required")],
    [body("password").notEmpty().withMessage("passwordis required")],

    signupUser
  )
  .get("/verify-email/:token", verifyMail)

  .post("/login", loginUser)
  .post("/request-reset", requestPassReset)
  .post("/reset-password/:token", resetPassword)
  .get("/own", isAuth, checkUser);
module.exports = router;
