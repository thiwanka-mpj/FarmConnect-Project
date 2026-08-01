import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Home.css';
import header_img from '../../assests/header_img.png';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to FarmConnect</h1>
          <p className="hero-subtitle">
            Connecting farmers directly with customers for fresh, quality produce
          </p>

          <div className="header-image">
            <img src={header_img} alt="header_img" />
          </div>
          {!user ? (
            <div className="hero-buttons">
              <Link to="/signup" className="hero-button primary">
                Get Started
              </Link>
              <Link to="/login" className="hero-button secondary">
                Login
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/products" className="hero-button primary">
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose FarmConnect?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌾</div>
            <h3>Fresh from Farm</h3>
            <p>Get the freshest produce directly from local farmers</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Fair Prices</h3>
            <p>Support farmers with fair prices and eliminate middlemen</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h3>Fast Delivery</h3>
            <p>Quick and reliable delivery to your doorstep</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Quality Assured</h3>
            <p>All products are quality checked before delivery</p>
          </div>
        </div>
      </section>

      <section className="roles-section">
        <h2 className="section-title">Join as</h2>
        <div className="roles-grid">
          <div className="role-card">
            <div className="role-icon">👥</div>
            <h3>Customer</h3>
            <p>Browse and buy fresh produce from local farmers</p>
            {!user && (
              <Link to="/signup" className="role-button">
                Sign Up as Customer
              </Link>
            )}
          </div>

          <div className="role-card">
            <div className="role-icon">👨‍🌾</div>
            <h3>Farmer</h3>
            <p>List your products and reach customers directly</p>
            {!user && (
              <Link to="/signup" className="role-button">
                Sign Up as Farmer
              </Link>
            )}
          </div>

          <div className="role-card">
            <div className="role-icon">🚴</div>
            <h3>Delivery Rider</h3>
            <p>Earn by delivering fresh produce to customers</p>
            {!user && (
              <Link to="/signup" className="role-button">
                Sign Up as Rider
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;