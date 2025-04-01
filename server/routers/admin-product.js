const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ========================
//      PRODUCT CRUD
// ========================

// View All Products
router.get('/admin/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('admin/products', { products });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ khi lấy sản phẩm');
    }
});

// Add Product - Form
router.get('/admin/products/add-product', (req, res) => {
    res.render('admin/add-product');
});

// Add Product - Handle Form
router.post('/admin/products/add-product', async (req, res) => {
    try {
        const { name, price, description, category, rating, image } = req.body;
        const newProduct = new Product({ name, price, description, category, rating, image });
        await newProduct.save();
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ khi thêm sản phẩm');
    }
});

// Edit Product - Form
router.get('/admin/products/:id/edit', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.render('admin/edit-product', { product });
    } catch (err) {
        console.error(err);
        res.status(500).send('Không tìm thấy sản phẩm');
    }
});

// Edit Product - Handle Form
router.post('/admin/products/:id/update', async (req, res) => {
    try {
        const { name, price, description, category, rating, image } = req.body;
        await Product.findByIdAndUpdate(req.params.id, { name, price, description, category, rating, image });
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ khi cập nhật sản phẩm');
    }
});

// Delete Product
router.post('/admin/products/:id/delete', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi máy chủ khi xoá sản phẩm');
    }
});

module.exports = router;
