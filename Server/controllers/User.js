const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const crypto = require("crypto");
require("dotenv").config();

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};
exports.signupUser = async (req, res) => {
  try {
    const { fullName, username, email, password, profilePicture } = req.body;
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists,please try with another email" });
    }

    const hash = await bcrypt.hash(password, 10);

    // const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: Date.now() + 15 * 60 * 1000,
    });

    const newuser = new User({
      fullName,
      username,
      email,
      password: hash,
      profilePicture,
      verificationToken,
    });

    await newuser.save();

    //Send verification mail
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - MelodyVerse",
      text: `Click this link to verify your email: ${verificationUrl}`,
    });

    return res.status(201).json({
      message: "Signup successfull! check your email to verify your account",
    });
  } catch (error) {
    console.error("Error creating user", error.message);
    return res
      .status(500)
      .json({ message: "User creation failed", error: error.message });
  }
};

//verify email
exports.verifyMail = async (req, res) => {
  try {
    // const user = await User.findOne({ verificationToken: req.params.token });
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(500).json({ message: "Invalid or expired token" });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: "Email verified successfully! you can now login" });
  } catch (error) {
    res.status(500).json({
      message: "Server error-- error in Verify email",
      error: error.message,
    });
  }
};

// Generate JWT Token

//Login with Email verification check

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isVerified)
      return res
        .status(401)
        .json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials password" });

    res.json({ message: "Login successfull", token: generateToken(user) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error -- Login", error: error.message });
  }
};

//Request password request
exports.requestPassReset = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "No user found with this email" });
    }

    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; //1 hour

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      form: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request - MelodyVerse",
      text: `Click this link to reset your password:
      ${resetUrl}`,
    });

    res.json({ message: "Password reset email sent!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfull! You can now login" });
  } catch (error) {
    res.status(500).json({
      message: "Server error -- reset password",
      error: error.message,
    });
  }
};

exports.checkUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      res.status(200).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error checking user", error.message);
    return res
      .status(500)
      .json({ message: "Error checking user", error: error.message });
  }
};
