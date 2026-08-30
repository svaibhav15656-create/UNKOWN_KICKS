import React from 'react';
import { ShoppingBag, LogOut, Shield, User } from 'lucide-react';

export default function Navbar({ currentUser, activePage, setActivePage, cartSize, onLogout }) {
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <nav className="navbar-glass">
      <div className="nav-container">
        {/* Brand Wordmark Logo */}
        <div className="nav-brand" onClick={() => setActivePage('home')}>
          UNKNOWN <span>KICKS</span>
        </div>

        {/* Center Links */}
        {currentUser && (
          <div className="nav-links">
            <button 
              className={`nav-link-btn ${activePage === 'home' ? 'active' : ''}`}
              onClick={() => setActivePage('home')}
            >
              Store
            </button>
            <button 
              className={`nav-link-btn ${activePage === 'orders' ? 'active' : ''}`}
              onClick={() => setActivePage('orders')}
            >
              My Orders
            </button>
            {isAdmin && (
              <button 
                className={`nav-link-btn admin-badge-link ${activePage === 'admin' ? 'active' : ''}`}
                onClick={() => setActivePage('admin')}
              >
                <Shield size={14} className="icon-shield" /> Admin Portal
              </button>
            )}
          </div>
        )}

        {/* Right Info / Actions */}
        <div className="nav-actions">
          {currentUser ? (
            <>
              <div className="user-profile-tag">
                <User size={14} className="user-icon" />
                <span className="user-email">{currentUser.email}</span>
                <span className={`user-role-badge ${isAdmin ? 'admin' : 'user'}`}>
                  {currentUser.role}
                </span>
              </div>
              
              {/* Cart Button */}
              <button 
                className={`cart-trigger-btn ${activePage === 'cart' ? 'active' : ''}`}
                onClick={() => setActivePage('cart')}
              >
                <ShoppingBag size={20} />
                {cartSize > 0 && <span className="cart-badge-count">{cartSize}</span>}
              </button>

              {/* Logout Button */}
              <button className="logout-btn" onClick={onLogout} title="Log Out">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setActivePage('login')}>
              Sign In
            </button>
          )}
        </div>
      </div>

      <style>{`
        .navbar-glass {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(16, 20, 27, 0.7);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding: 1.2rem 0;
          transition: all 0.3s ease;
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          font-size: 1.3rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          cursor: pointer;
          color: var(--text-primary);
          transition: color 0.3s ease;
        }

        .nav-brand span {
          color: var(--accent);
        }

        .nav-brand:hover {
          color: var(--accent);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.5rem 0;
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-link-btn:hover, .nav-link-btn.active {
          color: var(--text-primary);
        }

        .nav-link-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: var(--accent);
          transition: width 0.3s ease;
        }

        .nav-link-btn:hover::after, .nav-link-btn.active::after {
          width: 100%;
        }

        .admin-badge-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #f59e0b;
        }

        .admin-badge-link::after {
          background-color: #f59e0b !important;
        }

        .admin-badge-link:hover, .admin-badge-link.active {
          color: #fbbf24;
        }

        .icon-shield {
          color: inherit;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .user-profile-tag {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.4rem 0.8rem;
          border-radius: 30px;
          font-size: 0.85rem;
        }

        .user-icon {
          color: var(--text-secondary);
        }

        .user-email {
          color: var(--text-secondary);
          font-weight: 500;
          max-width: 150px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role-badge {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }

        .user-role-badge.admin {
          background-color: rgba(245, 158, 11, 0.15);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .user-role-badge.user {
          background-color: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cart-trigger-btn {
          position: relative;
          background: none;
          border: none;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .cart-trigger-btn:hover, .cart-trigger-btn.active {
          color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .cart-badge-count {
          position: absolute;
          top: -2px;
          right: -2px;
          background-color: var(--accent);
          color: #10141b;
          font-size: 0.7rem;
          font-weight: 800;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          color: var(--danger);
          background-color: rgba(239, 68, 68, 0.05);
        }
      `}</style>
    </nav>
  );
}
