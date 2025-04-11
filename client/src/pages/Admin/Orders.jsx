import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/AdminStyles.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Đã giao':
        return 'bg-success';
      case 'Đang xử lý':
        return 'bg-warning';
      default:
        return 'bg-danger';
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <h4>Admin Panel</h4>
          <Link to="/admin/dashboard"><i className="fas fa-tachometer-alt"></i> Dashboard</Link>
          <Link to="/admin/users"><i className="fas fa-users"></i> Users</Link>
          <Link to="/admin/products"><i className="fas fa-box"></i> Products</Link>
          <Link to="/admin/orders"><i className="fas fa-shopping-cart"></i> Orders</Link>
          <Link to="/"><i className="fas fa-arrow-left"></i> Quay lại trang chủ</Link>
        </div>

        {/* Main Content */}
        <div className="admin-content container">
          <h2 className="text-center">Quản lý Đơn hàng</h2>

          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID Đơn hàng</th>
                    <th>Tên người dùng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="fw-semibold">{order._id}</td>
                      <td>{order.userId ? order.userId.username : 'Unknown'}</td>
                      <td className="text-success fw-bold">
                        {order.totalAmount ? order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 VNĐ'}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/orders/${order._id}`} className="btn btn-primary btn-sm me-2">
                          <i className="bi bi-eye"></i> Chi tiết
                        </Link>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="btn btn-danger btn-sm"
                        >
                          <i className="bi bi-trash"></i> Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info text-center" role="alert">
              Không có đơn hàng nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
