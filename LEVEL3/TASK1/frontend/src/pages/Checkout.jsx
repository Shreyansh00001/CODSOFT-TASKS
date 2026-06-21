import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, API_URL } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const {
    cartItems,
    shippingAddress,
    saveShippingAddress,
    paymentMethod,
    savePaymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    clearCart
  } = useContext(CartContext);

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review & Place Order

  // Shipping Form State
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || '');

  // Card Payment Form State (Mocked)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    saveShippingAddress({ address, city, postalCode, country });
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Validate simulated credit card (simple length checks)
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Please enter a valid 16-digit credit card number.');
      return;
    }
    if (!cardExpiry.includes('/')) {
      setError('Expiration date must be in MM/YY format.');
      return;
    }
    if (cardCvv.length !== 3) {
      setError('CVV code must be exactly 3 digits.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    const orderItems = cartItems.map(item => ({
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
      product: item.product
    }));

    try {
      // 1. Create order
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          orderItems,
          shippingAddress: { address, city, postalCode, country },
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to place order');
      }

      // 2. Mock payment authorization
      const payResponse = await fetch(`${API_URL}/orders/${orderData._id}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      const payData = await payResponse.json();

      if (!payResponse.ok) {
        throw new Error(payData.message || 'Payment simulation failed');
      }

      // 3. Clear cart and redirect
      clearCart();
      setLoading(false);
      navigate('/orders');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step === 1) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Your cart is empty.</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back To Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '800px' }}>
      {/* Checkout Steps Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem',
        padding: '0 1rem'
      }}>
        {['Shipping', 'Payment', 'Review & Pay'].map((sName, idx) => {
          const sNum = idx + 1;
          const isDone = step > sNum;
          const isActive = step === sNum;
          return (
            <div key={sName} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              position: 'relative'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isDone || isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                color: isDone || isActive ? 'white' : 'var(--text-muted)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isDone || isActive ? 'none' : '1px solid var(--border-glass)',
                boxShadow: isActive ? '0 0 12px var(--color-primary-glow)' : 'none',
                zIndex: 2
              }}>
                {isDone ? '✓' : sNum}
              </div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                marginTop: '0.5rem',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)'
              }}>{sName}</span>
            </div>
          );
        })}
      </div>

      {error && <div className="message message-danger">{error}</div>}

      {/* Step 1: Shipping Address */}
      {step === 1 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Shipping Address</h2>
          <form onSubmit={handleShippingSubmit}>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="123 Cyber Way"
                required
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Neo City"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="94016"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Country</label>
              <input
                type="text"
                className="form-input"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="United States"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Continue to Payment &rarr;
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Payment Details */}
      {step === 2 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Payment Method</h2>
            <button onClick={() => setStep(1)} className="btn btn-secondary btn-sm">&larr; Back</button>
          </div>

          <form onSubmit={handlePaymentSubmit}>
            <div className="form-group">
              <label className="form-label">Cardholder Name</label>
              <input
                type="text"
                className="form-input"
                value={cardName}
                onChange={e => setCardName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                className="form-input"
                value={cardNumber}
                onChange={e => {
                  // Basic formatting
                  const clean = e.target.value.replace(/\D/g, '').slice(0, 16);
                  const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
                  setCardNumber(formatted);
                }}
                placeholder="4111 2222 3333 4444"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label">Expiration Date (MM/YY)</label>
                <input
                  type="text"
                  className="form-input"
                  value={cardExpiry}
                  onChange={e => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 4);
                    const formatted = clean.length > 2 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
                    setCardExpiry(formatted);
                  }}
                  placeholder="12/28"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Security Code (CVV)</label>
                <input
                  type="password"
                  className="form-input"
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Review Order Details &rarr;
            </button>
          </form>
        </div>
      )}

      {/* Step 3: Review & Place Order */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Back button */}
          <button onClick={() => setStep(2)} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
            &larr; Back to Payment
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Left Col: Order summary detail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Shipping Details</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  {userInfo.name}<br />
                  {address}<br />
                  {city}, {postalCode}<br />
                  {country}
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Billing details</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Payment Method: <strong>{paymentMethod}</strong><br />
                  Card ending in: {cardNumber.slice(-4)}
                </p>
              </div>

              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Review Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cartItems.map(item => (
                    <div key={item.product} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flexGrow: 1, fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{item.qty} x ${item.price.toFixed(2)}</div>
                      </div>
                      <span style={{ fontWeight: 600 }}>${(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Price Totals & Submission */}
            <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Order Invoice</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Items Subtotal</span>
                  <span>${itemsPrice.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Shipping Fee</span>
                  <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sales Tax (15%)</span>
                  <span>${taxPrice.toFixed(2)}</span>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-glass)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
                  <span>Total Price</span>
                  <span className="gradient-text">${totalPrice.toFixed(2)}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontWeight: 700 }}
                >
                  {loading ? 'Authorizing Payment...' : 'Authorize & Pay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
