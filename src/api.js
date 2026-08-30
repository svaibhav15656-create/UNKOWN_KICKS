const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

// Helper to get auth headers
function getHeaders(authRequired = true) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (authRequired) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

// Helper to decode JWT token
export function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// API methods
export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return parseJwt(data.accessToken);
  },

  async register(email, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(err.message || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('accessToken', data.token);
    return parseJwt(data.token);
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getCurrentUser() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const claims = parseJwt(token);
    if (!claims || (claims.exp && claims.exp * 1000 < Date.now())) {
      this.logout();
      return null;
    }
    return {
      email: claims.sub,
      role: claims.role,
    };
  },

  // Products
  async getProducts(page = 0, size = 12) {
    const res = await fetch(`${API_BASE_URL}/api/products?page=${page}&size=${size}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    if (res.status === 401) {
      this.logout();
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async getProductsByCategory(category) {
    const res = await fetch(`${API_BASE_URL}/api/products/search/category/${category}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to fetch products in category');
    return res.json();
  },

  async searchProductsByName(name) {
    const res = await fetch(`${API_BASE_URL}/api/products/search/name?name=${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Product search failed');
    return res.json();
  },

  async createProduct(product) {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(product),
    });
    if (res.status === 403) throw new Error('Forbidden: Admin access required');
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to create product' }));
      throw new Error(err.message || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id, product) {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(product),
    });
    if (res.status === 403) throw new Error('Forbidden: Admin access required');
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to update product' }));
      throw new Error(err.message || 'Failed to update product');
    }
    return res.json();
  },

  async deleteProduct(id) {
    // NOTE: role is enforced server-side by the gateway from the validated JWT.
    // We intentionally do NOT send a client-supplied X-User-Role header here —
    // trusting a client-set role header would let any user grant themselves ADMIN.
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (res.status === 403) throw new Error('Forbidden: Admin access required');
    if (!res.ok) throw new Error('Failed to delete product');
    return true;
  },

  // Orders
  async createOrder(productId, quantity) {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to place order' }));
      throw new Error(err.message || 'Failed to place order');
    }
    return res.json();
  },

  async getOrder(id) {
    const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, {
      method: 'GET',
      headers: getHeaders(true),
    });
    if (res.status === 403) throw new Error('Forbidden: You are not authorized to view this order');
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },
};