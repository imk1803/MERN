const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const Order = require('../models/Order'); // ✅ Thêm model Order

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).send('Truy cập bị từ chối');
};

// ========================
//        DASHBOARD
// ========================
router.get('/dashboard', isAdmin, adminController.showDashboard);

// ========================
//         USERS
// ========================
router.get('/users', isAdmin, adminController.listUsers);
router.get('/users/:id/edit', isAdmin, adminController.showEditUser);
router.put('/users/:id', isAdmin, adminController.updateUser);
router.delete('/users/:id', isAdmin, adminController.deleteUser);

// ========================
//        PRODUCTS
// ========================
router.get('/products', isAdmin, adminController.listProducts);
router.get('/products/new', isAdmin, adminController.showCreateProduct);
router.post('/products', isAdmin, adminController.createProduct);
router.get('/products/:id/edit', isAdmin, adminController.showEditProduct);
router.put('/products/:id', isAdmin, adminController.updateProduct);
router.delete('/products/:id', isAdmin, adminController.deleteProduct);

// ========================
//         ORDERS
// ========================
router.get('/orders', isAdmin, adminController.listOrders);
router.get('/orders/:id/detail', isAdmin, async (req, res) => { // ✅ Áp dụng middleware isAdmin
  try {
      const order = await Order.findById(req.params.id)
          .populate('userId')
          .populate('products.productId');
      if (!order) {
          return res.status(404).send('Đơn hàng không tồn tại');
      }
      res.render('admin/detail-order', { order });
  } catch (error) {
      console.error(error);
      res.status(500).send('Lỗi máy chủ');
  }
});

router.patch('/orders/:id/status', isAdmin, adminController.updateOrderStatus);

module.exports = router;
