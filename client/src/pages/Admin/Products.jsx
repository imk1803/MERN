import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../services/adminProductService';
import { getCategories } from '../../services/adminCategoryService';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminSidebar from '../../components/AdminSidebar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'newest'
  });
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  // Fetch products with current filters and pagination
  const fetchProductsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get categories first to use for product mapping
      const categoriesResponse = await getCategories();
      if (categoriesResponse.success) {
        // Make sure we only use the necessary fields from categories
        const simplifiedCategories = categoriesResponse.categories.map(cat => ({
          _id: cat._id,
          name: cat.name
        }));
        setCategories(simplifiedCategories);
      }
      
      const options = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await getProducts(options);
      
      if (response.success) {
        // Process products to ensure category is properly formatted
        const processedProducts = response.products.map(product => {
          // Make a copy of the product to avoid mutation
          const processedProduct = { ...product };
          
          // Convert category to string or object with name if it's just an ID object
          if (processedProduct.category) {
            if (typeof processedProduct.category === 'object') {
              // If category is an object with a name, use that
              if (processedProduct.category.name) {
                processedProduct.categoryName = processedProduct.category.name;
              } 
              // Otherwise try to find the category in our categories list
              else {
                const categoryList = categoriesResponse.success ? 
                  categoriesResponse.categories || [] : [];
                  
                const matchingCategory = categoryList.find(
                  cat => cat._id === (processedProduct.category._id || processedProduct.category)
                );
                
                if (matchingCategory) {
                  processedProduct.categoryName = matchingCategory.name;
                } else {
                  processedProduct.categoryName = 'Unknown';
                }
              }
            } else if (typeof processedProduct.category === 'string') {
              // If category is already a string, keep it as is
              processedProduct.categoryName = processedProduct.category;
            }
          } else {
            processedProduct.categoryName = 'N/A';
          }
          
          return processedProduct;
        });
        
        setProducts(processedProducts);
        setPagination({
          ...pagination,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        });
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải dữ liệu');
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sản phẩm:', err);
      setError(err.response?.data?.message || 'Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchProductsData();
  }, [fetchProductsData]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      try {
        setLoading(true);
        const response = await deleteProduct(id);
        
        if (response.success) {
          // Nếu xóa thành công, cập nhật danh sách sản phẩm
          setProducts(products.filter(product => product._id !== id));
          alert('Xóa sản phẩm thành công!');
        } else {
          setError(response.message || 'Có lỗi xảy ra khi xóa sản phẩm');
        }
      } catch (err) {
        console.error('Lỗi khi xóa sản phẩm:', err);
        setError(err.response?.data?.message || 'Không thể kết nối đến server');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    
    // Reset to page 1 when filters change
    setPagination({
      ...pagination,
      page: 1
    });
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Fetch data with current filters and reset to page 1
    setPagination({
      ...pagination,
      page: 1
    });
    fetchProductsData();
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({
        ...pagination,
        page: newPage
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-auto">
        {/* Header and Search */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
            <Link 
              to="/admin/products/add" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center"
            >
              <i className="bi bi-plus-lg mr-2"></i>
              Thêm sản phẩm
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <form onSubmit={handleSearchSubmit} className="flex">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tìm kiếm tên sản phẩm..."
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                />
                <button 
                  type="submit" 
                  className="bg-indigo-600 text-white px-4 rounded-r-md hover:bg-indigo-700"
                >
                  <i className="bi bi-search"></i>
                </button>
              </form>
            </div>
            <div className="flex space-x-2">
              <select
                className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="name_asc">Tên A-Z</option>
                <option value="name_desc">Tên Z-A</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <i className="bi bi-exclamation-triangle-fill mr-2"></i>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.image ? (
                          <img
                            src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
                            alt={product.name}
                            className="h-16 w-16 rounded-md object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/80x80?text=No+Image";
                            }}
                          />
                        ) : (
                          <img 
                            src="https://placehold.co/80x80?text=No+Image" 
                            alt="Sản phẩm" 
                            className="h-16 w-16 rounded-md object-cover" 
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          {product.categoryName || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.rating ? (
                          <div className="flex items-center">
                            <span className="text-sm text-gray-800 mr-1">{product.rating}</span>
                            <i className="bi bi-star-fill text-yellow-400"></i>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.description ? (
                          <span className="text-sm text-gray-800 truncate block max-w-[150px]">
                            {product.description}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/products/${product._id}`}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            <i className="bi bi-pencil-fill mr-1"></i>
                            Sửa
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            <i className="bi bi-trash-fill mr-1"></i>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 flex justify-center">
                  <nav className="flex items-center">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`mr-2 px-2 py-1 rounded-md ${
                        pagination.page === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    
                    {[...Array(pagination.totalPages).keys()].map(page => (
                      <button
                        key={page + 1}
                        onClick={() => handlePageChange(page + 1)}
                        className={`mx-1 px-3 py-1 rounded-md ${
                          pagination.page === page + 1
                            ? 'bg-indigo-600 text-white'
                            : 'text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {page + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className={`ml-2 px-2 py-1 rounded-md ${
                        pagination.page === pagination.totalPages
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <i className="bi bi-inbox text-4xl text-gray-400 mb-3 block"></i>
            <p className="text-gray-500">Không có sản phẩm nào. Hãy thêm sản phẩm mới!</p>
            <Link
              to="/admin/products/add"
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              <i className="bi bi-plus-lg mr-2"></i>
              Thêm sản phẩm
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
