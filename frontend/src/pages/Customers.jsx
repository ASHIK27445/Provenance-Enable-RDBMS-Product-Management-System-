import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [provenance, setProvenance] = useState([]);
  const [showProvenance, setShowProvenance] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: ''
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setSelectedCustomer(customer);
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
    
    if (!formData.name || !formData.email) {
      alert('Name and Email are required');
      return;
    }

    try {
      if (isEditing) {
        await api.updateCustomer(selectedCustomer.customer_id, formData);
        alert('✅ Customer updated! The change has been logged in the audit table.');
      } else {
        await api.createCustomer(formData);
        alert('✅ Customer created! An INSERT audit record has been generated.');
      }
      setShowForm(false);
      loadCustomers();
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('❌ Failed to save customer. Please check if the email is unique.');
    }
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Delete customer "${customer.name}"?\n\n⚠️ This will also delete all their orders (CASCADE).`)) {
      try {
        await api.deleteCustomer(customer.customer_id);
        alert('✅ Customer deleted! A DELETE audit record has been created.');
        loadCustomers();
      } catch (error) {
        console.error('Failed to delete customer:', error);
        alert('❌ Failed to delete customer.');
      }
    }
  };

  const viewProvenance = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const data = await api.getCustomerProvenance(customer.customer_id);
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
        <div className="loading">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Customers</h2>
          <p className="page-subtitle">Create, update, delete customers and track information changes</p>
        </div>
        <button className="btn-primary" onClick={openCreateForm}>
          ➕ Add New Customer
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(customer => (
              <tr key={customer.customer_id}>
                <td>{customer.customer_id}</td>
                <td>
                  <div className="customer-name">{customer.name}</div>
                </td>
                <td>{customer.email}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>{formatDate(customer.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-small btn-view"
                      onClick={() => viewProvenance(customer)}
                      title="View audit history"
                    >
                      📋
                    </button>
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => openEditForm(customer)}
                      title="Edit customer"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-small btn-delete"
                      onClick={() => handleDelete(customer)}
                      title="Delete customer"
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
              <h3>{isEditing ? '✏️ Edit Customer' : '➕ Add New Customer'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleSubmit} className="data-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1-555-0123"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, City, State, ZIP"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {isEditing ? '💾 Update Customer' : '➕ Create Customer'}
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
              <h3>📋 Customer History: {selectedCustomer?.name}</h3>
              <button className="modal-close" onClick={() => setShowProvenance(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="provenance-info">
                <div className="provenance-badge where">WHERE-Provenance</div>
                <p>Track all modifications to customer information over time</p>
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
                          {entry.old_name !== entry.new_name && entry.new_name && (
                            <div className="change-detail">
                              <strong>Name:</strong> {entry.old_name || 'N/A'} → {entry.new_name}
                            </div>
                          )}
                          {entry.old_email !== entry.new_email && entry.new_email && (
                            <div className="change-detail">
                              <strong>Email:</strong> {entry.old_email || 'N/A'} → {entry.new_email}
                            </div>
                          )}
                          {entry.old_phone !== entry.new_phone && (entry.old_phone || entry.new_phone) && (
                            <div className="change-detail">
                              <strong>Phone:</strong> {entry.old_phone || 'N/A'} → {entry.new_phone || 'N/A'}
                            </div>
                          )}
                          {entry.old_address !== entry.new_address && (entry.old_address || entry.new_address) && (
                            <div className="change-detail">
                              <strong>Address:</strong> {entry.old_address || 'N/A'} → {entry.new_address || 'N/A'}
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

export default Customers;