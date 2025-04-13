const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Hàm escape các ký tự đặc biệt trong RegExp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// ========================== API SEARCH PRODUCTS ==========================
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q ? req.query.q.trim() : "";
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page - 1) * limit;

        // Bỏ qua tìm kiếm nếu query trống
        if (!query) {
            const products = await Product.find().skip(skip).limit(limit);
            const totalProducts = await Product.countDocuments();
            const totalPages = Math.ceil(totalProducts / limit);
            
            return res.status(200).json({
                products,
                currentPage: page,
                totalPages,
                query: ""
            });
        }

        // Tạo điều kiện tìm kiếm an toàn với các ký tự đặc biệt đã được escape
        const safeQuery = escapeRegExp(query);
        
        // Tìm kiếm sản phẩm dựa trên các trường là string: name, categoryName, description
        const searchCondition = {
            $or: [
                { name: { $regex: safeQuery, $options: "i" } },
                { categoryName: { $regex: safeQuery, $options: "i" } },
                { description: { $regex: safeQuery, $options: "i" } }
            ]
        };
        
        // Tìm kiếm sản phẩm
        const products = await Product.find(searchCondition)
            .skip(skip)
            .limit(limit)
            .populate('category');
        
        // Đếm tổng số sản phẩm thỏa mãn
        const totalProducts = await Product.countDocuments(searchCondition);
        
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            products,
            currentPage: page,
            totalPages,
            query
        });
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ message: "Lỗi tìm kiếm sản phẩm" });
    }
});

module.exports = router;
