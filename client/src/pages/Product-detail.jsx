import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import handleAddToCart from '../services/cartService';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

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

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data.product);
        
        // Handle different category formats and extract the name
        const categoryData = res.data.product.category;
        if (categoryData) {
          if (typeof categoryData === 'object' && categoryData.name) {
            // If category is a populated object with name property
            setCategoryName(categoryData.name);
          } else if (typeof categoryData === 'object' && categoryData._id) {
            // If category is an object with just ID, fetch the category name
            fetchCategoryName(categoryData._id);
          } else if (typeof categoryData === 'string') {
            // If category is a string ID, fetch the category name
            fetchCategoryName(categoryData);
          } else {
            setCategoryName('Không xác định');
          }
        } else {
          setCategoryName('Không xác định');
        }
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
        showNotification('Không thể tải chi tiết sản phẩm!', 'error');
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Function to fetch category name by ID
  const fetchCategoryName = async (categoryId) => {
    try {
      const res = await axios.get(`/api/products/categories/${categoryId}`);
      if (res.data && res.data.success && res.data.category) {
        setCategoryName(res.data.category.name);
      } else {
        setCategoryName('Không xác định');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setCategoryName('Không xác định');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    
    // Tự động ẩn thông báo sau 3 giây
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  if (!product) {
    return <div className="text-center p-4">Đang tải sản phẩm...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
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

      <header className="text-center p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold">Chi tiết sản phẩm</h1>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-80 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x300?text=No+Image";
              }}
            />
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-lg text-gray-700 font-semibold">
              Giá:{" "}
              <span className="text-red-500">
                {product.price ? product.price.toLocaleString('vi-VN') : 0} VNĐ
              </span>
            </p>
            <p className="text-gray-600">
              <strong>Danh mục:</strong> {categoryName}
            </p>
            <p className="text-gray-600">
              <strong>Đánh giá:</strong> {product.rating}/5⭐
            </p>
            <p className="text-gray-600">
              <strong>Mô tả:</strong> {product.description}
            </p>

            <button
              onClick={() => handleAddToCart(product._id, showNotification)}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
            >
              <i className="fas fa-shopping-cart mr-2"></i> Thêm vào giỏ hàng
            </button>

            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-center block text-blue-500 hover:underline"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>

      <a
        href="/cart"
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center"
      >
        🛒 Giỏ hàng
      </a>
    </div>
  );
};

export default ProductDetail;
