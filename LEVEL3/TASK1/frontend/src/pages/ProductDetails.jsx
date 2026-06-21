import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, qty);
    navigate('/'); // redirect to shop home or keep on page and open cart drawer. We'll direct home.
  };

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<span key={i}>★</span>);
      } else {
        stars.push(<span key={i} style={{ color: 'rgba(255,255,255,0.15)' }}>★</span>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <div style={{
          border: '4px solid rgba(255,255,255,0.05)',
          borderTop: '4px solid var(--color-primary)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>&larr; Back to Shop</Link>
        <div className="message message-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '1rem' }}>
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '2rem' }}>
        &larr; Back to Catalog
      </Link>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Product Image Column */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              borderRadius: 'var(--radius-sm)',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Product Information Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>{product.category}</span>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="rating" style={{ fontSize: '1.25rem' }}>
                {renderStars(product.rating)}
                <span className="rating-text" style={{ fontSize: '0.9rem' }}>({product.numReviews} reviews)</span>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            ${product.price.toFixed(2)}
          </h2>

          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', fontSize: '1.05rem' }}>
            {product.description}
          </p>

          {/* Configuration Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span>Availability</span>
              <span style={{ fontWeight: 600, color: product.countInStock > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {product.countInStock > 0 ? `${product.countInStock} In Stock` : 'Out of Stock'}
              </span>
            </div>

            {product.countInStock > 0 && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                  <span>Quantity</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => setQty(prev => Math.max(1, prev - 1))}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', minWidth: '30px' }}
                    >
                      -
                    </button>
                    <span style={{ width: '25px', textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                    <button
                      onClick={() => setQty(prev => Math.min(product.countInStock, prev + 1))}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', minWidth: '30px' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Add To Shopping Cart
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
