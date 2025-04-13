import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import AdminSidebar from '../../components/AdminSidebar';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Đăng ký các thành phần cần thiết cho Chart.js
Chart.register(...registerables);

// Components
const StatsCard = ({ title, value, change, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wider">{title}</h2>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        <p className={`${change >= 0 ? 'text-green-500' : 'text-red-500'} text-sm font-medium mt-2`}>
          {change >= 0 ? '↑' : '↓'} {change >= 0 ? 'Tăng' : 'Giảm'} {Math.abs(change)}%
        </p>
      </div>
      <div className="bg-indigo-50 p-3 rounded-lg">
        <i className={`${icon} text-2xl text-indigo-600`}></i>
      </div>
    </div>
  </div>
);

const SalesChart = ({ chartRef }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold text-gray-800">DOANH SỐ HÀNG THÁNG</h2>
      <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
        <i className="fas fa-ellipsis-v"></i>
      </button>
    </div>
    <div className="h-80">
      <canvas ref={chartRef} id="monthlySalesChart"></canvas>
    </div>
  </div>
);

const StatusChart = ({ chartRef }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-lg font-semibold text-gray-800">TRẠNG THÁI ĐƠN HÀNG</h2>
      <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
        <i className="fas fa-ellipsis-v"></i>
      </button>
    </div>
    <div className="h-80">
      <canvas ref={chartRef} id="orderStatusChart"></canvas>
    </div>
  </div>
);

const RecentOrders = ({ orders = [] }) => {
  console.log('Recent orders received:', orders);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            Xem tất cả
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left bg-gray-50">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Người dùng</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.isArray(orders) && orders.length > 0 ? (
              orders.map((order) => {
                // Lấy sản phẩm đầu tiên từ mảng products
                const firstProduct = order?.products?.[0] || {};
                
                return (
                  <tr key={order?._id || 'unknown'} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order?._id?.toString().slice(-8) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            alt={firstProduct?.name || "Sản phẩm"} 
                            className="h-10 w-10 rounded-full object-cover"
                            src={firstProduct?.image || "https://placehold.co/40x40"}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/40x40";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {firstProduct?.name || "Sản phẩm không xác định"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND' 
                            }).format(firstProduct?.price || 0)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {firstProduct?.quantity || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order?.name || 'Khách hàng'}</div>
                      <div className="text-sm text-gray-500">{order?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order?.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order?.status === 'processing' ? 'bg-indigo-100 text-indigo-800' :
                        order?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order?.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        order?.status === 'failed' ? 'bg-orange-100 text-orange-800' :
                        order?.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order?.status === 'delivered' ? 'Đã giao hàng' :
                         order?.status === 'shipped' ? 'Đang giao hàng' :
                         order?.status === 'processing' ? 'Đang xử lý' :
                         order?.status === 'pending' ? 'Chờ xác nhận' :
                         order?.status === 'paid' ? 'Đã thanh toán' :
                         order?.status === 'failed' ? 'Thanh toán thất bại' :
                         order?.status === 'cancelled' ? 'Đã hủy' :
                         'Không xác định'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(order?.totalAmount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/orders/${order?._id}`}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors duration-200"
                      >
                        <i className="fas fa-eye mr-1"></i>
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  Không có đơn hàng nào gần đây
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    recentOrders: [],
    allOrders: []
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const statusChartRef = useRef(null);
  const chartInstance = useRef(null);
  const statusChartInstance = useRef(null);

  // Tạo axios instance
  const axiosInstance = useMemo(() => axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }), []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('Đang lấy thống kê...');

        // Lấy thông tin thống kê từ API
        const statsResponse = await axiosInstance.get('/api/admin/stats');
        console.log('Response thống kê từ API:', statsResponse.data);

        if (!statsResponse.data.success) {
          throw new Error(statsResponse.data.message || 'Không thể lấy thống kê');
        }

        // Lấy chi tiết đơn hàng gần đây với thông tin sản phẩm
        const recentOrdersWithDetails = await Promise.all(
          statsResponse.data.recentOrders.map(async (order) => {
            const productsWithDetails = await Promise.all(
              (order.products || []).map(async (product) => {
                try {
                  // Đảm bảo productId là một string hợp lệ
                  const productId = product.productId?._id || product.productId;
                  if (!productId) {
                    throw new Error('Invalid product ID');
                  }
                  
                  const productRes = await axiosInstance.get(`/api/products/${productId}`);
                  return {
                    ...product,
                    ...productRes.data.product
                  };
                } catch (err) {
                  console.error('Lỗi khi lấy thông tin sản phẩm:', err);
                  return {
                    ...product,
                    name: 'Sản phẩm không xác định',
                    price: 0,
                    image: null
                  };
                }
              })
            );

            return {
              ...order,
              products: productsWithDetails
            };
          })
        );

        // Tính % tăng giảm cho users, products, orders dựa trên tất cả đơn hàng
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Hàm tính % thay đổi với giới hạn và làm tròn
        const calculatePercentageChange = (current, previous) => {
          if (previous === 0) return 10; // Giới hạn tăng trưởng tối đa khi không có dữ liệu tháng trước
          const change = ((current - previous) / previous) * 100;
          
          // Giới hạn % tăng/giảm trong khoảng -15 đến 15
          const limitedChange = Math.max(Math.min(change, 15), -15);
          
          // Làm tròn đến 0.5
          return Math.round(limitedChange * 2) / 2;
        };

        // Đếm số lượng đơn hàng tháng này và tháng trước
        const thisMonthOrders = statsResponse.data.allOrders.filter(order => 
          new Date(order.createdAt) >= thisMonth
        ).length;

        const lastMonthOrders = statsResponse.data.allOrders.filter(order => 
          new Date(order.createdAt) >= lastMonth && new Date(order.createdAt) < thisMonth
        ).length;

        // Tính % thay đổi đơn hàng
        const orderChange = calculatePercentageChange(thisMonthOrders, lastMonthOrders);

        // Tính % thay đổi users
        const thisMonthUsers = new Set(
          statsResponse.data.allOrders
            .filter(order => new Date(order.createdAt) >= thisMonth)
            .map(order => order.userId)
        ).size;

        const lastMonthUsers = new Set(
          statsResponse.data.allOrders
            .filter(order => new Date(order.createdAt) >= lastMonth && new Date(order.createdAt) < thisMonth)
            .map(order => order.userId)
        ).size;

        const userChange = calculatePercentageChange(thisMonthUsers, lastMonthUsers);

        // Tính % thay đổi products
        const thisMonthProducts = new Set(
          statsResponse.data.allOrders
            .filter(order => new Date(order.createdAt) >= thisMonth)
            .flatMap(order => order.products.map(p => p.productId))
        ).size;

        const lastMonthProducts = new Set(
          statsResponse.data.allOrders
            .filter(order => new Date(order.createdAt) >= lastMonth && new Date(order.createdAt) < thisMonth)
            .flatMap(order => order.products.map(p => p.productId))
        ).size;

        const productChange = calculatePercentageChange(thisMonthProducts, lastMonthProducts);

        console.log('Thống kê tăng giảm sau khi điều chỉnh:', {
          userChange,
          productChange,
          orderChange
        });

        setStats({
          totalUsers: statsResponse.data.totalUsers || 0,
          totalProducts: statsResponse.data.totalProducts || 0,
          totalOrders: statsResponse.data.totalOrders || 0,
          recentOrders: recentOrdersWithDetails,
          allOrders: statsResponse.data.allOrders,
          changes: {
            users: userChange,
            products: productChange,
            orders: orderChange
          }
        });

      } catch (err) {
        console.error('Lỗi khi lấy thống kê:', err);
        setError(err.message || 'Không thể kết nối đến server');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [axiosInstance]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current && stats.allOrders && stats.allOrders.length > 0) {
      // Tạo mảng chứa doanh số theo tháng và trạng thái
      const monthlySales = new Array(12).fill(0);
      const currentYear = new Date().getFullYear();

      // Tính tổng doanh số theo tháng và trạng thái (chỉ tính các đơn đã giao/thanh toán)
      stats.allOrders.forEach(order => {
        if (order.createdAt && order.totalAmount) {
          const orderDate = new Date(order.createdAt);
          // Chỉ tính các đơn hàng trong năm hiện tại và có trạng thái đã giao hoặc đã thanh toán
          if (orderDate.getFullYear() === currentYear && 
              (order.status === 'delivered' || order.status === 'paid')) {
            const month = orderDate.getMonth(); // 0-11
            monthlySales[month] += order.totalAmount;
          }
        }
      });

      console.log('Doanh số theo tháng (đơn hàng đã hoàn thành):', monthlySales);

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
          datasets: [{
            label: 'Doanh số theo tháng',
            data: monthlySales,
            backgroundColor: '#4F46E5',
            borderRadius: 4,
            barThickness: 40,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Doanh số từ đơn hàng đã hoàn thành (VNĐ)',
              align: 'start',
              font: {
                size: 16,
                weight: '500'
              },
              padding: {
                bottom: 30
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(value);
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: '#E5E7EB',
                drawBorder: false
              },
              ticks: {
                maxTicksLimit: 5,
                callback: function(value) {
                  return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value);
                }
              },
              border: {
                display: false
              }
            },
            x: {
              grid: {
                display: false
              },
              border: {
                display: false
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stats.allOrders]);

  // Tạo biểu đồ tròn cho trạng thái đơn hàng
  useEffect(() => {
    if (statusChartInstance.current) {
      statusChartInstance.current.destroy();
    }

    if (statusChartRef.current && stats.allOrders && stats.allOrders.length > 0) {
      // Đếm số lượng đơn hàng theo trạng thái
      const statusCounts = {};
      const statusColors = {
        'delivered': '#10B981', // green
        'shipped': '#3B82F6',   // blue
        'processing': '#6366F1', // indigo
        'pending': '#F59E0B',   // yellow
        'paid': '#059669',      // emerald
        'failed': '#F97316',    // orange
        'cancelled': '#EF4444', // red
        'unknown': '#9CA3AF'    // gray
      };

      // Tên hiển thị tiếng Việt cho từng trạng thái
      const statusLabels = {
        'delivered': 'Đã giao hàng',
        'shipped': 'Đang giao hàng',
        'processing': 'Đang xử lý',
        'pending': 'Chờ xác nhận',
        'paid': 'Đã thanh toán',
        'failed': 'Thanh toán thất bại',
        'cancelled': 'Đã hủy',
        'unknown': 'Không xác định'
      };

      stats.allOrders.forEach(order => {
        const status = order.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      console.log('Phân bố trạng thái đơn hàng:', statusCounts);

      // Chuẩn bị dữ liệu cho biểu đồ
      const statusLabelsArray = Object.keys(statusCounts).map(key => statusLabels[key] || key);
      const statusData = Object.values(statusCounts);
      const backgroundColors = Object.keys(statusCounts).map(key => statusColors[key] || '#9CA3AF');

      const ctx = statusChartRef.current.getContext('2d');
      statusChartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: statusLabelsArray,
          datasets: [{
            data: statusData,
            backgroundColor: backgroundColors,
            borderWidth: 1,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                padding: 20,
                boxWidth: 12,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw;
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          },
          cutout: '60%'
        }
      });
    }

    return () => {
      if (statusChartInstance.current) {
        statusChartInstance.current.destroy();
      }
    };
  }, [stats.allOrders]);

  const statsCards = [
    {
      title: 'NGƯỜI DÙNG',
      value: stats.totalUsers || 0,
      change: stats.changes?.users || 0,
      icon: 'fas fa-users'
    },
    {
      title: 'SẢN PHẨM',
      value: stats.totalProducts || 0,
      change: stats.changes?.products || 0,
      icon: 'fas fa-box'
    },
    {
      title: 'ĐƠN HÀNG',
      value: stats.totalOrders || 0,
      change: stats.changes?.orders || 0,
      icon: 'fas fa-shopping-cart'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8 overflow-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4">Đang tải thông tin...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {statsCards.map((card, index) => (
                <StatsCard key={index} {...card} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <SalesChart chartRef={chartRef} />
              <StatusChart chartRef={statusChartRef} />
            </div>
            
            <RecentOrders orders={stats.recentOrders} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 