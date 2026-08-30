import React, { useState } from 'react';
import { api } from '../api';
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function LoginRegister({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic Client Validations
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const user = await api.login(email, password);
        onAuthSuccess(user);
      } else {
        const user = await api.register(email, password);
        onAuthSuccess(user);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper animate-fade-in">
      <div className="auth-card glass-panel animate-fade-up">
        {/* Header Branding */}
        <div className="auth-header">
          <h2 className="auth-title">UNKNOWN <span>KICKS</span></h2>
          <p className="auth-subtitle">Streetwear Drops & Limited Stock</p>
        </div>

        {/* Tab Buttons */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Sign In
          </button>
          <button 
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-field-icon" size={18} />
              <input 
                id="email-input"
                type="email" 
                className="form-input with-icon" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div className="input-with-icon">
              <Lock className="input-field-icon" size={18} />
              <input 
                id="password-input"
                type="password" 
                className="form-input with-icon" 
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full submit-auth-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : isLogin ? (
              <>
                <LogIn size={16} style={{ marginRight: '0.5rem' }} /> Sign In
              </>
            ) : (
              <>
                <UserPlus size={16} style={{ marginRight: '0.5rem' }} /> Register
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .auth-page-wrapper {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }

        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 3rem;
          box-shadow: var(--shadow-lg);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-title {
          font-size: 1.8rem;
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        .auth-title span {
          color: var(--accent);
        }

        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .auth-tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          margin-bottom: 2rem;
        }

        .auth-tab-btn {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
        }

        .auth-tab-btn.active {
          color: var(--text-primary);
          border-bottom: 2px solid var(--accent);
        }

        .auth-error-alert {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .input-with-icon {
          position: relative;
        }

        .input-field-icon {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .form-input.with-icon {
          padding-left: 3.2rem;
        }

        .w-full {
          width: 100%;
        }

        .submit-auth-btn {
          margin-top: 1rem;
          height: 48px;
        }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
