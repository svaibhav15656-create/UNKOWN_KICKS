import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ShoppingCart, ArrowLeft, ShieldAlert, Loader } from 'lucide-react';
import { getProductImage } from '../productImages';


const DEFAULT_IMAGE = '/images/sneaker_sand_beige.png';

export default function ProductDetail({ productId, onBack, onAddToCart }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProductById(productId);
      setProduct(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  

  if (loading) {
    return (
      <div className="detail-loading-box">
        <Loader className="spinner-icon" size={32} />
        <p>Fetching product specifications...</p>
        <style>{`
          .detail-loading-box {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
          }
          .spinner-icon {
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
            color: var(--accent);
          }
        `}</style>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="detail-error-box container glass-panel">
        <ShieldAlert size={48} className="error-icon" />
        <h3>Error Occurred</h3>
        <p>{error || 'Product details not available.'}</p>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginTop: '1.5rem' }}>
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Catalog
        </button>
        <style>{`
          .detail-error-box {
            max-width: 600px;
            margin: 4rem auto;
            padding: 3rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
         .error-icon {
            color: var(--danger);
            margin-bottom: 1.5rem;
          }
        `}</style>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity === 0;
  const isLimitedStock = product.stockQuantity > 0 && product.stockQuantity <= 10;

  return (
    <div className="detail-wrapper container animate-fade-in">
      {/* Back button */}
      <button className="back-link-btn" onClick={onBack}>
        <ArrowLeft size={16} /> <span>Back to drops</span>
      </button>

      {/* Main product box */}
      <div className="product-detail-grid">
        {/* Left Col: Image */}
        <div className="detail-image-panel glass-panel">
          <div className="radial-inner-glow"></div>
          <img 
            src={getProductImage(product)} 
            alt={product.name} 
            className="detail-product-img"
          />
        </div>

        {/* Right Col: Info */}
        <div className="detail-info-panel">
          <span className="detail-category-tag">{product.category || 'Streetwear'}</span>
          <h1 className="detail-title">{product.name}</h1>
          
          <div className="detail-price-row">
            <span className="detail-price">₹{product.price ? product.price.toLocaleString('en-IN') : 'N/A'}</span>
            
            {isOutOfStock ? (
              <span className="badge badge-cancelled">Sold Out</span>
            ) : isLimitedStock ? (
              <span className="badge badge-pending">Limited stock: {product.stockQuantity} remaining</span>
            ) : (
              <span className="badge badge-confirmed">In Stock</span>
            )}
          </div>

          <div className="detail-divider"></div>

          <p className="detail-description">
            {product.description || 'This limited drop sneaker offers a premium construction, breathable comfort mesh lining, and heavy-traction rubber outsoles. Engineered with high aesthetics for streetwear drop culture.'}
          </p>

          {!isOutOfStock && (
            <div className="detail-purchase-controls">
              {/* Quantity selector */}
              <div className="qty-selector">
                <span className="qty-label">Quantity</span>
                <div className="qty-buttons">
                  <button 
                    className="qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                    disabled={quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart button */}
              <button 
                className="btn btn-primary detail-add-cart-btn"
                onClick={() => onAddToCart(product, quantity)}
              >
                <ShoppingCart size={18} style={{ marginRight: '0.6rem' }} /> Add to Shopping Bag
              </button>
            </div>
          )}

          {isOutOfStock && (
            <div className="out-of-stock-notice glass-panel">
              <p>This item is currently sold out and will not be restocked. Signup for email notifications on future drops.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .detail-wrapper {
          padding-top: 2rem;
          padding-bottom: 6rem;
        }

        .back-link-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          margin-bottom: 2.5rem;
          cursor: pointer;
          transition: color 0.3s ease;
          width: fit-content;
        }

        .back-link-btn:hover {
          color: var(--text-primary);
        }

        .product-detail-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
          align-items: start;
        }

        .detail-image-panel {
          height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 3rem;
        }

        .radial-inner-glow {
          position: absolute;
          width: 80%;
          height: 80%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
          pointer-events: none;
        }

        .detail-product-img {
          max-height: 85%;
          max-width: 85%;
          object-fit: contain;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.6));
          transform: rotate(-3deg);
          animation: float 8s ease-in-out infinite;
        }

        .detail-category-tag {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          display: inline-block;
        }

        .detail-title {
          font-size: 2.8rem;
          font-weight: 900;
          letter-spacing: -0.01em;
          margin-bottom: 1rem;
        }

        .detail-price-row {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-price {
          font-size: 2rem;
          font-weight: 800;
        }

        .detail-divider {
          height: 1px;
          background-color: var(--border);
          margin-bottom: 2rem;
        }

        .detail-description {
          color: var(--text-secondary);
          font-size: 1.05rem;
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .detail-purchase-controls {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .qty-selector {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .qty-label {
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.05em;
        }

        .qty-buttons {
          display: flex;
          align-items: center;
          background-color: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 30px;
          padding: 0.2rem;
        }

        .qty-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: none;
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .qty-btn:hover:not(:disabled) {
          background-color: rgba(255,255,255,0.05);
          color: var(--accent);
        }

        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .qty-value {
          font-size: 1rem;
          font-weight: 700;
          padding: 0 1.2rem;
          min-width: 45px;
          text-align: center;
        }

        .detail-add-cart-btn {
          height: 52px;
          max-width: 320px;
        }

        .out-of-stock-notice {
          padding: 1.5rem;
          border-color: rgba(239, 68, 68, 0.2);
          background-color: rgba(239, 68, 68, 0.03);
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
          .detail-image-panel {
            height: 350px;
          }
          .detail-title {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </div>
  );
}
