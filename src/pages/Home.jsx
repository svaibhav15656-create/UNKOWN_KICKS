import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Search, ChevronRight, ShoppingCart, Info, Loader } from 'lucide-react';
import { getProductImage } from '../productImages';
const CATEGORIES = ['All', 'Sneakers', 'Apparel', 'Accessories', 'New Drops', 'Limited Edition'];

const CATEGORY_MAP = {
  'All': 'all',
  'Sneakers': 'Footwear',
  'Apparel': 'Clothing',
  'Accessories': 'Accessories',
  'New Drops': 'Electronics',
  'Limited Edition': 'pleasure'
};

// Static mapping of product IDs or names to our generated premium assets for visual excellence


export default function Home({ onSelectProduct, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hero Sneaker details
  const [heroSlide, setHeroSlide] = useState(0);
  const heroSneakers = [
    {
      title: 'DISRUPT',
      subtitle: 'THE PURE COMFORT IS HERE.',
      name: 'CORE BLACK RACER',
      image: '/images/sneaker_core_black.png',
      productId: 6, // Running Shoes in database
      colorName: 'CORE BLACK / LEAD GREY'
    },
    {
      title: 'EVOLVE',
      subtitle: 'PREMIUM COMFORT EVERYDAY.',
      name: 'SAND BEIGE RUNNER',
      image: '/images/sneaker_sand_beige.png',
      productId: 12, // Backpack or fallback
      colorName: 'SAND BEIGE / OFF WHITE'
    }
  ];

  const currentHero = heroSneakers[heroSlide];

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      const mappedCategory = CATEGORY_MAP[activeCategory];

      if (mappedCategory === 'all') {
        const response = await api.getProducts(0, 40);
        data = response.content || [];
      } else {
        data = await api.getProductsByCategory(mappedCategory);
      }
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve catalog items. Verify database status.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchProductsByName(searchQuery);
      setProducts(data);
    } catch (err) {
      setError('Search query failed.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="home-wrapper">
      {/* Background circular lines */}
      <div className="bg-radial-lines"></div>

      {/* 1. HERO SECTION (Reskinned Adidas reference) */}
      <section className="hero-section">
        {/* Pagination Dots on Right Side */}
        <div className="hero-pagination-side">
          {heroSneakers.map((_, index) => (
            <button 
              key={index} 
              className={`pagination-dot ${heroSlide === index ? 'active' : ''}`}
              onClick={() => setHeroSlide(index)}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="hero-grid container">
          <div className="hero-content-col">
            <span className="hero-mini-tag">{currentHero.subtitle}</span>
            
            {/* Massive backdrop typography */}
            <div className="hero-backdrop-title">
              {currentHero.title}
            </div>

            {/* Sneaker floating image */}
            <div className="hero-sneaker-container">
              <img 
                src={currentHero.image} 
                alt={currentHero.name}
                className="hero-sneaker-img" 
              />
            </div>

            {/* Bottom slides and indicators */}
            <div className="hero-footer-bar">
              <div className="slide-counter">
                <span className="active-num">0{heroSlide + 1}</span>
                <span className="divider">/</span>
                <span className="total-num">0{heroSneakers.length}</span>
              </div>

              <div className="hero-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => onSelectProduct(currentHero.productId)}
                >
                  Reserve Now
                </button>
                <a href="#catalog" className="btn btn-primary hero-learn-btn">
                  Learn More
                </a>
              </div>

              <div className="colorway-tag">
                <span className="colorway-label">COLORWAY</span>
                <span className="colorway-name">{currentHero.colorName}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CATALOG SECTION */}
      <section id="catalog" className="catalog-section container">
        <div className="catalog-header">
          <h2 className="catalog-title">THE DROP <span>CATALOG</span></h2>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="search-bar-form">
            <div className="search-input-wrapper">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search kicks, apparel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* Categories Bar */}
        <div className="categories-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat);
                setSearchQuery('');
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="catalog-loader">
            <Loader className="spinner-icon" size={32} />
            <p>Loading database items...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="catalog-error-state glass-panel">
            <p>{error}</p>
            <button className="btn btn-secondary btn-sm" onClick={fetchProducts} style={{ marginTop: '1rem' }}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="catalog-empty-state">
                <p>No drops found in this category.</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => {
                  const isOutOfStock = product.stockQuantity === 0;
                  const isLimitedStock = product.stockQuantity > 0 && product.stockQuantity <= 10;
                  
                  return (
                    <div 
                      key={product.id} 
                      className="product-card glass-panel"
                      onClick={() => onSelectProduct(product.id)}
                    >
                      {/* Product Image */}
                      <div className="product-card-image-box">
                        <img 
                          src={getProductImage(product)} 
                          alt={product.name} 
                          className="product-card-img"
                        />
                        {isOutOfStock && <span className="sold-out-badge">SOLD OUT</span>}
                        {isLimitedStock && !isOutOfStock && (
                          <span className="limited-badge">ONLY {product.stockQuantity} LEFT</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="product-card-details">
                        <div className="product-category-row">
                          <span className="product-category-label">{product.category || 'Streetwear'}</span>
                          <span className="product-stock-count">Stock: {product.stockQuantity}</span>
                        </div>
                        <h3 className="product-card-name">{product.name}</h3>
                        <p className="product-card-desc">{product.description || 'Premium drop release.'}</p>
                        
                        <div className="product-card-footer">
                          <span className="product-card-price">₹{product.price ? product.price.toLocaleString('en-IN') : 'N/A'}</span>
                          
                          <button 
                            className="btn btn-primary card-action-btn"
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid navigating to details
                              onAddToCart(product);
                            }}
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <style>{`
        .home-wrapper {
          min-height: 100vh;
          position: relative;
        }

        /* Hero styles */
        .hero-section {
          min-height: 90vh;
          display: flex;
          align-items: center;
          position: relative;
          padding: 4rem 0;
          overflow: hidden;
        }

        .hero-pagination-side {
          position: absolute;
          right: 3rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          z-index: 10;
        }

        .pagination-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.25);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pagination-dot.active {
          background-color: var(--accent);
          transform: scale(1.5);
          box-shadow: 0 0 10px rgba(211, 167, 124, 0.5);
        }

        .hero-grid {
          width: 100%;
        }

        .hero-content-col {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 550px;
        }

        .hero-mini-tag {
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1rem;
        }

        .hero-backdrop-title {
          font-size: 15vw;
          font-weight: 900;
          line-height: 0.8;
          letter-spacing: -0.03em;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.05);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          user-select: none;
          pointer-events: none;
          text-align: center;
        }

        .hero-sneaker-container {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          max-width: 600px;
          display: flex;
          justify-content: center;
          align-items: center;
          pointer-events: none;
          z-index: 2;
        }

        .hero-sneaker-img {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 20px 50px rgba(0,0,0,0.7));
          animation: float 6s ease-in-out infinite;
        }

        .hero-footer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 2rem;
          z-index: 3;
        }

        .slide-counter {
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .slide-counter .active-num {
          color: var(--accent);
        }

        .slide-counter .divider {
          color: var(--text-muted);
        }

        .slide-counter .total-num {
          color: var(--text-secondary);
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .hero-learn-btn {
          background-color: var(--accent);
          color: #10141b;
        }

        .colorway-tag {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .colorway-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .colorway-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Catalog styles */
        .catalog-section {
          padding: 8rem 0;
        }

        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .catalog-title {
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        .catalog-title span {
          color: var(--accent);
        }

        .search-bar-form {
          width: 100%;
          max-width: 320px;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          padding: 0.7rem 1.2rem 0.7rem 3rem;
          background-color: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 30px;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent);
          background-color: rgba(255,255,255,0.05);
        }

        .categories-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 3.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .category-tab-btn {
          background-color: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          padding: 0.6rem 1.5rem;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .category-tab-btn:hover, .category-tab-btn.active {
          background-color: var(--accent);
          color: #10141b;
          border-color: var(--accent);
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2.5rem;
        }

        .product-card {
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-8px);
          border-color: rgba(255,255,255,0.15);
          box-shadow: var(--shadow-lg);
        }

        .product-card-image-box {
          height: 240px;
          background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.1) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 1.5rem;
        }

        .product-card-img {
          max-height: 85%;
          max-width: 85%;
          object-fit: contain;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-card-img {
          transform: scale(1.08) rotate(-4deg);
        }

        .sold-out-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background-color: var(--danger);
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.3rem 0.7rem;
          border-radius: 4px;
        }

        .limited-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background-color: var(--warning);
          color: #10141b;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.3rem 0.7rem;
          border-radius: 4px;
        }

        .product-card-details {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-category-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
        }

        .product-category-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .product-stock-count {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .product-card-name {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-card-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 2.8em;
        }

        .product-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .product-card-price {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .card-action-btn {
          padding: 0.6rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .catalog-loader {
          text-align: center;
          padding: 4rem;
          color: var(--text-secondary);
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
          color: var(--accent);
        }

        .catalog-error-state {
          padding: 3rem;
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }

        .catalog-empty-state {
          text-align: center;
          padding: 4rem;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .hero-section {
            min-height: 80vh;
          }
          .hero-backdrop-title {
            font-size: 18vw;
          }
          .hero-footer-bar {
            flex-direction: column;
            gap: 1.5rem;
            align-items: center;
          }
          .colorway-tag {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
