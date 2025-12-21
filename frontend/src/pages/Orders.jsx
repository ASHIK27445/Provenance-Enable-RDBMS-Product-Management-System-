import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [provenance, setProvenance] = useState([]);
  const [showProvenance, setShowProvenance] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openStatusForm = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusForm(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.updateOrderStatus(selectedOrder.order_id, newStatus);
      alert(`✅ Order status updated to "${newStatus}"! The change has been logged in the audit table.`);
      setShowStatusForm(false);
      loadOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('❌ Failed to update order status.');
    }
  };

  const viewProvenance = async (order) => {
    setSelectedOrder(order);
    try {
      const data = await api.getOrderProvenance(order.order_id);
      setProvenance(data);
      setShowProvenance(true);
    } catch (error) {
      console.error('Failed to load provenance:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'pending',
      'Processing': 'processing',
      'Shipped': 'shipped',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Orders</h2>
        <p className="page-subtitle">Update order status and track order lifecycle</p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.order_id}>
                <td>
                  <div className="order-id">#{order.order_id}</div>
                </td>
                <td>
                  <div className="table-cell-main">{order.customer_name}</div>
                  <div className="table-cell-sub">{order.customer_email}</div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="price">${order.total_amount}</td>
                <td>{formatDate(order.order_date)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-small btn-view"
                      onClick={() => viewProvenance(order)}
                      title="View order journey"
                    >
                      📋
                    </button>
                    <button 
                      className="btn-small btn-edit"
                      onClick={() => openStatusForm(order)}
                      title="Update status"
                    >
                      🔄
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Update Form */}
      {showStatusForm && (
        <div className="modal-overlay" onClick={() => setShowStatusForm(false)}>
          <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔄 Update Order Status</h3>
              <button className="modal-close" onClick={() => setShowStatusForm(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="order-info-card">
                <strong>Order #{selectedOrder?.order_id}</strong>
                <div className="order-info-detail">Customer: {selectedOrder?.customer_name}</div>
                <div className="order-info-detail">Current Status: 
                  <span className={`status-badge ${getStatusColor(selectedOrder?.status)}`}>
                    {selectedOrder?.status}
                  </span>
                </div>
              </div>

              <form onSubmit={handleStatusUpdate} className="data-form">
                <div className="form-group">
                  <label>New Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="status-flow">
                  <div className="flow-label">Typical Order Flow:</div>
                  <div className="flow-steps">
                    <span className="flow-step">Pending</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-step">Processing</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-step">Shipped</span>
                    <span className="flow-arrow">→</span>
                    <span className="flow-step">Delivered</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowStatusForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    💾 Update Status
                  </button>
                </div>

                <div className="form-info">
                  📊 <strong>Provenance Tracking:</strong> This status change will be logged showing the transition.
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Provenance Modal */}
      {showProvenance && (
        <div className="modal-overlay" onClick={() => setShowProvenance(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Order Journey: #{selectedOrder?.order_id}</h3>
              <button className="modal-close" onClick={() => setShowProvenance(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="provenance-info">
                <div className="provenance-badge how">HOW-Provenance</div>
                <p>Complete evolution showing how this order progressed through different states</p>
              </div>

              <div className="order-summary">
                <div className="summary-item">
                  <strong>Customer:</strong> {selectedOrder?.customer_name}
                </div>
                <div className="summary-item">
                  <strong>Current Status:</strong> 
                  <span className={`status-badge ${getStatusColor(selectedOrder?.status)}`}>
                    {selectedOrder?.status}
                  </span>
                </div>
                <div className="summary-item">
                  <strong>Total:</strong> ${selectedOrder?.total_amount}
                </div>
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
                          <span className="entity-badge">{entry.entity_type}</span>
                          <span className={`operation-badge ${entry.operation_type.toLowerCase()}`}>
                            {entry.operation_type}
                          </span>
                          <span className="timeline-date">{formatDate(entry.change_timestamp)}</span>
                        </div>
                        <div className="timeline-body">
                          {entry.old_status && entry.new_status && (
                            <div className="change-detail">
                              <strong>Status Change:</strong>
                              <span className={`status-badge small ${getStatusColor(entry.old_status)}`}>
                                {entry.old_status}
                              </span>
                              <span className="arrow">→</span>
                              <span className={`status-badge small ${getStatusColor(entry.new_status)}`}>
                                {entry.new_status}
                              </span>
                            </div>
                          )}
                          {entry.old_total_amount && entry.new_total_amount && (
                            <div className="change-detail">
                              <strong>Amount Change:</strong> ${entry.old_total_amount} → ${entry.new_total_amount}
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

export default Orders;