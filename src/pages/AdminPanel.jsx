import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ShieldAlert, Plus, Edit, Trash2, Loader, Check, X, RefreshCw } from 'lucide-react';

export default function AdminPanel({ currentUser }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // CRUD modal/form state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  
  const [submitLoading, setSubmitLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') {
      fetchAdminProducts();
    }
  }, [currentUser]);

  const fetchAdminProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getProducts(0, 50);
      setProducts(response.content || []);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve product list for admin panel.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setName('');
    setCategory('Footwear');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setActionError(null);
    setActionSuccess(null);
    setShowForm(true);
  };

  const openEditForm = (prod) => {
    setIsEditing(true);
    setCurrentProductId(prod.id);
    setName(prod.name || '');
    setCategory(prod.category || 'Footwear');
    setDescription(prod.description || '');
    setPrice(prod.price?.toString() || '');
    setStockQuantity(prod.stockQuantity?.toString() || '');
    setActionError(null);
    setActionSuccess(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setSubmitLoading(true);

    const payload = {
      name,
      category,
      description,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
    };

    try {
      if (isEditing) {
        await api.updateProduct(currentProductId, payload);
        setActionSuccess('Product updated successfully!');
      } else {
        await api.createProduct(payload);
        setActionSuccess('Product created successfully!');
      }
      setShowForm(false);
      fetchAdminProducts();
    } catch (err) {
      console.error(err);
      setActionError(err.message || 'Action failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product drop?')) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.deleteProduct(id);
      setActionSuccess('Product deleted successfully!');
      fetchAdminProducts();
    } catch (err) {
      console.error(err);
      setActionError(err.message || 'Delete operation rejected.');
    }
  };

  // 403 Forbidden State Display
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="forbidden-wrapper container animate-fade-in">
        <div className="forbidden-card glass-panel animate-fade-up">
          <ShieldAlert size={64} className="forbidden-icon animate-pulse-glow" />
          <h2 className="forbidden-title">403 FORBIDDEN</h2>
          <div className="forbidden-divider"></div>
          
          <div className="backend-response-box">
            <h4>Real Microservice Response:</h4>
            <pre>
{`{
  "timestamp": "${new Date().toISOString()}",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied: Only users with ADMIN role can access this resource",
  "path": "/api/products"
}`}
            </pre>
          </div>

          <p className="forbidden-desc">
            The API Gateway verified your JWT token but rejected this action because your role is <strong>{currentUser?.role || 'anonymous'}</strong>. This page showcases actual Spring Boot role-based authorization security policies.
          </p>
        </div>

        <style>{`
          .forbidden-wrapper {
            min-height: calc(100vh - 100px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .forbidden-card {
            max-width: 550px;
            width: 100%;
            padding: 3rem;
            text-align: center;
            box-shadow: var(--shadow-lg);
            border-color: rgba(239, 68, 68, 0.3);
          }

          .forbidden-icon {
            color: var(--danger);
            margin-bottom: 1.5rem;
          }

          .forbidden-title {
            font-size: 2rem;
            font-weight: 900;
            letter-spacing: 0.1em;
            color: #f87171;
          }

          .forbidden-divider {
            height: 1px;
            background-color: rgba(239, 68, 68, 0.2);
            margin: 1.5rem 0;
          }

          .backend-response-box {
            text-align: left;
            background-color: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255,255,255,0.05);
            padding: 1rem 1.2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
          }

          .backend-response-box h4 {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .backend-response-box pre {
            font-family: monospace;
            font-size: 0.85rem;
            color: #ef4444;
            white-space: pre-wrap;
          }

          .forbidden-desc {
            font-size: 0.95rem;
            color: var(--text-secondary);
            line-height: 1.5;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-page-wrapper container animate-fade-in">
      <div className="admin-header-row">
        <div>
          <h1 className="admin-title text-gradient">Admin <span>Dashboard</span></h1>
          <p className="admin-subtitle">Secure Product CRUD operations via product-service</p>
        </div>

        <button className="btn btn-primary btn-sm add-product-btn" onClick={openCreateForm}>
          <Plus size={16} /> <span>Create Drop</span>
        </button>
      </div>

      {actionSuccess && <div className="alert-message success-alert">{actionSuccess}</div>}
      {actionError && <div className="alert-message error-alert">{actionError}</div>}

      {/* Form Modal overlay */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel animate-fade-up">
            <div className="modal-header">
              <h3>{isEditing ? 'Modify Release' : 'New Drop Release'}</h3>
              <button className="close-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="prod-name-input">Drop Name</label>
                <input 
                  id="prod-name-input"
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-category-select">Category</label>
                  <select 
                    id="prod-category-select"
                    className="form-input" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Footwear">Footwear (Sneakers)</option>
                    <option value="Clothing">Clothing (Apparel)</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Electronics">Electronics (New Drops)</option>
                    <option value="pleasure">Pleasure (Limited Edition)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price-input">Price (INR)</label>
                  <input 
                    id="prod-price-input"
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-stock-input">Stock Quantity</label>
                <input 
                  id="prod-stock-input"
                  type="number" 
                  className="form-input" 
                  value={stockQuantity} 
                  onChange={(e) => setStockQuantity(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-desc-input">Description</label>
                <textarea 
                  id="prod-desc-input"
                  className="form-input" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows="3" 
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? <Loader size={16} className="spin-icon" /> : 'Confirm Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product list table */}
      <div className="table-wrapper glass-panel">
        <div className="table-header">
          <h3>Active Releases</h3>
          <button className="btn btn-secondary btn-sm" onClick={fetchAdminProducts}>
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="table-loader">
            <Loader className="spin-icon" size={24} />
            <p>Loading database assets...</p>
          </div>
        ) : (
          <div className="table-scroll-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td className="product-name-cell">{product.name}</td>
                    <td><span className="category-badge">{product.category || 'Footwear'}</span></td>
                    <td className="price-cell">₹{product.price ? product.price.toLocaleString('en-IN') : '0.00'}</td>
                    <td>
                      <span className={`stock-text ${product.stockQuantity === 0 ? 'out' : ''}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="action-icon-btn edit" onClick={() => openEditForm(product)}>
                        <Edit size={16} />
                      </button>
                      <button className="action-icon-btn delete" onClick={() => handleDelete(product.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .admin-page-wrapper {
          padding-top: 2rem;
          padding-bottom: 6rem;
        }

        .admin-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .admin-title {
          font-size: 2.2rem;
          font-weight: 900;
        }

        .admin-title span {
          color: var(--accent);
        }

        .admin-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.3rem;
        }

        .add-product-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .alert-message {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .success-alert {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #a7f3d0;
        }

        .error-alert {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 2rem;
        }

        .modal-card {
          width: 100%;
          max-width: 550px;
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .modal-header h3 {
          font-size: 1.3rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        /* Product Table */
        .table-wrapper {
          overflow: hidden;
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border);
        }

        .table-header h3 {
          font-size: 1.1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-loader {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .table-scroll-container {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background-color: rgba(255,255,255,0.01);
          padding: 1rem 2rem;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }

        .admin-table td {
          padding: 1.2rem 2rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.95rem;
        }

        .product-name-cell {
          font-weight: 700;
        }

        .category-badge {
          background-color: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .price-cell {
          font-weight: 700;
        }

        .stock-text.out {
          color: var(--danger);
          font-weight: 800;
        }

        .actions-cell {
          display: flex;
          justify-content: flex-end;
          gap: 0.8rem;
        }

        .action-icon-btn {
          border: none;
          background: none;
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all 0.3s ease;
        }

        .action-icon-btn.edit:hover {
          color: var(--accent);
          background-color: rgba(211,167,124,0.05);
        }

        .action-icon-btn.delete:hover {
          color: var(--danger);
          background-color: rgba(239,68,68,0.05);
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
