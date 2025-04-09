import axios from 'axios';

// Sử dụng biến môi trường cho API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/users';

// Tạo axios instance với cấu hình chung
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Xử lý lỗi chung
const handleError = (error) => {
  const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi';
  throw new Error(errorMessage);
};

// Thêm interceptor để xử lý request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ xóa token, không chuyển hướng tự động
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      console.log('Token removed due to 401 error');
    }
    return Promise.reject(error);
  }
);

/**
 * Đăng ký tài khoản mới
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @param {string} confirmPassword - Xác nhận mật khẩu
 * @returns {Promise} Thông tin người dùng sau khi đăng ký
 */
export const register = async (username, password, confirmPassword) => {
  try {
    const response = await axiosInstance.post('/register', {
      username,
      password,
      confirmPassword,
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Đăng nhập
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise} Thông tin người dùng sau khi đăng nhập
 */
export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('/login', {
      username,
      password,
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Đăng xuất
 * @returns {Promise} Kết quả đăng xuất
 */
export const logout = async () => {
  try {
    const response = await axiosInstance.post('/logout');
    // Xóa token
    localStorage.removeItem('token');
    // Xóa headers authorization
    delete axiosInstance.defaults.headers.common['Authorization'];
    return response.data;
  } catch (error) {
    // Đảm bảo xóa token ngay cả khi có lỗi
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    handleError(error);
  }
};

/**
 * Lấy thông tin người dùng
 * @returns {Promise} Thông tin người dùng
 */
export const getProfile = async () => {
  try {
    // Kiểm tra token trước khi gọi API
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await axiosInstance.get('/profile');
    return response.data;
  } catch (error) {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Không chuyển hướng tại đây để tránh vòng lặp
      console.log('Unauthorized: Token invalid or expired');
    }
    return Promise.reject(error);
  }
};