import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import handleAddToCart from '../services/cartService';

// CSS animation styles
const styles = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .notification-animate {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const limit = 4; // Giống backend

  // Cấu hình axios để luôn gửi cookie (session ID)
  axios.defaults.withCredentials = true;

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

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
        showNotification('Không thể tải danh sách sản phẩm!', 'error');
      }
    };
    fetchProducts();
  }, [searchParams]);

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
  };

  if (products.length === 0) return <p className="text-center mt-10">Không tìm thấy sản phẩm nào.</p>;

  return (
    <div className="container mx-auto p-4">
      <style>{styles.fadeIn}</style>
      
      {notification.show && (
        <div 
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg notification-animate ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white flex items-center`}
        >
          <span className="mr-2">
            {notification.type === 'success' ? '✓' : '✕'}
          </span>
          {notification.message}
        </div>
      )}

      <h1 className="text-2xl font-bold text-center mb-6">DANH SÁCH SẢN PHẨM</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={`http://localhost:5000/${product.image}`} alt={product.name} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p><strong>Giá từ:</strong> <span className="text-gray-700">{product.price ? product.price.toLocaleString('vi-VN') : 0}đ</span></p>
              <Link
                to={`/products/${product._id}`}
                className="mt-2 block w-full bg-gray-100 text-gray-500 py-2 rounded-lg flex items-center justify-center"
              >
                <i className="fas fa-info-circle mr-2"></i> Xem chi tiết
              </Link>
              <button
                onClick={() => handleAddToCart(product._id, showNotification)}
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
