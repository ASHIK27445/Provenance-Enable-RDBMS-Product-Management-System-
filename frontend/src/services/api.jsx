const API_BASE_URL = 'http://localhost:5001/api';

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Customer endpoints
  getCustomers() {
    return this.request('/customers');
  }

  getCustomer(id) {
    return this.request(`/customers/${id}`);
  }

  createCustomer(data) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateCustomer(id, data) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteCustomer(id) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  deleteCustomer(id) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Product endpoints
  getProducts() {
    return this.request('/products');
  }

  getProduct(id) {
    return this.request(`/products/${id}`);
  }

  createProduct(data) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateProduct(id, data) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  getOrders() {
    return this.request('/orders');
  }

  getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  createOrder(data) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateOrderStatus(id, status) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Payment endpoints
  getPayments() {
    return this.request('/payments');
  }

  createPayment(orderId, data) {
    return this.request(`/payments/${orderId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updatePaymentStatus(id, status) {
    return this.request(`/payments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Provenance endpoints
  getProductProvenance(id) {
    return this.request(`/provenance/products/${id}`);
  }

  getOrderProvenance(id) {
    return this.request(`/provenance/orders/${id}`);
  }

  getCustomerProvenance(id) {
    return this.request(`/provenance/customers/${id}`);
  }

  getUserActions(username) {
    return this.request(`/provenance/user/${username}`);
  }

  getPriceChanges() {
    return this.request('/provenance/price-changes');
  }

  getProvenanceSummary() {
    return this.request('/provenance/summary');
  }

  getProvenanceTimeline() {
    return this.request('/provenance/timeline');
  }

  // Dashboard endpoints
  getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Audit Table endpoints
getAuditCustomers() {
  return this.request('/audit/customers');
}

getAuditProducts() {
  return this.request('/audit/products');
}

getAuditOrders() {
  return this.request('/audit/orders');
}

getAuditOrderItems() {
  return this.request('/audit/orderitems');
}

getAuditPayments() {
  return this.request('/audit/payments');
}

getDeletedRecords() {
  return this.request('/audit/deleted');
}

getAuditStats() {
  return this.request('/audit/stats');
}

}

export default new ApiService();