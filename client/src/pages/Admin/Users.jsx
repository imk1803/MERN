import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminSidebar from '../../components/AdminSidebar';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Quản lý Người Dùng</h1>
            <Link 
              to="/admin/users/add" 
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center"
            >
              <i className="bi bi-person-plus mr-2"></i>
              Thêm người dùng
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tên người dùng</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/users/${user._id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            <i className="bi bi-pencil mr-1"></i>
                            Sửa
                          </Link>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
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
            <i className="bi bi-people text-4xl text-gray-400 mb-3 block"></i>
            <p className="text-gray-500">Không có người dùng nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
