import React, { useEffect, useState, useRef } from 'react';
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
    
    .dropdown {
      animation: fadeIn 0.2s ease-out forwards;
    }
  `
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

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
  
  // Lắng nghe click bên ngoài dropdown để đóng nó
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products/categories');
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          console.error('Response không phải mảng danh mục:', res.data);
          setCategories([]);
        }
      } catch (err) {
        console.error('❌ Lỗi lấy danh mục:', err);
        setCategories([]);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const page = parseInt(searchParams.get('page')) || 1;
        const category = searchParams.get('category') || '';
        
        // Tạo query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (category) {
          queryParams.append('category', category);
        }
        
        const res = await axios.get(`http://localhost:5000/api/products?${queryParams.toString()}`);
        
        if (res.data.success) {
          setProducts(res.data.products || []);
          setTotalPages(res.data.pagination.totalPages || 1);
          setCurrentPage(page);
        } else {
          console.error('API trả về lỗi:', res.data);
          setProducts([]);
          showNotification('Không thể tải danh sách sản phẩm!', 'error');
        }
      } catch (err) {
        console.error('❌ Lỗi lấy sản phẩm:', err);
        setProducts([]);
        showNotification('Không thể tải danh sách sản phẩm!', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams, limit]);

  const handlePageChange = (newPage) => {
    // Giữ nguyên category khi chuyển trang
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
  };
  
  const handleCategoryChange = (categoryId) => {
    const newParams = new URLSearchParams();
    newParams.set('page', 1); // Reset về trang 1
    if (categoryId) {
      newParams.set('category', categoryId);
    }
    setSearchParams(newParams);
    setShowDropdown(false); // Đóng dropdown sau khi chọn
  };
  
  // Lấy category hiện tại từ URL
  const currentCategory = searchParams.get('category') || '';
  
  // Tìm tên của danh mục đang chọn
  const getCurrentCategoryName = () => {
    if (!currentCategory) return 'Tất cả danh mục';
    
    const selectedCategory = categories.find(c => c._id === currentCategory);
    return selectedCategory ? selectedCategory.name : 'Tất cả danh mục';
  };

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
      
      {/* Header với dropdown menu danh mục */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">DANH SÁCH SẢN PHẨM</h1>
        
        {/* Dropdown danh mục */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-between w-64 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span>{getCurrentCategoryName()}</span>
            <svg className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 dropdown max-h-80 overflow-y-auto">
              <div className="py-1">
                <div className="px-3 py-2 border-b border-gray-200">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="all-categories"
                      checked={!currentCategory}
                      onChange={() => handleCategoryChange('')}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="all-categories" className="ml-2 text-sm text-gray-700">
                      Tất cả danh mục
                    </label>
                  </div>
                </div>
                
                <div className="px-3 py-2 text-xs text-gray-500 uppercase">
                  Danh mục
                </div>
                
                {categories.map(category => (
                  <div key={category._id} className="px-3 py-2 hover:bg-gray-100">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`category-${category._id}`}
                        checked={currentCategory === category._id}
                        onChange={() => handleCategoryChange(category._id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`category-${category._id}`} className="ml-2 text-sm text-gray-700">
                        {category.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hiển thị loading */}
      {loading ? (
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="ml-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm nào phù hợp.</p>
          <button
            onClick={() => handleCategoryChange('')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
              <div className="w-full h-40">
                <img 
                  src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`} 
                  alt={product.name} 
                  className="w-full h-40 object-cover" 
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-semibold mb-2 line-clamp-2 h-14 overflow-hidden" title={product.name}>
                  {product.name}
                </h2>
                <p className="mt-auto"><strong>Giá:</strong> <span className="text-gray-700">{product.price ? product.price.toLocaleString('vi-VN') : 0}đ</span></p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="block w-full bg-gray-100 text-gray-500 py-2 rounded-lg flex items-center justify-center"
                  >
                    <i className="fas fa-info-circle mr-2"></i> Xem chi tiết
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product._id, showNotification)}
                    className="w-full bg-blue-100 text-blue-500 py-2 rounded-lg flex items-center justify-center"
                  >
                    <i className="fas fa-shopping-cart mr-2"></i> Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phân trang - chỉ hiển thị khi có sản phẩm */}
      {!loading && products.length > 0 && (
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
      )}

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
