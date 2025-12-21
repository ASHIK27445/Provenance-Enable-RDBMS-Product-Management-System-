import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ProvenanceTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [filteredTimeline, setFilteredTimeline] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filterType, timeline]);

  const loadTimeline = async () => {
    try {
      const data = await api.getProvenanceTimeline();
      setTimeline(data);
      setFilteredTimeline(data);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filterType === 'all') {
      setFilteredTimeline(timeline);
    } else {
      setFilteredTimeline(timeline.filter(item => item.entity_type === filterType));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getEntityIcon = (entityType) => {
    const icons = {
      'Customer': '👤',
      'Product': '📦',
      'Order': '🛒',
      'OrderItem': '📝',
      'Payment': '💳'
    };
    return icons[entityType] || '📄';
  };

  const getEntityColor = (entityType) => {
    const colors = {
      'Customer': 'customer',
      'Product': 'product',
      'Order': 'order',
      'OrderItem': 'orderitem',
      'Payment': 'payment'
    };
    return colors[entityType] || 'default';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Provenance Timeline</h2>
        <p className="page-subtitle">Chronological view of all system changes</p>
      </div>

      <div className="filter-bar">
        <div className="filter-label">Filter by entity:</div>
        <div className="filter-buttons">
          <button 
            className={filterType === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilterType('all')}
          >
            All ({timeline.length})
          </button>
          <button 
            className={filterType === 'Customer' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilterType('Customer')}
          >
            👤 Customers
          </button>
          <button 
            className={filterType === 'Product' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilterType('Product')}
          >
            📦 Products
          </button>
          <button 
            className={filterType === 'Order' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilterType('Order')}
          >
            🛒 Orders
          </button>
          <button 
            className={filterType === 'OrderItem' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilterType('OrderItem')}
          >
            📝 Order Items
          </button>
          <button 
            className={filterType === 'Payment' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilterType('Payment')}
          >
            💳 Payments
          </button>
        </div>
      </div>

      <div className="timeline-stats">
        <div className="stat-badge">
          <span className="stat-label">Total Events:</span>
          <span className="stat-value">{filteredTimeline.length}</span>
        </div>
      </div>

      {filteredTimeline.length === 0 ? (
        <div className="empty-state">No events found for selected filter</div>
      ) : (
        <div className="timeline-view">
          {filteredTimeline.map((event, index) => (
            <div key={index} className="timeline-event">
              <div className="timeline-event-marker">
                <div className={`event-icon ${getEntityColor(event.entity_type)}`}>
                  {getEntityIcon(event.entity_type)}
                </div>
                {index < filteredTimeline.length - 1 && <div className="timeline-line"></div>}
              </div>
              
              <div className="timeline-event-content">
                <div className="event-header">
                  <div className="event-title">
                    <span className={`entity-badge ${getEntityColor(event.entity_type)}`}>
                      {event.entity_type}
                    </span>
                    <span className="entity-id">ID: {event.entity_id}</span>
                    <span className={`operation-badge ${event.operation_type.toLowerCase()}`}>
                      {event.operation_type}
                    </span>
                  </div>
                  <div className="event-time">{formatDate(event.change_timestamp)}</div>
                </div>
                
                <div className="event-body">
                  {event.change_reason && (
                    <div className="event-reason">
                      <strong>Reason:</strong> {event.change_reason}
                    </div>
                  )}
                  <div className="event-meta">
                    <span className="event-user">
                      <strong>Changed by:</strong> {event.changed_by}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProvenanceTimeline;