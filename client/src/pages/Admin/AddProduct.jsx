import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AdminStyles.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    rating: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await axios.post('http://localhost:5000/api/admin/products', product, { withCredentials: true });
      setLoading(false);
      navigate('/admin/products');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi thêm sản phẩm');
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
          <h2 className="text-center mb-4">Thêm sản phẩm mới</h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} className="card shadow p-4">
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Tên sản phẩm:</label>
              <input 
                type="text" 
                className="form-control" 
                id="name" 
                name="name" 
                value={product.name}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="mb-3">
              <label htmlFor="price" className="form-label">Giá:</label>
              <input 
                type="number" 
                className="form-control" 
                id="price" 
                name="price" 
                value={product.price}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="mb-3">
              <label htmlFor="image" className="form-label">Hình ảnh (URL:/images/...):</label>
              <input 
                type="text" 
                className="form-control" 
                id="image" 
                name="image"
                value={product.image}
                onChange={handleChange} 
              />
            </div>

            <div className="mb-3">
              <label htmlFor="category" className="form-label">Danh mục:</label>
              <input 
                type="text" 
                className="form-control" 
                id="category" 
                name="category"
                value={product.category}
                onChange={handleChange} 
              />
            </div>

            <div className="mb-3">
              <label htmlFor="rating" className="form-label">Rating (1-5):</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                id="rating" 
                name="rating"
                value={product.rating}
                onChange={handleChange} 
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Mô tả:</label>
              <textarea 
                className="form-control" 
                id="description" 
                name="description" 
                rows="3"
                value={product.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="d-flex gap-2">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Thêm sản phẩm'}
              </button>
              <Link to="/admin/products" className="btn btn-secondary">Hủy</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct; 