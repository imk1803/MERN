import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);

  // Fetch products từ API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products', {
          withCredentials: true // Nếu backend yêu cầu session/cookie
        });
        setProducts(response.data);
      } catch (error) {
        console.error('❌ Lỗi lấy danh sách sản phẩm:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Swiper Carousel */}
      <div className="container mx-auto p-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          className="mySwiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <Link to={`/products/${product._id}`}>
                <img
                  src={`http://localhost:5000${product.image}`}
                  alt={product.name}
                  className="rounded-lg shadow-lg w-full object-cover h-64 hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Tiêu đề sản phẩm nổi bật */}
      <h1 className="text-center text-2xl font-bold mt-6 mb-4 text-gray-800">
        🔥 Sản phẩm nổi bật
      </h1>

      {/* Danh sách sản phẩm */}
      <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.length === 0 ? (
          <p className="text-center col-span-3">Chưa có sản phẩm!</p>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              className="bg-white p-4 rounded-lg shadow-lg text-center"
            >
              <Link to={`/products/${product._id}`}>
              <img
              src={`http://localhost:5000${product.image}`}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
              />
                <h2 className="text-xl font-semibold mt-2">{product.name}</h2>
                <p className="text-red-500 font-bold text-lg">
                  {product.price.toLocaleString('vi-VN')} VNĐ
                </p>
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Giỏ hàng */}
      <Link
        to="/cart"
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center"
      >
        🛒 Giỏ hàng
      </Link>
    </div>
  );
};

export default Home;
