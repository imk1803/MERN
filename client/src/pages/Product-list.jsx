import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const limit = 4; // Giống backend

  // Cấu hình axios để luôn gửi cookie (session ID)
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const page = parseInt(searchParams.get('page')) || 1;
        const res = await axios.get(`http://localhost:5000/api/products?page=${page}&limit=${limit}`);
        setProducts(res.data.products || res.data);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(page);
      } catch (err) {
        console.error('❌ Lỗi lấy sản phẩm:', err);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      await axios.post(`http://localhost:5000/cart/add/${productId}`);
      alert(`✅ Đã thêm ${productName} vào giỏ hàng!`);
    } catch (err) {
      console.error('❌ Lỗi thêm vào giỏ hàng:', err);
      alert('❌ Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!');
    }
  };

  if (products.length === 0) return <p className="text-center mt-10">Không tìm thấy sản phẩm nào.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">DANH SÁCH SẢN PHẨM</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={`http://localhost:5000${product.image}`} alt={product.name} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p><strong>Giá từ:</strong> <span className="text-gray-700">{product.price.toLocaleString('vi-VN')}đ</span></p>
              <Link
                to={`/products/${product._id}`}
                className="mt-2 block w-full bg-gray-100 text-gray-500 py-2 rounded-lg flex items-center justify-center"
              >
                <i className="fas fa-info-circle mr-2"></i> Xem chi tiết
              </Link>
              <button
                onClick={() => handleAddToCart(product._id, product.name)}
                className="mt-2 w-full bg-blue-100 text-blue-500 py-2 rounded-lg flex items-center justify-center"
              >
                <i className="fas fa-shopping-cart mr-2"></i> Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      <div className="mt-6 flex justify-center items-center">
        {currentPage > 1 ? (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-l hover:bg-gray-400"
          >
            Trước
          </button>
        ) : (
          <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-l">Trước</span>
        )}

        <span className="px-4 py-2 bg-white text-gray-700 border-t border-b">
          {currentPage} / {totalPages}
        </span>

        {currentPage < totalPages ? (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-r hover:bg-gray-400"
          >
            Sau
          </button>
        ) : (
          <span className="px-4 py-2 bg-gray-200 text-gray-500 rounded-r">Sau</span>
        )}
      </div>

      {/* Giỏ hàng cố định */}
      <Link
        to="/cart"
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center"
      >
        🛒 Giỏ hàng
      </Link>
    </div>
  );
};

export default ProductList;
