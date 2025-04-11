const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');

// Momo config - cấu hình Sandbox để testing
const MOMO_CONFIG = {
  partnerCode: 'MOMOBKUN20180529',       // Mã đối tác MoMo sandbox
  accessKey: 'klm05TvNBzhg7h7j',         // Access key MoMo sandbox
  secretKey: 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa', // Secret key MoMo sandbox
  redirectUrl: 'http://localhost:3000/payment/result',
  ipnUrl: 'http://localhost:5000/api/payment/momo/ipn',
  requestType: 'captureWallet',
  // Sử dụng endpoint Sandbox của MoMo
  endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create'
};

// Danh sách ngân hàng hỗ trợ
const SUPPORTED_BANKS = [
  { id: 'VIETCOMBANK', name: 'Vietcombank', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-Vietcombank.png' },
  { id: 'TECHCOMBANK', name: 'Techcombank', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-TCB-V.png' },
  { id: 'BIDV', name: 'BIDV', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-BIDV-.png' },
  { id: 'VIETINBANK', name: 'Vietinbank', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VietinBank-CTG-Te.png' },
  { id: 'MBBANK', name: 'MB Bank', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-MB-Bank-MBB.png' },
  { id: 'TPBANK', name: 'TPBank', logo: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-TPBank.png' },
];

// API lấy danh sách phương thức thanh toán
router.get('/methods', (req, res) => {
  const paymentMethods = [
    {
      id: 'momo',
      name: 'Ví MoMo',
      logo: 'https://static.mservice.io/img/logo-momo.png',
      description: 'Thanh toán nhanh chóng qua ví MoMo'
    },
    {
      id: 'banking',
      name: 'Chuyển khoản ngân hàng',
      logo: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png',
      description: 'Thanh toán bằng chuyển khoản ngân hàng',
      banks: SUPPORTED_BANKS
    },
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng',
      logo: 'https://cdn-icons-png.flaticon.com/512/1554/1554401.png',
      description: 'Thanh toán khi nhận được sản phẩm'
    }
  ];
  
  res.json({ success: true, paymentMethods });
});

// Tạo thanh toán MoMo
router.post('/momo/create', async (req, res) => {
  try {
    const { orderId, amount, orderInfo = 'Thanh toán đơn hàng' } = req.body;
    
    // Chuyển đổi amount sang kiểu số nguyên nếu cần
    const amountInt = parseInt(amount);
    
    // Tạo requestId duy nhất
    const requestId = `${Date.now()}`;
    
    // Tạo signature để xác thực - Đảm bảo thứ tự tham số đúng theo MoMo yêu cầu
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amountInt}&extraData=&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${MOMO_CONFIG.requestType}`;
    
    console.log('Raw signature:', rawSignature);
    
    const signature = crypto.createHmac('sha256', MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest('hex');
    
    console.log('Generated signature:', signature);
    
    // Tạo payload cho MoMo API
    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId: requestId,
      amount: amountInt,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      extraData: "",
      requestType: MOMO_CONFIG.requestType,
      signature: signature,
      lang: "vi"
    };
    
    console.log('Sending request to MoMo Sandbox:', JSON.stringify(requestBody));
    
    // Gọi API MoMo Sandbox
    const response = await axios.post(MOMO_CONFIG.endpoint, requestBody);
    
    console.log('MoMo Sandbox response:', response.data);
    
    // Lưu thông tin giao dịch vào database
    // (Triển khai thêm phần lưu transaction vào DB)
    
    // Trả về kết quả
    return res.json({
      success: true,
      payUrl: response.data.payUrl,
      orderId: orderId,
      requestId: requestId
    });
    
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán MoMo:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Không thể khởi tạo thanh toán MoMo',
      error: error.response?.data || error.message
    });
  }
});

// Xử lý callback từ MoMo (IPN - Instant Payment Notification)
router.post('/momo/ipn', async (req, res) => {
  try {
    const { 
      orderId, requestId, amount, orderInfo, 
      orderType, transId, resultCode, message, 
      payType, responseTime, extraData, signature 
    } = req.body;
    
    // Validate signature từ MoMo
    // Cập nhật trạng thái đơn hàng trong database
    
    if (resultCode === '0') {
      // Thanh toán thành công
      // Cập nhật trạng thái đơn hàng
      await Order.findOneAndUpdate(
        { _id: orderId },
        { 
          status: 'paid',
          paymentDetails: {
            method: 'momo',
            transactionId: transId,
            amount: amount,
            paidAt: new Date(parseInt(responseTime))
          }
        }
      );
    }
    
    // Phản hồi cho MoMo
    return res.json({ status: 'OK' });
    
  } catch (error) {
    console.error('Lỗi khi xử lý MoMo IPN:', error);
    return res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Tạo thanh toán chuyển khoản ngân hàng
router.post('/banking/create', async (req, res) => {
  try {
    const { orderId, amount, bankId, customerInfo } = req.body;
    
    // Tạo thông tin thanh toán
    const accountDetails = {
      bankId: bankId,
      accountNumber: '0123456789', // Số tài khoản doanh nghiệp (thay bằng số thật)
      accountName: 'CONG TY MERN', // Tên tài khoản (thay bằng tên thật)
      amount: amount,
      content: `Thanh toan ${orderId}` // Nội dung chuyển khoản
    };
    
    // Lưu thông tin đơn hàng và cập nhật trạng thái
    await Order.findOneAndUpdate(
      { _id: orderId },
      { 
        status: 'pending',
        paymentDetails: {
          method: 'banking',
          bankId: bankId,
          amount: amount,
          transferContent: accountDetails.content
        }
      }
    );
    
    // Trả về thông tin thanh toán
    return res.json({
      success: true,
      paymentInfo: accountDetails,
      orderId: orderId
    });
    
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán ngân hàng:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể khởi tạo thanh toán ngân hàng',
      error: error.message
    });
  }
});

// Xác minh thanh toán
router.get('/verify/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Truy vấn thông tin đơn hàng
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }
    
    return res.json({
      success: true,
      orderId: order._id,
      status: order.status,
      paymentDetails: order.paymentDetails
    });
    
  } catch (error) {
    console.error('Lỗi khi xác minh thanh toán:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể xác minh thanh toán',
      error: error.message
    });
  }
});

module.exports = router; 