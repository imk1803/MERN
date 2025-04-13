const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');


// ========================== ROUTES API JSON ==========================

// API trả về danh sách sản phẩm dạng JSON cho frontend React
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products); // Trả JSON danh sách sản phẩm
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm" });
    }
});



// API trả về chi tiết 1 sản phẩm (✅ ĐÃ SỬA)
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id.trim(); // ✅ Trim để loại bỏ \n hoặc space
        const product = await Product.findById(id).populate('category', 'name');

        if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

        const formattedProduct = {
            ...product._doc,
            image: `${req.protocol}://${req.get('host')}${product.image}`
        };

        res.json({ product: formattedProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi lấy chi tiết sản phẩm" });
    }
});

// API để lấy thông tin danh mục theo ID
router.get('/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id.trim();
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ 
                success: false, 
                message: "Danh mục không tồn tại" 
            });
        }
        
        res.json({ 
            success: true, 
            category: {
                _id: category._id,
                name: category.name,
                slug: category.slug
            } 
        });
    } catch (err) {
        console.error('Error fetching category:', err);
        res.status(500).json({ 
            success: false, 
            message: "Lỗi khi lấy thông tin danh mục" 
        });
    }
});

// ========================== ROUTES RENDER VIEW (cho EJS dùng) ==========================

// Trang chủ, redirect về /product
router.get('/', (req, res) => res.redirect('/product'));

// Trang danh sách sản phẩm EJS
router.get('/index', async (req, res) => {
    try {
        const products = await Product.find();
        res.render('index', { products, user: req.user || null });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi lấy danh sách sản phẩm");
    }
});

// Danh sách sản phẩm có phân trang
router.get('/product', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    try {
        const totalProducts = await Product.countDocuments();
        const products = await Product.find().skip(skip).limit(limit);
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('product-list', { products, currentPage: page, totalPages });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi khi lấy danh sách sản phẩm");
    }
});

// Trang chi tiết sản phẩm EJS
router.get('/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).send("Sản phẩm không tồn tại");
        res.render('product-detail', { product });
    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi lấy chi tiết sản phẩm");
    }
});

module.exports = router;
