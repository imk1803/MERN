import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/AdminStyles.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/admin/users', { withCredentials: true });
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách người dùng:', err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { withCredentials: true });
        setUsers(users.filter(user => user._id !== id));
      } catch (err) {
        console.error('Lỗi khi xóa người dùng:', err);
      }
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
          <h2 className="text-center">Quản lý Người dùng</h2>
          <div className="mb-4 text-end">
            <Link to="/admin/users/add" className="btn btn-success">
              <i className="bi bi-person-plus me-2"></i> Thêm người dùng
            </Link>
          </div>

          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Tên người dùng</th>
                    <th>Vai trò</th>
                    <th>Ngày tham gia</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="fw-semibold">{user.username}</td>
                      <td>
                        <span 
                          className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'} text-uppercase`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td>
                        <Link to={`/admin/users/${user._id}/edit`} className="btn btn-warning btn-sm me-2">
                          <i className="bi bi-pencil"></i> Sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
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
              Không có người dùng nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
