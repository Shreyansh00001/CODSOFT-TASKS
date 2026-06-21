import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar({ onOpenCart }) {
  const { userInfo, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/?search=${keyword}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="glass-navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase'
          }} className="gradient-text">
            AeroStore
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ flexGrow: 0.4, display: 'flex', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search premium gear..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              fontSize: '0.85rem',
              borderRadius: '24px'
            }}
          />
          <button type="submit" style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }} className="nav-link">
            Shop
          </Link>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              padding: '0.25rem'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-8px',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px var(--color-primary-glow)',
                animation: 'scaleUp 0.3s ease-out'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* User Section */}
          {userInfo ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="dropdown" style={{ position: 'relative' }}>
                <Link to="/orders" style={{ fontSize: '0.9rem', fontWeight: 500 }} className="gradient-text">
                  Hi, {userInfo.name.split(' ')[0]}
                </Link>
              </div>

              {userInfo.isAdmin && (
                <Link to="/admin" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }} className="badge badge-primary">
                  Admin
                </Link>
              )}

              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-danger)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '0.4rem 1rem' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
