import axios from 'axios';

const paymentAPI = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Initiate a payment with MoMo
 * @param {Object} orderData - Order data including amount, orderId, etc.
 * @returns {Promise} - Response from the payment gateway
 */
const initiateMomoPayment = async (orderData) => {
  try {
    console.log('Initiating MoMo payment with data:', orderData);
    const response = await paymentAPI.post('/payment/momo/create', orderData);
    console.log('MoMo payment response from API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi khởi tạo thanh toán MoMo:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Initiate an online banking payment
 * @param {Object} orderData - Order data including amount, orderId, bank info, etc.
 * @returns {Promise} - Response from the payment gateway
 */
const initiateOnlineBankingPayment = async (orderData) => {
  try {
    const response = await paymentAPI.post('/payment/banking/create', orderData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khởi tạo thanh toán qua ngân hàng:', error);
    throw error;
  }
};

/**
 * Verify payment status
 * @param {String} paymentId - Payment reference ID
 * @param {String} type - Payment type (momo, banking)
 * @returns {Promise} - Payment verification response
 */
const verifyPayment = async (paymentId, type) => {
  try {
    console.log(`Verifying payment for ${type}, ID: ${paymentId}`);
    
    // Xử lý riêng cho từng loại thanh toán
    if (type === 'momo') {
      // Đối với momo, thử gọi trực tiếp verify đơn hàng thay vì qua endpoint riêng
      const response = await paymentAPI.get(`/payment/verify/${paymentId}`);
      console.log('Verify response:', response.data);
      return response.data;
    } 
    
    // Các loại thanh toán khác
    const response = await paymentAPI.get(`/payment/${type}/verify/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Lỗi xác minh thanh toán:', error);
    throw error;
  }
};

/**
 * Get payment methods
 * @returns {Promise} - Available payment methods
 */
const getPaymentMethods = async () => {
  try {
    const response = await paymentAPI.get('/payment/methods');
    return response.data;
  } catch (error) {
    console.error('Lỗi lấy phương thức thanh toán:', error);
    throw error;
  }
};

export {
  initiateMomoPayment,
  initiateOnlineBankingPayment,
  verifyPayment,
  getPaymentMethods
}; 