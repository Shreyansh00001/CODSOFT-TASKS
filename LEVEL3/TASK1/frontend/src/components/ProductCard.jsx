import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  // Helper to render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<span key={i}>★</span>);
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i}>★</span>); // could draw half star or styled, keeping simple solid star colored or outline
      } else {
        stars.push(<span key={i} style={{ color: 'rgba(255,255,255,0.15)' }}>★</span>);
      }
    }
    return stars;
  };

  return (
    <div className="glass-panel animate-fade-in product-card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, border-color 0.3s ease',
      height: '100%',
    }}>
      {/* Product Image Link */}
      <Link to={`/product/${product._id}`} style={{ display: 'block', overflow: 'hidden', height: '200px', position: 'relative' }}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
        />
        {product.countInStock === 0 && (
          <span className="badge badge-danger" style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
          }}>
            Sold Out
          </span>
        )}
      </Link>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.5rem' }}>
        <span className="badge badge-primary" style={{ alignSelf: 'flex-start', fontSize: '0.65rem' }}>
          {product.category}
        </span>
        
        <Link to={`/product/${product._id}`}>
          <h3 style={{
            fontSize: '1.05rem',
            color: 'var(--text-main)',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.5rem',
            margin: '0.25rem 0'
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="rating">
          {renderStars(product.rating)}
          <span className="rating-text">({product.numReviews})</span>
        </div>

        {/* Price & Action */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-glass)'
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            ${product.price.toFixed(2)}
          </span>
          
          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.countInStock === 0}
            className="btn btn-primary btn-sm"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
