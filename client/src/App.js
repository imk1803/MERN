import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from './store/userSlice';
import { Provider } from 'react-redux';
import store from './store/store';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductList from './pages/Product-list';
import ProductDetail from './pages/Product-detail';
import About from './pages/About';
import Profile from './pages/Profile';
import PaymentResult from './pages/PaymentResult';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchResult from './components/SearchResult';
import { NotificationProvider } from './contexts/NotificationContext';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AccessDenied from './pages/AccessDenied';

// Layout component that conditionally renders Header and Footer
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  useEffect(() => {
    // Chỉ gọi fetchUserProfile khi có token
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          <Route path="/payment/:type" element={<PaymentResult />} />
          <Route path="/payment/:type/:id" element={<PaymentResult />} />
          <Route path="/payment/success" element={<PaymentResult />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/access-denied" element={<AccessDenied />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </Provider>
  );
};

export default App;