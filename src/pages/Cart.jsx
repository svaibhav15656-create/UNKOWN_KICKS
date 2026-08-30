import React, { useState } from 'react';
import { api } from '../api';
import { Trash2, CreditCard, MapPin, Loader, ShoppingBag, ArrowRight } from 'lucide-react';
import { getProductImage } from '../productImages';


const DEFAULT_IMAGE = '/images/sneaker_sand_beige.png';

export default function Cart({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart, onOrderPlaced }) {
  const [address, setAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

 

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + (item.product.price || 0) * item.quantity, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setError(null);
    setSubmitting(true);

    try {
      const orderPromises = cartItems.map(async (item) => {
        const orderResponse = await api.createOrder(item.product.id, item.quantity);
        return orderResponse;
      });

      const placedOrders = await Promise.all(orderPromises);
      onClearCart();
      // Redirect to Order History and pass the last placed order ID to highlight
      if (placedOrders.length > 0) {
        // Save placed order IDs to local history registry
        const currentHistory = JSON.parse(localStorage.getItem('placedOrderIds') || '[]');
        const newIds = placedOrders.map(o => o.id);
        localStorage.setItem('placedOrderIds', JSON.stringify([...newIds, ...currentHistory]));
        
        onOrderPlaced(placedOrders[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Checkout failed. Verify API connection and inventory stock.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-box container glass-panel animate-fade-up">
        <ShoppingBag size={64} className="empty-cart-icon" />
        <h3>Your Shopping Bag is empty</h3>
        <p>Browse our drop catalog to secure your kicks before they are sold out.</p>
        <style>{`
          .cart-empty-box {
            max-width: 600px;
            margin: 4rem auto;
            padding: 4rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            color: var(--text-secondary);
          }
          .empty-cart-icon {
            color: var(--text-muted);
            margin-bottom: 1.5rem;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper container animate-fade-in">
      <h1 className="cart-page-title text-gradient">Your Bag <span>({cartItems.length})</span></h1>

      <div className="cart-main-layout">
        {/* Left Side: Items list */}
        <div className="cart-items-column">
          {cartItems.map((item) => {
            const prod = item.product;
            return (
              <div key={prod.id} className="cart-item-card glass-panel">
                <img 
                  src={getProductImage(prod)} 
                  alt={prod.name} 
                  className="cart-item-img"
                />
                
                <div className="cart-item-details">
                  <div className="cart-item-meta">
                    <span className="cart-item-category">{prod.category || 'Streetwear'}</span>
                    <h3 className="cart-item-name">{prod.name}</h3>
                  </div>

                  <div className="cart-item-price-quantity">
                    <span className="cart-item-price">₹{(prod.price || 0).toLocaleString('en-IN')}</span>
                    
                    {/* Quantity selectors */}
                    <div className="cart-item-qty-selector">
                      <button 
                        className="cart-qty-btn"
                        onClick={() => onUpdateQuantity(prod.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button 
                        className="cart-qty-btn"
                        onClick={() => onUpdateQuantity(prod.id, item.quantity + 1)}
                        disabled={item.quantity >= prod.stockQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <button className="cart-item-remove-btn" onClick={() => onRemoveItem(prod.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Side: Checkout Form Panel */}
        <div className="checkout-summary-column">
          <div className="checkout-card glass-panel">
            <h3 className="checkout-card-title">Order Summary</h3>
            
            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Shipping</span>
              <span className="summary-value green-text">FREE</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
            </div>

            {error && <div className="checkout-error">{error}</div>}

            <form onSubmit={handleCheckout} className="checkout-form">
              <h4 className="checkout-subheading"><MapPin size={14} style={{ marginRight: '0.4rem' }} /> Shipping Details</h4>
              <div className="form-group">
                <label className="form-label" htmlFor="fullname-input">Full Name</label>
                <input 
                  id="fullname-input"
                  type="text" 
                  className="form-input" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address-input">Shipping Address</label>
                <textarea 
                  id="address-input"
                  className="form-input form-textarea" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Zipcode"
                  rows="3"
                  required 
                />
              </div>

              <h4 className="checkout-subheading"><CreditCard size={14} style={{ marginRight: '0.4rem' }} /> Payment Mode</h4>
              <div className="payment-simulation-box">
                <span className="radio-dot active"></span>
                <span className="payment-label">Cash on Delivery (Drop Simulation)</span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full checkout-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader className="spinner-icon" size={16} style={{ marginRight: '0.5rem' }} /> Securing Drop...
                  </>
                ) : (
                  <>
                    Place Order <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .cart-page-wrapper {
          padding-top: 2rem;
          padding-bottom: 6rem;
        }

        .cart-page-title {
          font-size: 2.2rem;
          font-weight: 900;
          margin-bottom: 2.5rem;
        }

        .cart-page-title span {
          color: var(--text-secondary);
        }

        .cart-main-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
          align-items: start;
        }

        .cart-items-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .cart-item-card {
          display: flex;
          align-items: center;
          padding: 1.2rem 2rem;
          position: relative;
        }

        .cart-item-img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          margin-right: 2rem;
          filter: drop-shadow(0 5px 10px rgba(0,0,0,0.3));
        }

        .cart-item-details {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-right: 1.5rem;
        }

        .cart-item-meta {
          max-width: 250px;
        }

        .cart-item-category {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cart-item-name {
          font-size: 1.05rem;
          font-weight: 700;
          margin-top: 0.2rem;
          color: var(--text-primary);
        }

        .cart-item-price-quantity {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .cart-item-price {
          font-size: 1.1rem;
          font-weight: 800;
          min-width: 90px;
        }

        .cart-item-qty-selector {
          display: flex;
          align-items: center;
          background-color: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 0.1rem;
        }

        .cart-qty-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: none;
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
        }

        .cart-qty-btn:hover:not(:disabled) {
          color: var(--accent);
          background-color: rgba(255,255,255,0.05);
        }

        .cart-qty-btn:disabled {
          opacity: 0.3;
        }

        .cart-qty-value {
          font-size: 0.9rem;
          font-weight: 700;
          padding: 0 0.8rem;
        }

        .cart-item-remove-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.3s ease;
          padding: 0.5rem;
          border-radius: 50%;
        }

        .cart-item-remove-btn:hover {
          color: var(--danger);
          background-color: rgba(239, 68, 68, 0.05);
        }

        /* Checkout summary */
        .checkout-card {
          padding: 2.5rem;
        }

        .checkout-card-title {
          font-size: 1.3rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: var(--text-secondary);
        }

        .summary-value.green-text {
          color: var(--success);
          font-weight: 700;
        }

        .summary-divider {
          height: 1px;
          background-color: var(--border);
          margin: 1.5rem 0;
        }

        .summary-row.total {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        .checkout-error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 0.8rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .checkout-subheading {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-primary);
          letter-spacing: 0.05em;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .form-textarea {
          resize: none;
        }

        .payment-simulation-box {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          background-color: rgba(0,0,0,0.15);
          border: 1.5px solid var(--accent);
          padding: 1rem 1.2rem;
          border-radius: 8px;
          margin-bottom: 2.5rem;
        }

        .radio-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--accent);
          box-shadow: 0 0 8px var(--accent);
        }

        .payment-label {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .checkout-submit-btn {
          height: 52px;
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 992px) {
          .cart-main-layout {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
      `}</style>
    </div>
  );
}
