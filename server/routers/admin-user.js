const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Đường dẫn đến model User
// ========================
//        EDIT USER
// ========================
router.post('/admin/users/:id/update', async (req, res) => {
    try {
        const { username, role, newPassword } = req.body;
        const userId = req.params.id;

        // Tìm user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('Không tìm thấy người dùng');
        }

        // Cập nhật thông tin
        user.username = username;
        user.role = role;

        // Cập nhật mật khẩu nếu có nhập
        if (newPassword && newPassword.trim() !== '') {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        await user.save();

        // Chuyển hướng về danh sách users
        res.redirect('/admin/users');

    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ');
    }
});


// ========================
//        DELETE USER
// ========================
router.post('/admin/users/:id/delete', async (req, res) => {
    try {
        const userId = req.params.id;

        await User.findByIdAndDelete(userId);

        // Chuyển hướng sau khi xoá
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ khi xoá người dùng');
    }
});

module.exports = router;
// ========================
//        ADD USER
// ========================
router.get('/admin/users/add-user', (req, res) => {
    res.render('admin/add-user'); // View thêm user
});

router.post('/admin/users/add-user', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Kiểm tra trùng username
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send('Username đã tồn tại!');
        }

        // Mã hóa password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = new User({
            username,
            password: hashedPassword,
            role
        });

        await newUser.save();

        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ khi thêm người dùng');
    }
});
