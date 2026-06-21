import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, API_URL } from '../context/AuthContext';

export default function Admin() {
  const { userInfo } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for adding/editing product
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState('');
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'products') {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } else {
        const res = await fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const openAddModal = () => {
    setIsEditMode(false);
    setName('');
    setPrice('');
    setImage('https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop');
    setCategory('Keyboards');
    setCountInStock('10');
    setDescription('Enter details here...');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEditMode(true);
    setCurrentProductId(product._id);
    setName(product.name);
    setPrice(product.price.toString());
    setImage(product.image);
    setCategory(product.category);
    setCountInStock(product.countInStock.toString());
    setDescription(product.description);
    setShowModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      price: Number(price),
      image,
      category,
      countInStock: Number(countInStock),
      description,
    };

    try {
      const url = isEditMode ? `${API_URL}/products/${currentProductId}` : `${API_URL}/products`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      loadData();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        Admin <span className="gradient-text">Dashboard</span>
      </h1>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('products')}
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Manage Products
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
        >
          View Orders
        </button>
      </div>

      {error && <div className="message message-danger">{error}</div>}

      {/* Product Content Tab */}
      {activeTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={openAddModal} className="btn btn-primary btn-sm">
              + Add Product
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{
                border: '4px solid rgba(255,255,255,0.05)',
                borderTop: '4px solid var(--color-primary)',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <div className="table-container glass-panel">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>IMAGE</th>
                    <th>NAME</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{product.name}</td>
                      <td>{product.category}</td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>{product.countInStock}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditModal(product)} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                            Edit
                          </button>
                          <button onClick={() => handleDeleteProduct(product._id)} className="btn btn-danger btn-sm" style={{ padding: '0.3rem 0.6rem' }}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Orders Content Tab */}
      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div style={{
                border: '4px solid rgba(255,255,255,0.05)',
                borderTop: '4px solid var(--color-primary)',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <div className="table-container glass-panel">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>DATE</th>
                    <th>CUSTOMER</th>
                    <th>TOTAL</th>
                    <th>PAID</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                        {order._id}
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.user ? order.user : 'Regular Customer'}</td>
                      <td style={{ fontWeight: 600 }}>${order.totalPrice.toFixed(2)}</td>
                      <td>
                        {order.isPaid ? (
                          <span className="badge badge-success">PAID</span>
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
      )}

      {/* Product Add/Edit Modal overlay */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(5px)',
              zIndex: 1000,
            }}
          />
          {/* Modal Container */}
          <div
            className="glass-panel"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: '500px',
              padding: '2rem',
              background: 'rgba(17, 21, 37, 0.95)',
              zIndex: 1001,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mechanical Keyboard"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="129.99"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    placeholder="15"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Keyboards"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}>
                {isEditMode ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
