const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ========================== API SEARCH PRODUCTS ==========================
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q ? req.query.q.trim().toLowerCase() : "";
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        let filter = {};
        if (query) {
            filter = {
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { category: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            };
        }

        const totalProducts = await Product.countDocuments(filter);
        const products = await Product.find(filter).skip(skip).limit(limit);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            products,
            currentPage: page,
            totalPages,
            query
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi tìm kiếm sản phẩm" });
    }
});

module.exports = router;
