import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Orders() {
  const { userInfo } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve order history');
        }

        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchOrders();
    }
  }, [userInfo]);

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Order <span className="gradient-text">History</span></h1>
        <Link to="/" className="btn btn-secondary btn-sm">Shop More</Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div style={{
            border: '4px solid rgba(255,255,255,0.05)',
            borderTop: '4px solid var(--color-primary)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : error ? (
        <div className="message message-danger">{error}</div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p>No orders placed yet.</p>
        </div>
      ) : (
        <div className="table-container glass-panel">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TOTAL PRICE</th>
                <th>PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                    {order._id}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} style={{ fontSize: '0.85rem' }}>
                          {item.name} <span style={{ color: 'var(--text-muted)' }}>x {item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>${order.totalPrice.toFixed(2)}</td>
                  <td>
                    {order.isPaid ? (
                      <span className="badge badge-success">
                        PAID ({new Date(order.paidAt).toLocaleDateString()})
                      </span>
                    ) : (
                      <span className="badge badge-danger">UNPAID</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
