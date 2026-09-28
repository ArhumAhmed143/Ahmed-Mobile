import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

// Interceptor to automatically attach JWT token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexorahub_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const api = {
  // Health Check
  getHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  subscribeNewsletter: async (email) => {
    const response = await apiClient.post('/newsletter/subscribe', { email });
    return response.data;
  },

  // Auth APIs
  loginAdmin: async (username, password) => {
    const response = await apiClient.post('/auth/admin/login', { username, password });
    return response.data;
  },

  getAdminProfile: async () => {
    const response = await apiClient.get('/auth/admin/me');
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  // Products Read
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await apiClient.get('/products/featured');
    return response.data;
  },

  getNewArrivals: async () => {
    const response = await apiClient.get('/products/new-arrivals');
    return response.data;
  },

  getBestSellers: async () => {
    const response = await apiClient.get('/products/best-sellers');
    return response.data;
  },

  getProductsByCategory: async (categoryId) => {
    const response = await apiClient.get(`/products/category/${categoryId}`);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Products Mutation (Authenticated Admin APIs)
  createProduct: async (formData) => {
    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateProduct: async (id, formData) => {
    const response = await apiClient.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  updateProductDeal: async (id, dealData) => {
    const response = await apiClient.put(`/products/${id}/deal`, dealData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  deleteProductImage: async (productId, imageId) => {
    const response = await apiClient.delete(`/products/${productId}/images/${imageId}`);
    return response.data;
  },

  // Flash Deals APIs
  getActiveFlashDeals: async () => {
    const response = await apiClient.get('/flash-deals/active');
    return response.data;
  },

  getAllFlashDeals: async () => {
    const response = await apiClient.get('/flash-deals');
    return response.data;
  },

  createFlashDeal: async (dealData) => {
    const response = await apiClient.post('/flash-deals', dealData);
    return response.data;
  },

  updateFlashDeal: async (id, dealData) => {
    const response = await apiClient.put(`/flash-deals/${id}`, dealData);
    return response.data;
  },

  toggleFlashDealStatus: async (id) => {
    const response = await apiClient.put(`/flash-deals/${id}/toggle`);
    return response.data;
  },

  deleteFlashDeal: async (id) => {
    const response = await apiClient.delete(`/flash-deals/${id}`);
    return response.data;
  },

  // Order APIs (Customer)
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Payment APIs
  createPayment: async (orderId, paymentMethod) => {
    const response = await apiClient.post('/payments/create', { order_id: orderId, payment_method: paymentMethod });
    return response.data;
  },

  verifyPayment: async (orderId, transactionId, paymentReference) => {
    const response = await apiClient.post('/payments/verify', { order_id: orderId, transaction_id: transactionId, payment_reference: paymentReference });
    return response.data;
  },

  getPaymentStatus: async (orderId) => {
    const response = await apiClient.get(`/payments/status/${orderId}`);
    return response.data;
  },

  // Protected Admin Management APIs
  getAdminStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  getAdminOrders: async (params = {}) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  getAdminOrderById: async (id) => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  updateInventoryStock: async (productId, stockQuantity) => {
    const response = await apiClient.put(`/admin/inventory/${productId}`, { stock_quantity: stockQuantity });
    return response.data;
  }
};

export default apiClient;
