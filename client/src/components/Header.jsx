import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userLogout } from '../store/userSlice';
import { useNotification } from '../contexts/NotificationContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { showNotification } = useNotification();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Kiểm tra xem có thông báo trong state location không
  useEffect(() => {
    console.log("location state:", location.state);
    if (location.state?.notification) {
      showNotification(
        location.state.notification.message,
        location.state.notification.type || 'success'
      );
      
      // Xóa thông báo khỏi location state để không hiển thị lại khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showNotification]);

  // Xử lý tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Xử lý đăng xuất
const handleLogout = async () => {
  if (isLoggingOut) return;
  
  try {
    setIsLoggingOut(true);
    await dispatch(userLogout()).unwrap();
    
    // Xóa token
    localStorage.removeItem('token');
    
    // Hiển thị thông báo
    showNotification('Đăng xuất thành công!', 'success');

    // Đợi 1 giây rồi chuyển hướng
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Chuyển hướng về trang login 
    navigate('/login', { replace: true });

  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    showNotification('Đăng xuất thất bại!', 'error');
  } finally {
    setIsLoggingOut(false);
  }
};

  return (
    <header className="bg-gray shadow-md relative">
      <div className="container mx-auto p-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="https://i.pinimg.com/736x/43/5d/09/435d096b52b0be4816d214c05ab0c22e.jpg"
            alt="Logo"
            className="h-20 w-20 rounded-full"
          />
          <span className="ml-2 text-xl font-bold">
            <Link to="/" className="text-gray-800 hover:text-blue-500">
              CurvoTech
            </Link>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-4">
          <strong>
            <Link to="/" className="text-gray-700 hover:text-blue-500 mx-4">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-500 mx-4">
              Sản phẩm
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-500 mx-4">
              Giới thiệu
            </Link>
          </strong>
        </nav>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm kiếm..."
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </form>
        </div>

        {/* Login/Logout */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="text-gray-700 hover:text-blue-500 flex items-center"
                >
                  <i className="fas fa-cog mr-2"></i> Quản lý Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="text-gray-700 hover:text-blue-500 flex items-center"
              >
                <i className="fas fa-user mr-2"></i> {user.username}
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`text-gray-700 hover:text-blue-500 flex items-center
                  ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoggingOut ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-out-alt mr-2"></i> Đăng xuất
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-500 flex items-center"
              >
                <i className="fas fa-sign-in-alt mr-2"></i> Đăng nhập
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-blue-500 flex items-center"
              >
                <i className="fas fa-user-plus mr-2"></i> Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;