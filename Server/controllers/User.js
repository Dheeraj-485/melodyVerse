const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const crypto = require("crypto");
require("dotenv").config();
const nodemailer = require("nodemailer");

// Configure Nodemailer for email verification & password reset
const transporter = nodemailer.createTransport({
  port: 465,
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  secure: true,
});

// Function to generate JWT token for authentication
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

/**
 * @route   POST /signup
 * @desc    Register a new user and send email verification
 * @access  Public
 */
exports.signupUser = async (req, res) => {
  try {
    const { fullName, username, email, password, profilePicture } = req.body;

    // Validate required fields
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists, please try with another email",
      });
    }

    // Hash password before saving
    const hash = await bcrypt.hash(password, 10);

    // Generate verification token (valid for 15 minutes)
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Create new user in database
    const newUser = new User({
      fullName,
      username,
      email,
      password: hash,
      profilePicture,
      verificationToken,
    });

    await newUser.save();

    // Send email verification link
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email - MelodyVerse",
      text: `Click this link to verify your email: ${verificationUrl}`,
    });

    return res.status(201).json({
      message: "Signup successful! Check your email to verify your account.",
    });
  } catch (error) {
    console.error("Error creating user", error.message);
    return res
      .status(500)
      .json({ message: "User creation failed", error: error.message });
  }
};

/**
 * @route   GET /verify-email/:token
 * @desc    Verify user email using token
 * @access  Public
 */
exports.verifyMail = async (req, res) => {
  try {
    const { token } = req.params;

    // Decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by email
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res
      .status(200)
      .json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    res.status(500).json({
      message: "Server error - Verify email",
      error: error.message,
    });
  }
};

/**
 * @route   POST /login
 * @desc    Login user after email verification
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", token: generateToken(user) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error - Login", error: error.message });
  }
};

/**
 * @route   POST /request-reset
 * @desc    Send password reset link to user email
 * @access  Public
 */
exports.requestPassReset = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: "No user found with this email" });
    }

    // Generate password reset token (valid for 1 hour)
    const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send reset password email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request - MelodyVerse",
      text: `Click this link to reset your password: ${resetUrl}`,
    });

    res.json({ message: "Password reset email sent!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * @route   POST /reset-password/:token
 * @desc    Reset user password using token
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    // Find user by reset token and check if it is still valid
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password and update user
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error - Reset password", error: error.message });
  }
};

/**
 * @route   GET /own
 * @desc    Get user details (only for authenticated users)
 * @access  Private
 */
exports.checkUser = async (req, res) => {
  try {
    // Find user and exclude password field
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error checking user", error.message);
    return res
      .status(500)
      .json({ message: "Error checking user", error: error.message });
  }
};
