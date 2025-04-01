const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Delete Order
router.post('/admin/orders/:id/delete', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.redirect('/admin/orders');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ khi xoá đơn hàng');
    }
});

// Detail Order
router.get('/orders/:id/detail', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId')
            .populate('products.productId');
        if (!order) {
            return res.status(404).send('Đơn hàng không tồn tại');
        }
        res.render('admin/detail-order', { order }); // ✅ View đúng
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
  });
  
module.exports = router;
