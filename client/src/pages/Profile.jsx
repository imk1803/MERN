import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    console.log('Profile useEffect triggered once');

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Token found, fetching profile...');
        const response = await axios.get('/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (isMounted) {
          setUser(response.data.user);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          if (isMounted) {
            navigate('/login');
          }
        } else if (isMounted) {
          setError('Có lỗi xảy ra khi tải thông tin người dùng');
          setIsLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]); // Added navigate to the dependency array

  if (isLoading) {
    return <div className="text-center py-10">Đang tải thông tin...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {user ? (
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">Thông tin tài khoản</h1>
          <div className="mb-4">
            <p className="text-gray-700"><span className="font-semibold">Tên đăng nhập:</span> {user.username}</p>
            <p className="text-gray-700"><span className="font-semibold">Vai trò:</span> {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p>Vui lòng đăng nhập để xem thông tin tài khoản</p>
        </div>
      )}
    </div>
  );
};

export default Profile; 