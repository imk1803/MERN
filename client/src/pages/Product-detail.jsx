import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/cart/add/${product._id}`, {}, { withCredentials: true });
      alert('Đã thêm vào giỏ hàng!');
    } catch (err) {
      console.error('Lỗi khi thêm vào giỏ hàng:', err);
      alert('Thêm vào giỏ hàng thất bại!');
    }
  };

  if (!product) {
    return <div className="text-center p-4">Đang tải sản phẩm...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
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
            />
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            <p className="text-lg text-gray-700 font-semibold">
              Giá:{" "}
              <span className="text-red-500">
                {product.price.toLocaleString('vi-VN')} VNĐ
              </span>
            </p>
            <p className="text-gray-600">
              <strong>Danh mục:</strong> {product.category}
            </p>
            <p className="text-gray-600">
              <strong>Đánh giá:</strong> {product.rating}/5⭐
            </p>
            <p className="text-gray-600">
              <strong>Mô tả:</strong> {product.description}
            </p>

            <button
              onClick={handleAddToCart}
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
