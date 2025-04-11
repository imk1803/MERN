import axios from 'axios';

const handleAddToCart = async (productId, showNotification) => {
    try {
      await axios.post(
        `http://localhost:5000/api/cart/cart/add/${productId}`,
        {},
        { withCredentials: true }
      );
  
      // Use the notification callback if provided, otherwise fallback to alert
      if (typeof showNotification === 'function') {
        showNotification('Đã thêm sản phẩm vào giỏ hàng!', 'success');
      } else {
        alert(`✅ Đã thêm sản phẩm vào giỏ hàng!`);
      }
    } catch (err) {
      console.error('❌ Lỗi thêm vào giỏ hàng:', err);
      if (typeof showNotification === 'function') {
        showNotification('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!', 'error');
      } else {
        alert('❌ Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!');
      }
    }
  };
  

export default handleAddToCart;
