import axios from 'axios';

// Fix API URL to correctly point to the admin products endpoint
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/admin/products';

// Tạo instance axios với config chung
const adminAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Thêm interceptor để tự động thêm token vào header
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Lấy danh sách sản phẩm với phân trang và lọc
 * @param {Object} options - Các tùy chọn lọc và phân trang
 * @param {string} options.search - Từ khóa tìm kiếm
 * @param {string} options.category - Danh mục lọc
 * @param {string} options.sort - Sắp xếp (price_asc, price_desc, name_asc, name_desc, newest)
 * @param {number} options.page - Trang hiện tại
 * @param {number} options.limit - Số sản phẩm mỗi trang
 * @returns {Promise} Danh sách sản phẩm và thông tin phân trang
 */
export const getProducts = async (options = {}) => {
  try {
    const { search, category, sort, page = 1, limit = 10 } = options;
    
    // Xây dựng query string
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);
    params.append('page', page);
    params.append('limit', limit);
    
    const response = await adminAxios.get(`?${params.toString()}`);
    
    // Process products to ensure category format is consistent
    if (response.data && response.data.success && response.data.products) {
      response.data.products = response.data.products.map(product => {
        // Ensure category is in a consistent format
        if (product.category && typeof product.category === 'object') {
          // Make sure we have a categoryName for display
          if (!product.categoryName && product.category.name) {
            product.categoryName = product.category.name;
          }
        }
        return product;
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể kết nối đến server',
      products: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      categories: []
    };
  }
};

/**
 * Lấy chi tiết sản phẩm theo ID
 * @param {string} productId - ID của sản phẩm
 * @returns {Promise} Thông tin chi tiết sản phẩm
 */
export const getProductById = async (productId) => {
  try {
    const response = await adminAxios.get(`/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy sản phẩm ID ${productId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể kết nối đến server'
    };
  }
};

/**
 * Tạo sản phẩm mới
 * @param {FormData} productData - Form data chứa thông tin sản phẩm và hình ảnh
 * @returns {Promise} Thông tin sản phẩm mới tạo
 */
export const createProduct = async (productData) => {
  try {
    const response = await adminAxios.post('/', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể kết nối đến server'
    };
  }
};

/**
 * Cập nhật sản phẩm
 * @param {string} productId - ID của sản phẩm cần cập nhật
 * @param {FormData} productData - Form data chứa thông tin sản phẩm cập nhật
 * @returns {Promise} Thông tin sản phẩm sau khi cập nhật
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await adminAxios.put(`/${productId}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật sản phẩm ID ${productId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể kết nối đến server'
    };
  }
};

/**
 * Xóa sản phẩm
 * @param {string} productId - ID của sản phẩm cần xóa
 * @returns {Promise} Kết quả xóa sản phẩm
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await adminAxios.delete(`/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa sản phẩm ID ${productId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể kết nối đến server'
    };
  }
};

/**
 * Lấy danh sách các danh mục sản phẩm
 * @returns {Promise} Danh sách các danh mục
 */
export const getCategories = async () => {
  try {
    // Change the endpoint to use the admin categories API instead
    const response = await axios.get('http://localhost:5000/api/admin/categories', {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể kết nối đến server',
      categories: [],
      flatCategories: []
    };
  }
}; 