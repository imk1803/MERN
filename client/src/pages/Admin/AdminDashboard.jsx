import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../styles/AdminStyles.css';
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentOrders: []
  });
  
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');
        
        // Gọi API với token trong header
        const res = await axios.get('http://localhost:5000/api/admin/stats', { 
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true 
        });
        
        if (res.data && res.data.success) {
          setStats(res.data);
        } else {
          setError('Không thể tải dữ liệu thống kê');
        }
      } catch (err) {
        console.error('Lỗi khi lấy thống kê:', err);
        setError(err.response?.data?.message || 'Không thể kết nối đến server');
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <div className="sidebar-menu">
          <Link to="/admin/dashboard" className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}>
            <i className="fas fa-users"></i>
            <span>Users</span>
          </Link>
          <Link to="/admin/products" className={location.pathname === '/admin/products' ? 'active' : ''}>
            <i className="fas fa-box"></i>
            <span>Products</span>
          </Link>
          <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}>
            <i className="fas fa-shopping-cart"></i>
            <span>Orders</span>
          </Link>
          <div className="sidebar-divider"></div>
          <Link to="/">
            <i className="fas fa-arrow-left"></i>
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-content">
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Welcome to your admin dashboard</p>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="alert-error">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="stats-cards">
            <div className="stat-card users">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-details">
                <h3>{stats?.totalUsers || 0}</h3>
                <p>Tổng người dùng</p>
              </div>
            </div>
            
            <div className="stat-card products">
              <div className="stat-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="stat-details">
                <h3>{stats?.totalProducts || 0}</h3>
                <p>Tổng sản phẩm</p>
              </div>
            </div>
            
            <div className="stat-card orders">
              <div className="stat-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="stat-details">
                <h3>{stats?.totalOrders || 0}</h3>
                <p>Tổng đơn đặt hàng</p>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="recent-orders">
            <div className="section-header">
              <h2>Recent Orders</h2>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người dùng</th>
                    <th>Ngày</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id.substring(0, 8)}...</td>
                        <td>{order?.userId?.username || 'Không rõ'}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                        <td>
                          <Link to={`/admin/orders/${order._id}`} className="view-btn">
                            <i className="fas fa-eye"></i> Xem
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">Không có đơn hàng nào gần đây.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 