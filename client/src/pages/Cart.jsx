import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cart', { withCredentials: true });
      setCart(res.data.cart);
    } catch (err) {
      console.error('Lỗi lấy giỏ hàng:', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const increment = async (id) => {
    await axios.post(`http://localhost:5000/api/cart/increment/${id}`, {}, { withCredentials: true });
    fetchCart();
  };

  const decrement = async (id) => {
    await axios.post(`http://localhost:5000/api/cart/decrement/${id}`, {}, { withCredentials: true });
    fetchCart();
  };

  const remove = async (id) => {
    await axios.post(`http://localhost:5000/api/cart/remove/${id}`, {}, { withCredentials: true });
    fetchCart();
  };

  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-4">🛒 Giỏ hàng của bạn</h1>
      {cart.length === 0 ? (
        <p className="text-center">Giỏ hàng trống!</p>
      ) : (
        <div className="space-y-4">
          {cart.map((product) => (
            <div key={product._id} className="flex items-center bg-white p-4 rounded-lg shadow-md">
              <img src={`http://localhost:5000${product.image}`} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="ml-4 flex-grow">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p>Giá: {product.price.toLocaleString()} VND</p>
                <p>Số lượng: {product.quantity}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => increment(product._id)} className="bg-gray-300 px-2 py-1 rounded">+</button>
                <button onClick={() => decrement(product._id)} className="bg-gray-300 px-2 py-1 rounded">-</button>
                <button onClick={() => remove(product._id)} className="bg-red-500 text-white px-2 py-1 rounded">Xoá</button>
              </div>
            </div>
          ))}

          <div className="text-center mt-4 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-bold">Tổng tiền: {total.toLocaleString()} VND</h3>
            <Link to="/checkout" className="mt-4 inline-block bg-green-500 text-white px-6 py-2 rounded-lg">Thanh Toán</Link>
          </div>
        </div>
      )}
      <Link to="/" className="block text-center mt-4 text-blue-500">← Quay lại cửa hàng</Link>
    </div>
  );
};

export default Cart;
