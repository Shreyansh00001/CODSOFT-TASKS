import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';

  const [category, setCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');

  const categories = [
    'All',
    'Keyboards',
    'Audio',
    'Wearables',
    'Lighting',
    'Desk Accessories',
    'Mice',
    'Charging',
    'Monitors'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_URL}/products?keyword=${searchKeyword}`;
        if (category !== 'All') {
          url += `&category=${category}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
        // Apply frontend sorting
        let sortedData = [...data];
        if (sortOrder === 'low-to-high') {
          sortedData.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'high-to-low') {
          sortedData.sort((a, b) => b.price - a.price);
        }
        
        setProducts(sortedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchKeyword, category, sortOrder]);

  return (
    <div className="container animate-fade-in">
      {/* Hero Section */}
      {!searchKeyword && category === 'All' && (
        <div className="glass-panel" style={{
          padding: '4rem 2rem',
          marginBottom: '3rem',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.7), rgba(88, 28, 135, 0.15))',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '30%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'var(--color-primary-glow)',
            filter: 'blur(100px)',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-20%',
            right: '20%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'var(--color-secondary-glow)',
            filter: 'blur(100px)',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="badge badge-primary" style={{ marginBottom: '1.25rem', letterSpacing: '0.1em' }}>NEW ARRIVALS 2026</span>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', lineHeight: '1.1' }}>
              Elevate Your Desk <span className="gradient-text">Aesthetic</span>
            </h1>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              lineHeight: '1.7'
            }}>
              Discover meticulously crafted mechanical keyboards, high-fidelity audio equipment, and minimal studio desk layout accessories.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setCategory('Keyboards')} className="btn btn-primary">Browse Keyboards</button>
              <button onClick={() => setCategory('Audio')} className="btn btn-secondary">Audio Gear</button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Filters Bar */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Category horizontal scrolling bar */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          maxWidth: '100%',
          paddingBottom: '0.25rem'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: '20px',
                padding: '0.4rem 1rem',
                fontSize: '0.8rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sort By</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="default" style={{ background: '#121626' }}>Default</option>
            <option value="low-to-high" style={{ background: '#121626' }}>Price: Low to High</option>
            <option value="high-to-low" style={{ background: '#121626' }}>Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Result Headline */}
      {searchKeyword && (
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          Search results for: <span className="gradient-text">"{searchKeyword}"</span>
        </h2>
      )}

      {/* Product Grid Area */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div style={{
            border: '4px solid rgba(255,255,255,0.05)',
            borderTop: '4px solid var(--color-primary)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : error ? (
        <div className="message message-danger">{error}</div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 0',
          color: 'var(--text-muted)'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>No products found matching your filters.</p>
        </div>
      ) : (
        <div className="grid-catalog">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
