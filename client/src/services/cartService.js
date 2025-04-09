import axios from 'axios';

const handleAddToCart = async (productId, navigate) => {
    try {
      await axios.post(
        `http://localhost:5000/api/cart/cart/add/${productId}`,
        {},
        { withCredentials: true }
      );
  
      alert(`✅ Đã thêm sản phẩm vào giỏ hàng!`);
  
      // Kiểm tra navigate có phải function trước khi gọi
      if (typeof navigate === 'function') {
        navigate('/cart');
      }
    } catch (err) {
      console.error('❌ Lỗi thêm vào giỏ hàng:', err);
      alert('❌ Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!');
    }
  };
  

export default handleAddToCart;
