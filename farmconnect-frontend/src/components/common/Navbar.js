import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🌾 FarmConnect
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>

          {!user ? (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/signup" className="navbar-link navbar-signup">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user.role === 'CUSTOMER' && (
                <>
                  <Link to="/products" className="navbar-link">
                    Products
                  </Link>
                  <Link to="/customer/orders" className="navbar-link">
                    My Orders
                  </Link>
                  <Link to="/customer/cart" className="navbar-link">
                    🛒 Cart
                  </Link>
                </>
              )}

              {user.role === 'FARMER' && (
                <>
                  <Link to="/farmer/dashboard" className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/farmer/products" className="navbar-link">
                    My Products
                  </Link>
                  <Link to="/farmer/orders" className="navbar-link">
                    Orders
                  </Link>
                </>
              )}

              {user.role === 'RIDER' && (
                <>
                  <Link to="/rider/dashboard" className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/rider/deliveries" className="navbar-link">
                    My Deliveries
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link to="/admin/dashboard" className="navbar-link">
                    Dashboard
                  </Link>
                  <Link to="/admin/users" className="navbar-link">
                    Users
                  </Link>
                  <Link to="/admin/orders" className="navbar-link">
                    Orders
                  </Link>
                </>
              )}

              <div className="navbar-user">
                <span className="navbar-username">👤 {user.fullName}</span>
                <button onClick={handleLogout} className="navbar-logout">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;