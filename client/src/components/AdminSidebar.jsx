import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AdminSidebar = () => {
  const location = useLocation();
  const menuItems = [
    { path: '/admin/dashboard', icon: 'bi bi-speedometer2', label: 'Dashboard' },
    { path: '/admin/products', icon: 'bi bi-box', label: 'Products' },
    { path: '/admin/categories', icon: 'bi bi-tags', label: 'Categories' },
    { path: '/admin/orders', icon: 'bi bi-cart', label: 'Orders' },
    { path: '/admin/users', icon: 'bi bi-people', label: 'Users' },
    { path: '/', icon: 'bi bi-house', label: 'Home' }
  ];

  // Check if current path starts with the menu item path
  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    
    // Special case for home path to prevent it from matching all routes
    if (path === '/') {
      return location.pathname === '/';
    }
    
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <img
          src="https://i.pinimg.com/736x/43/5d/09/435d096b52b0be4816d214c05ab0c22e.jpg"
          alt="Logo"
          className="h-10 w-10 rounded-full mb-2"
        />
        <h1 className="text-2xl font-bold text-indigo-600">CurvoTech Admin</h1>
      </div>
      <nav className="mt-4">
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`px-6 py-3 ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Link to={item.path} className="flex items-center">
                <i className={`${item.icon} mr-3`}></i>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar; 