const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); // không cần .js

const router = express.Router();

// Đăng ký tài khoản
router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // kiểm tra user tồn tại
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashed, role });
    await user.save();

    res.json({ message: "Đăng ký thành công", user: { username, role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // tìm user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // so sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // tạo JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret_key",
      { expiresIn: "1d" },
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: { username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
