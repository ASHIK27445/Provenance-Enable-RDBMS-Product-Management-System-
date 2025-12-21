import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [provenance, setProvenance] = useState([]);
  const [showProvenance, setShowProvenance] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '0',
      category: ''
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock_quantity: product.stock_quantity,
      category: product.category || ''
    });
    setSelectedProduct(product);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      alert('Name and Price are required');
      return;
    }

    try {
      if (isEditing) {
        await api.updateProduct(selectedProduct.product_id, formData);
        alert('✅ Product updated! The change has been logged in the audit table.');
      } else {
        await api.createProduct(formData);
        alert('✅ Product created! An INSERT audit record has been generated.');
      }
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('❌ Failed to save product. Please try again.');
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Delete "${product.name}"?\n\n⚠️ This will create a DELETE audit record.`)) {
      try {
        await api.deleteProduct(product.product_id);
        alert('✅ Product deleted! A DELETE audit record has been created.');
        loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('❌ Cannot delete. Product may be in existing orders.');
      }
    }
  };

  const viewProvenance = async (product) => {
    setSelectedProduct(product);
    try {
      const data = await api.getProductProvenance(product.product_id);
      setProvenance(data);
      setShowProvenance(true);
    } catch (error) {
      console.error('Failed to load provenance:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p className="page-subtitle">Create, update, delete products and view price history</p>
        </div>
        <button className="btn-primary" onClick={openCreateForm}>
          ➕ Add New Product
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.product_id}>
                <td>{product.product_id}</td>
                <td>
                  <div className="table-cell-main">{product.name}</div>
                  <div className="table-cell-sub">{product.description}</div>
                </td>
                <td>
                  <span className="badge category">{product.category}</span>
                </td>
                <td className="price">${product.price}</td>
                <td>
                  <span className={`stock-badge ${product.stock_quantity < 50 ? 'low' : ''}`}>
                    {product.stock_quantity} units
                  </span>
                </td>
                <td>{formatDate(product.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-small btn-view"
                      onClick={() => viewProvenance(product)}
                      title="View audit history"
                    >
                      📋
                    </button>
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => openEditForm(product)}
                      title="Edit product"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(product)}
                      title="Delete product"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditing ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="data-form">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Laptop Pro 15"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Product description..."
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Select category...</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Books">Books</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {isEditing ? '💾 Update Product' : '➕ Create Product'}
                  </button>
                </div>

                <div className="form-info">
                  📊 <strong>Provenance Tracking:</strong> This action will be automatically logged with timestamp, user, and details.
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showProvenance && (
        <div className="modal-overlay" onClick={() => setShowProvenance(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Product History: {selectedProduct?.name}</h3>
              <button className="modal-close" onClick={() => setShowProvenance(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="provenance-info">
                <div className="provenance-badge why">WHY-Provenance</div>
                <p>Complete history explaining why current data exists</p>
              </div>
              
              {provenance.length === 0 ? (
                <div className="empty-state">No changes recorded yet</div>
              ) : (
                <div className="timeline">
                  {provenance.map((entry, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className={`operation-badge ${entry.operation_type.toLowerCase()}`}>
                            {entry.operation_type}
                          </span>
                          <span className="timeline-date">{formatDate(entry.change_timestamp)}</span>
                        </div>
                        <div className="timeline-body">
                          {entry.old_price && entry.new_price && (
                            <div className="change-detail">
                              <strong>Price:</strong> ${entry.old_price} → ${entry.new_price}
                              {entry.price_change_percentage && (
                                <span className={`change-percent ${entry.price_change_percentage > 0 ? 'increase' : 'decrease'}`}>
                                  ({entry.price_change_percentage > 0 ? '+' : ''}{entry.price_change_percentage}%)
                                </span>
                              )}
                            </div>
                          )}
                          {entry.old_stock_quantity !== null && entry.new_stock_quantity !== null && (
                            <div className="change-detail">
                              <strong>Stock:</strong> {entry.old_stock_quantity} → {entry.new_stock_quantity}
                            </div>
                          )}
                          {entry.change_reason && (
                            <div className="change-reason">
                              <em>{entry.change_reason}</em>
                            </div>
                          )}
                          <div className="changed-by">Changed by: {entry.changed_by}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;