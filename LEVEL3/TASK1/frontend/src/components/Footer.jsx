import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-glass)',
      background: 'rgba(10, 12, 20, 0.5)',
      padding: '3rem 0 1.5rem',
      marginTop: 'auto',
      fontSize: '0.85rem',
      color: 'var(--text-muted)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h4 className="gradient-text" style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase' }}>AeroStore</h4>
            <p style={{ lineHeight: '1.7' }}>Curated premium minimalist desk setup accessories and mechanical engineering gear.</p>
          </div>
          <div>
            <h5 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Products</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Keyboards</li>
              <li>Audio Accessories</li>
              <li>Wearables</li>
              <li>Desk Pads</li>
            </ul>
          </div>
          <div>
            <h5 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Support</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Shipping Policy</li>
              <li>Returns & Exchanges</li>
              <li>FAQ</li>
              <li>Contact Us</li>
            </ul>
          </div>
          <div>
            <h5 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Payment Security</h5>
            <p style={{ lineHeight: '1.7' }}>All mock transactions are encrypted. Powered by Stripe Sandboxed protocol simulation.</p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-glass)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p>&copy; {new Date().getFullYear()} AeroStore. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Privacy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
