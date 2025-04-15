import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, deleteOrder } from '../../services/adminOrderService';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminSidebar from '../../components/AdminSidebar';

// Delete Confirmation Modal component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, orderId }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 animate-fadeIn">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <i className="bi bi-exclamation-triangle-fill text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Xác nhận xóa</h3>
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa đơn hàng <span className="font-medium">#{orderId?.slice(-8)}</span>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition"
          >
            Xóa đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  
  // State for delete confirmation modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    orderId: null
  });
  
  // Ref để giữ focus ở ô tìm kiếm
  const searchInputRef = useRef(null);
  
  const fetchOrders = useCallback(async () => {
    try {
      if (initialLoading) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // Lấy giá trị từ state filters
      const { search, status, dateFrom, dateTo } = filters;
      const currentPage = pagination.page;
      const currentLimit = pagination.limit;
      
      console.log('Fetching orders with params:', { search, status, dateFrom, dateTo, page: currentPage, limit: currentLimit });
      
      // Gọi API với các tham số lọc
      const response = await getOrders({
        search,
        status,
        dateFrom,
        dateTo,
        page: currentPage,
        limit: currentLimit
      });
      
      if (response.success) {
        setOrders(response.orders);
        setPagination(prev => ({
          ...prev,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total
        }));
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      setError('Không thể kết nối đến máy chủ');
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, initialLoading]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Xử lý thay đổi bộ lọc tự động gọi API (trừ search)
  useEffect(() => {
    if (filters.status || filters.dateFrom || filters.dateTo) {
      // Reset về trang 1 khi thay đổi bộ lọc
      setPagination(prev => ({ ...prev, page: 1 }));
      // Gọi API
      fetchOrders();
    }
  }, [filters.status, filters.dateFrom, filters.dateTo, fetchOrders]);

  const handleDeleteOrder = async (id) => {
    // Open confirmation modal
    setDeleteModal({
      isOpen: true,
      orderId: id
    });
  };
  
  const confirmDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteOrder(deleteModal.orderId);
      
      if (response.success) {
        // Close modal
        setDeleteModal({ isOpen: false, orderId: null });
        
        // Show success notification
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50';
        successMessage.innerHTML = '<div class="flex items-center"><i class="bi bi-check-circle-fill mr-2"></i>Đã xóa đơn hàng thành công!</div>';
        document.body.appendChild(successMessage);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);
        
        // Update the orders list
        setOrders(orders.filter(order => order._id !== deleteModal.orderId));
      } else {
        setError(response.message || 'Có lỗi xảy ra khi xóa đơn hàng');
        setDeleteModal({ isOpen: false, orderId: null });
      }
    } catch (err) {
      console.error('Lỗi khi xóa đơn hàng:', err);
      setError('Không thể kết nối đến máy chủ');
      setDeleteModal({ isOpen: false, orderId: null });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Reset về trang 1 khi tìm kiếm
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
    
    // Focus vào ô tìm kiếm sau khi submit
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    
    // Gọi API tìm kiếm
    fetchOrders();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'failed':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'processing':
        return 'Đang xử lý';
      case 'pending':
        return 'Chờ xác nhận';
      case 'paid':
        return 'Đã thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, orderId: null });
  };
  
  if (initialLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="ml-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
          </div>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <form onSubmit={handleSearchSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="search" className="block text-xs font-medium text-gray-500 mb-1">
                    Tìm kiếm
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="search"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Tìm kiếm theo tên, email, username, mã đơn hàng..."
                      className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      ref={searchInputRef}
                    />
                    <button 
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 flex items-center justify-center"
                    >
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="failed">Thanh toán thất bại</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="dateFrom" className="block text-xs font-medium text-gray-500 mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    name="dateFrom"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="dateTo" className="block text-xs font-medium text-gray-500 mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    id="dateTo"
                    name="dateTo"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <i className="bi bi-exclamation-triangle-fill mr-2"></i>
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
            </div>
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id.toString().slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.user?.username ? `${order.user.username} (${order.name})` : order.name || 'Khách hàng'}
                        </div>
                        <div className="text-sm text-gray-500">{order.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(order.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/orders/${order._id}`}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            <i className="bi bi-eye mr-1"></i>
                            Chi tiết
                          </Link>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            <i className="bi bi-trash mr-1"></i>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-64">
            <p className="text-gray-500">Không có đơn hàng nào được tìm thấy.</p>
          </div>
        )}
        
        {/* Pagination */}
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10"
            >
              <i className="bi bi-chevron-left mr-2"></i>
              Trang trước
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10"
            >
              Trang sau
              <i className="bi bi-chevron-right ml-2"></i>
            </button>
          </nav>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={confirmDelete}
        orderId={deleteModal.orderId}
      />
    </div>
  );
};

export default Orders;