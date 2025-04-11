import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/AdminStyles.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/admin/products', { withCredentials: true });
        setProducts(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', err);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/products/${id}`, { withCredentials: true });
        setProducts(products.filter(product => product._id !== id));
      } catch (err) {
        console.error('Lỗi khi xóa sản phẩm:', err);
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
          <h2 className="text-center">Quản lý Sản phẩm</h2>
          <div className="mb-4 text-end">
            <Link to="/admin/products/add" className="btn btn-success">
              <i className="bi bi-plus-lg me-2"></i> Thêm sản phẩm
            </Link>
          </div>

          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3">Đang tải dữ liệu...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Danh mục</th>
                    <th>Rating</th>
                    <th>Mô tả</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            width="80"
                            height="80"
                            className="img-thumbnail"
                          />
                        ) : (
                          <span className="text-muted">No Image</span>
                        )}
                      </td>
                      <td className="fw-semibold">{product.name}</td>
                      <td className="text-success fw-bold">
                        {product.price ? product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 VNĐ'}
                      </td>
                      <td><span className="badge bg-info text-dark">{product.category}</span></td>
                      <td>{product.rating || 'N/A'}</td>
                      <td>{product.description ? `${product.description.substring(0, 50)}...` : ''}</td>
                      <td>
                        <Link to={`/admin/products/${product._id}/edit`} className="btn btn-warning btn-sm me-2">
                          <i className="bi bi-pencil"></i> Sửa
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
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
              Không có sản phẩm nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
