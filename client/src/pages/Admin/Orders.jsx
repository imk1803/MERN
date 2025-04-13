import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminSidebar from '../../components/AdminSidebar';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/admin/orders', { withCredentials: true });
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', err);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này không?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/orders/${id}`, { withCredentials: true });
        setOrders(orders.filter(order => order._id !== id));
      } catch (err) {
        console.error('Lỗi khi xóa đơn hàng:', err);
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
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
      case 'delivered':
        return 'Đã giao hàng';
      case 'shipped':
        return 'Đang giao hàng';
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

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4">Đang tải dữ liệu...</p>
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
                        <div className="text-sm text-gray-900">{order.name || 'Khách hàng'}</div>
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
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <i className="bi bi-inbox text-4xl text-gray-400 mb-3 block"></i>
            <p className="text-gray-500">Không có đơn hàng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
