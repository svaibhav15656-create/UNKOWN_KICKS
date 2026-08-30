import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import LoginRegister from './pages/LoginRegister';
import AdminPanel from './pages/AdminPanel';
import { api } from './api';
import './index.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [highlightOrderId, setHighlightOrderId] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  // Check for an existing valid session on load
  useEffect(() => {
    const user = api.getCurrentUser();
    setCurrentUser(user);
    setAuthChecked(true);
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setActivePage('home');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCartItems([]);
    setActivePage('home');
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setActivePage('product');
  };

  const handleAddToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stockQuantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stockQuantity) }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderPlaced = (orderId) => {
    setHighlightOrderId(orderId);
    setActivePage('orders');
  };

  // Don't render pages until we've checked localStorage for a session,
  // to avoid a flash of the login screen for already-authenticated users.
  if (!authChecked) return null;

  // Force unauthenticated users to the login/register screen
  if (!currentUser) {
    return <LoginRegister onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <Navbar
        currentUser={currentUser}
        activePage={activePage}
        setActivePage={setActivePage}
        cartSize={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onLogout={handleLogout}
      />

      {activePage === 'home' && (
        <Home onSelectProduct={handleSelectProduct} onAddToCart={handleAddToCart} />
      )}

      {activePage === 'product' && (
        <ProductDetail
          productId={selectedProductId}
          onBack={() => setActivePage('home')}
          onAddToCart={handleAddToCart}
        />
      )}

      {activePage === 'cart' && (
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {activePage === 'orders' && (
        <OrderHistory currentUser={currentUser} highlightOrderId={highlightOrderId} />
      )}

      {activePage === 'admin' && currentUser.role === 'ADMIN' && (
        <AdminPanel currentUser={currentUser} />
      )}

      {activePage === 'admin' && currentUser.role !== 'ADMIN' && (
        <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>403 — Forbidden</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Admin access is required to view this page.
          </p>
        </div>
      )}
    </>
  );
}

export default App;