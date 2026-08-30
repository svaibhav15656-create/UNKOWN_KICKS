import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Loader, Search, RefreshCw, Clipboard, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function OrderHistory({ currentUser, highlightOrderId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searching, setSearching] = useState(false);

  // References to keep track of polling timers
  const pollIntervalRef = useRef(null);

  // Load and fetch orders on mount
  useEffect(() => {
    fetchOrdersFromHistory();
    
    // Start polling if there are any PENDING orders in the list
    pollIntervalRef.current = setInterval(() => {
      pollPendingOrders();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Fetch all orders matching the saved IDs in localStorage
  const fetchOrdersFromHistory = async () => {
    setLoading(true);
    try {
      const savedIds = JSON.parse(localStorage.getItem('placedOrderIds') || '[]');
      if (savedIds.length === 0) {
        setOrders([]);
        return;
      }

      const fetchedOrders = [];
      for (const id of savedIds) {
        try {
          const order = await api.getOrder(id);
          // Only show orders belonging to current logged in user
          if (order.email === currentUser.email) {
            fetchedOrders.push(order);
          }
        } catch (e) {
          // If the order does not exist or isn't owned by this user (403), skip it
          console.warn(`Could not load order ${id}:`, e.message);
        }
      }
      // Sort orders by ID descending (newest first)
      fetchedOrders.sort((a, b) => b.id - a.id);
      setOrders(fetchedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Poll only the orders that are currently in PENDING state
  const pollPendingOrders = async () => {
    const savedIds = JSON.parse(localStorage.getItem('placedOrderIds') || '[]');
    if (savedIds.length === 0) return;

    let hasPending = false;
    
    setOrders(prevOrders => {
      const updatedOrders = [...prevOrders];
      let changed = false;

      const pollPromises = updatedOrders.map(async (order, idx) => {
        if (order.status === 'PENDING') {
          hasPending = true;
          try {
            const freshOrder = await api.getOrder(order.id);
            if (freshOrder.status !== 'PENDING') {
              updatedOrders[idx] = freshOrder;
              changed = true;
            }
          } catch (e) {
            console.error(`Error polling order ${order.id}:`, e);
          }
        }
      });

      Promise.all(pollPromises).then(() => {
        if (changed) {
          setOrders([...updatedOrders]);
        }
      });

      return prevOrders;
    });

    // Also poll searchResult if it's pending
    if (searchResult && searchResult.status === 'PENDING') {
      try {
        const freshOrder = await api.getOrder(searchResult.id);
        if (freshOrder.status !== 'PENDING') {
          setSearchResult(freshOrder);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // If no pending orders exist anymore, we could slow down the poll, but 3s interval is fine
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const order = await api.getOrder(searchId.trim());
      setSearchResult(order);
      
      // Save ID to local storage if it's not already there and matches the current user
      if (order.email === currentUser.email) {
        const savedIds = JSON.parse(localStorage.getItem('placedOrderIds') || '[]');
        if (!savedIds.includes(order.id)) {
          savedIds.push(order.id);
          localStorage.setItem('placedOrderIds', JSON.stringify(savedIds));
          fetchOrdersFromHistory();
        }
      }
    } catch (err) {
      console.error(err);
      if (err.message.includes('Forbidden')) {
        setSearchError('Access Denied: You do not own this order (403 Forbidden).');
      } else {
        setSearchError('Order not found. Check the ID and try again.');
      }
    } finally {
      setSearching(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-pending"><RefreshCw size={12} className="spin-icon" /> Pending Saga</span>;
      case 'CONFIRMED':
        return <span className="badge badge-confirmed"><CheckCircle2 size={12} /> Confirmed</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="orders-page-wrapper container animate-fade-in">
      <div className="orders-header">
        <h1 className="orders-title text-gradient">Track <span>Orders</span></h1>
        
        {/* Manual search bar */}
        <form onSubmit={handleManualSearch} className="search-order-form">
          <div className="search-order-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Look up order by ID..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary search-submit-btn" disabled={searching}>
              {searching ? <Loader size={14} className="spin-icon" /> : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Lookup search result display */}
      {(searchResult || searchError) && (
        <div className="lookup-result-box glass-panel animate-fade-up">
          <h3 className="lookup-section-title">Lookup Results</h3>
          
          {searchError && (
            <div className="lookup-error-card">
              <AlertTriangle size={24} />
              <div>
                <h4>Security/Retrieval Alert</h4>
                <p>{searchError}</p>
              </div>
            </div>
          )}

          {searchResult && (
            <div className="lookup-success-card">
              <div className="lookup-meta-header">
                <div>
                  <span className="order-id-label">ORDER ID: #{searchResult.id}</span>
                  <p className="order-date-label">Placed: {new Date(searchResult.orderDate).toLocaleString()}</p>
                </div>
                {getStatusBadge(searchResult.status)}
              </div>

              <div className="lookup-item-details">
                <div className="item-row">
                  <span className="label">Product ID</span>
                  <span className="val">#{searchResult.productId}</span>
                </div>
                <div className="item-row">
                  <span className="label">Quantity</span>
                  <span className="val">{searchResult.quantity} Units</span>
                </div>
                <div className="item-row">
                  <span className="label">Owner Email</span>
                  <span className="val">{searchResult.email}</span>
                </div>
              </div>

              {searchResult.status === 'PENDING' && (
                <div className="saga-polling-banner">
                  <Loader size={14} className="spin-icon" />
                  <span>Processing distributed Kafka saga transactions. Updates automatically...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main history list */}
      <div className="history-section-box">
        <div className="history-section-header">
          <h3 className="section-title">Drop Order History</h3>
          <button className="btn btn-secondary btn-sm refresh-btn" onClick={fetchOrdersFromHistory} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> Refresh History
          </button>
        </div>

        {loading ? (
          <div className="history-loader">
            <Loader className="spin-icon" size={24} />
            <p>Retrieving database transactions...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="history-empty-card glass-panel">
            <Clipboard size={48} className="empty-history-icon" />
            <h3>No Order Transactions Detected</h3>
            <p>Orders placed on this browser will be listed here and updated in real-time.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const isHighlighted = order.id === highlightOrderId;
              return (
                <div key={order.id} className={`order-card glass-panel ${isHighlighted ? 'highlighted' : ''}`}>
                  <div className="order-card-header">
                    <div>
                      <span className="order-id">ORDER ID: #{order.id}</span>
                      <span className="order-date">{new Date(order.orderDate).toLocaleString()}</span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="order-card-body">
                    <div className="order-details-grid">
                      <div className="detail-item">
                        <span className="lbl">Product ID</span>
                        <span className="val">#{order.productId}</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">Quantity</span>
                        <span className="val">{order.quantity} Units</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">Customer Account</span>
                        <span className="val">{order.email}</span>
                      </div>
                    </div>

                    {order.status === 'PENDING' && (
                      <div className="pending-alert-bar">
                        <RefreshCw size={12} className="spin-icon" />
                        <span>Kafka distributed saga check: Reducing stock and locking stock via Redis lock...</span>
                      </div>
                    )}

                    {order.status === 'CONFIRMED' && (
                      <div className="success-alert-bar">
                        <span>Saga processing completed successfully. Stock reduced, order confirmed!</span>
                      </div>
                    )}

                    {order.status === 'CANCELLED' && (
                      <div className="failure-alert-bar">
                        <span>Saga processing failed (e.g. Insufficient Stock or Redis Lock Timeout). Order cancelled!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .orders-page-wrapper {
          padding-top: 2rem;
          padding-bottom: 6rem;
        }

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .orders-title {
          font-size: 2.2rem;
          font-weight: 900;
        }

        .orders-title span {
          color: var(--accent);
        }

        .search-order-form {
          width: 100%;
          max-width: 400px;
        }

        .search-order-wrapper {
          position: relative;
          display: flex;
          gap: 0.5rem;
        }

        .search-order-wrapper .search-icon {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-order-wrapper .search-input {
          flex: 1;
          padding: 0.7rem 1.2rem 0.7rem 3rem;
          background-color: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 30px;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .search-order-wrapper .search-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .search-submit-btn {
          border-radius: 30px;
          padding: 0 1.5rem;
          font-size: 0.85rem;
        }

        /* Result card */
        .lookup-result-box {
          padding: 2rem;
          margin-bottom: 4rem;
          border-color: var(--accent);
        }

        .lookup-section-title {
          font-size: 1.1rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--accent);
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
        }

        .lookup-error-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background-color: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          color: #f87171;
        }

        .lookup-error-card h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .lookup-error-card p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .lookup-success-card {
          background-color: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .lookup-meta-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .order-id-label {
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .order-date-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }

        .lookup-item-details {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed var(--border);
          padding-bottom: 0.5rem;
        }

        .item-row .label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .item-row .val {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .saga-polling-banner {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.8rem 1rem;
          background-color: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.15);
          border-radius: 6px;
          color: #fbd38d;
          font-size: 0.85rem;
        }

        /* History list */
        .history-section-box {
          margin-top: 2rem;
        }

        .history-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .history-loader {
          text-align: center;
          padding: 5rem;
          color: var(--text-secondary);
        }

        .history-empty-card {
          text-align: center;
          padding: 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--text-secondary);
        }

        .empty-history-icon {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .order-card {
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .order-card.highlighted {
          border-color: var(--accent);
          box-shadow: 0 0 15px rgba(211, 167, 124, 0.15);
        }

        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
        }

        .order-card-header .order-id {
          font-weight: 800;
          font-size: 1.1rem;
          display: block;
        }

        .order-card-header .order-date {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: block;
          margin-top: 0.2rem;
        }

        .order-details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-item .lbl {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.3rem;
        }

        .detail-item .val {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .pending-alert-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background-color: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.1);
          border-radius: 4px;
          color: #fbd38d;
          font-size: 0.85rem;
        }

        .success-alert-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background-color: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.1);
          border-radius: 4px;
          color: #a7f3d0;
          font-size: 0.85rem;
        }

        .failure-alert-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background-color: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
          border-radius: 4px;
          color: #fca5a5;
          font-size: 0.85rem;
        }

        .spin-icon {
          animation: spin 1.5s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .order-details-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .orders-header {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}
