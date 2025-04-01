const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET không được cấu hình');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token đã hết hạn' });
        }
        return res.status(403).json({ message: 'Token không hợp lệ' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ message: 'Lỗi xác thực người dùng' });
  }
};

// Đăng ký tài khoản
router.post('/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  try {
    // Validate đầu vào
    if (!username?.trim() || !password?.trim() || !confirmPassword?.trim()) {
      return res.status(400).json({ 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Mật khẩu nhập lại không khớp' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Tên đăng nhập đã tồn tại' 
      });
    }

    // Tạo user mới
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
      role: 'user'
    });

    await newUser.save();

    // Tạo token cho user mới
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi đăng ký tài khoản' 
    });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate đầu vào
    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    // Tìm user
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(401).json({ 
        message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
      });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET không được cấu hình');
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ 
      message: error.message || 'Lỗi server khi đăng nhập' 
    });
  }
});

// Đăng xuất
router.post('/logout', authenticateToken, (req, res) => {
  try {
    res.json({ 
      success: true,
      message: 'Đăng xuất thành công' 
    });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi đăng xuất' 
    });
  }
});

// Lấy thông tin user hiện tại
router.get('/profile', (req, res) => {
    res.status(503).json({
        success: false,
        message: 'API profile tạm thời không khả dụng'
    });
});

module.exports = router;