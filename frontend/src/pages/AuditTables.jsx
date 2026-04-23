import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AuditTables() {
  const [activeTable, setActiveTable] = useState('customers');
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    operationType: 'all',
    dateRange: 'all',
    searchTerm: ''
  });

  useEffect(() => {
    loadAuditData();
  }, [activeTable]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      let data;
      switch(activeTable) {
        case 'customers':
          data = await api.getAuditCustomers();
          break;
        case 'products':
          data = await api.getAuditProducts();
          break;
        case 'orders':
          data = await api.getAuditOrders();
          break;
        case 'orderitems':
          data = await api.getAuditOrderItems();
          break;
        case 'payments':
          data = await api.getAuditPayments();
          break;
        case 'deleted':
          data = await api.getDeletedRecords();
          break;
        default:
          data = [];
      }
      console.log('Loaded audit data:', data); // Debug
      setAuditData(data || []);
    } catch (error) {
      console.error('Failed to load audit data:', error);
      setAuditData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await api.getAuditStats();
      console.log('Loaded stats:', statsData); // Debug
      setStats(statsData || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOperationColor = (operation) => {
    const colors = {
      'INSERT': 'insert',
      'UPDATE': 'update',
      'DELETE': 'delete'
    };
    return colors[operation] || 'default';
  };

  const filterData = () => {
    let filtered = [...auditData];

    if (filters.operationType !== 'all') {
      filtered = filtered.filter(item => item.operation_type === filters.operationType);
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => {
        return JSON.stringify(item).toLowerCase().includes(searchLower);
      });
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch(filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(item => 
        new Date(item.change_timestamp) >= cutoffDate
      );
    }

    return filtered;
  };

  const filteredData = filterData();

  const renderTableContent = () => {
    switch(activeTable) {
      case 'customers':
        return renderCustomersAudit();
      case 'products':
        return renderProductsAudit();
      case 'orders':
        return renderOrdersAudit();
      case 'orderitems':
        return renderOrderItemsAudit();
      case 'payments':
        return renderPaymentsAudit();
      case 'deleted':
        return renderDeletedRecords();
      default:
        return <div className="empty-state">No data available</div>;
    }
  };

  const renderCustomersAudit = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Audit ID</th>
            <th>Customer ID</th>
            <th>Operation</th>
            <th>Changes</th>
            <th>Changed By</th>
            <th>Timestamp</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((audit) => (
            <tr key={audit.audit_id}>
              <td>#{audit.audit_id}</td>
              <td><strong>{audit.customer_id}</strong></td>
              <td>
                <span className={`operation-badge ${getOperationColor(audit.operation_type)}`}>
                  {audit.operation_type}
                </span>
              </td>
              <td>
                <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                  {audit.old_name !== audit.new_name && audit.new_name && (
                    <div style={{marginBottom: '0.25rem'}}>
                      <strong>Name:</strong> {audit.old_name || 'N/A'} → {audit.new_name}
                    </div>
                  )}
                  {audit.old_email !== audit.new_email && audit.new_email && (
                    <div style={{marginBottom: '0.25rem'}}>
                      <strong>Email:</strong> {audit.old_email || 'N/A'} → {audit.new_email}
                    </div>
                  )}
                  {audit.old_phone !== audit.new_phone && (audit.old_phone || audit.new_phone) && (
                    <div style={{marginBottom: '0.25rem'}}>
                      <strong>Phone:</strong> {audit.old_phone || 'N/A'} → {audit.new_phone || 'N/A'}
                    </div>
                  )}
                  {audit.operation_type === 'DELETE' && (
                    <div style={{color: 'var(--danger)', fontWeight: '600', padding: '0.25rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', display: 'inline-block'}}>
                      Deleted: {audit.old_name} ({audit.old_email})
                    </div>
                  )}
                </div>
              </td>
              <td>{audit.changed_by}</td>
              <td style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{formatDate(audit.change_timestamp)}</td>
              <td><em>{audit.change_reason}</em></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderProductsAudit = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Audit ID</th>
            <th>Product ID</th>
            <th>Operation</th>
            <th>Changes</th>
            <th>Changed By</th>
            <th>Timestamp</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((audit) => (
            <tr key={audit.audit_id}>
              <td>#{audit.audit_id}</td>
              <td><strong>{audit.product_id}</strong></td>
              <td>
                <span className={`operation-badge ${getOperationColor(audit.operation_type)}`}>
                  {audit.operation_type}
                </span>
              </td>
              <td>
                <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                  {audit.old_name !== audit.new_name && audit.new_name && (
                    <div style={{marginBottom: '0.25rem'}}>
                      <strong>Name:</strong> {audit.old_name || 'N/A'} → {audit.new_name}
                    </div>
                  )}
                  {audit.old_price !== audit.new_price && audit.new_price !== null && (
                    <div style={{marginBottom: '0.25rem', color: 'var(--success)', fontWeight: '600'}}>
                      <strong>Price:</strong> ${audit.old_price || '0'} → ${audit.new_price}
                      {audit.price_change_percentage && (
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          background: audit.price_change_percentage > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                          color: audit.price_change_percentage > 0 ? 'var(--danger)' : 'var(--success)'
                        }}>
                          {audit.price_change_percentage > 0 ? '+' : ''}{audit.price_change_percentage}%
                        </span>
                      )}
                    </div>
                  )}
                  {audit.old_stock_quantity !== audit.new_stock_quantity && audit.new_stock_quantity !== null && (
                    <div style={{marginBottom: '0.25rem'}}>
                      <strong>Stock:</strong> {audit.old_stock_quantity || '0'} → {audit.new_stock_quantity}
                    </div>
                  )}
                  {audit.operation_type === 'DELETE' && (
                    <div style={{color: 'var(--danger)', fontWeight: '600', padding: '0.25rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px', display: 'inline-block'}}>
                      Deleted: {audit.old_name} (${audit.old_price})
                    </div>
                  )}
                </div>
              </td>
              <td>{audit.changed_by}</td>
              <td style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{formatDate(audit.change_timestamp)}</td>
              <td><em>{audit.change_reason}</em></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOrdersAudit = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Audit ID</th>
            <th>Order ID</th>
            <th>Operation</th>
            <th>Status Change</th>
            <th>Amount</th>
            <th>Changed By</th>
            <th>Timestamp</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((audit) => (
            <tr key={audit.audit_id}>
              <td>#{audit.audit_id}</td>
              <td><strong>#{audit.order_id}</strong></td>
              <td>
                <span className={`operation-badge ${getOperationColor(audit.operation_type)}`}>
                  {audit.operation_type}
                </span>
              </td>
              <td>
                {audit.old_status && audit.new_status && (
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span className={`status-badge small ${audit.old_status.toLowerCase()}`}>
                      {audit.old_status}
                    </span>
                    <span style={{color: 'var(--text-muted)'}}>→</span>
                    <span className={`status-badge small ${audit.new_status.toLowerCase()}`}>
                      {audit.new_status}
                    </span>
                  </div>
                )}
                {audit.operation_type === 'DELETE' && (
                  <span style={{color: 'var(--danger)'}}>Deleted ({audit.old_status})</span>
                )}
              </td>
              <td>
                {audit.old_total_amount !== audit.new_total_amount && audit.new_total_amount !== null && (
                  <div style={{fontWeight: '600', color: 'var(--info)'}}>
                    ${audit.old_total_amount || '0'} → ${audit.new_total_amount}
                  </div>
                )}
                {audit.operation_type === 'DELETE' && (
                  <div>${audit.old_total_amount}</div>
                )}
              </td>
              <td>{audit.changed_by}</td>
              <td style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{formatDate(audit.change_timestamp)}</td>
              <td><em>{audit.change_reason}</em></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOrderItemsAudit = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Audit ID</th>
            <th>Item ID</th>
            <th>Order ID</th>
            <th>Product ID</th>
            <th>Operation</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Changed By</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((audit) => (
            <tr key={audit.audit_id}>
              <td>#{audit.audit_id}</td>
              <td><strong>{audit.order_item_id}</strong></td>
              <td>#{audit.order_id}</td>
              <td>{audit.product_id}</td>
              <td>
                <span className={`operation-badge ${getOperationColor(audit.operation_type)}`}>
                  {audit.operation_type}
                </span>
              </td>
              <td>
                {audit.old_quantity !== audit.new_quantity && audit.new_quantity !== null ? (
                  <div>{audit.old_quantity || '0'} → {audit.new_quantity}</div>
                ) : audit.operation_type === 'DELETE' ? (
                  <div>{audit.old_quantity}</div>
                ) : '-'}
              </td>
              <td>
                {audit.old_unit_price !== audit.new_unit_price && audit.new_unit_price !== null ? (
                  <div>${audit.old_unit_price || '0'} → ${audit.new_unit_price}</div>
                ) : audit.operation_type === 'DELETE' ? (
                  <div>${audit.old_unit_price}</div>
                ) : '-'}
              </td>
              <td>{audit.changed_by}</td>
              <td style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{formatDate(audit.change_timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPaymentsAudit = () => (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Audit ID</th>
            <th>Payment ID</th>
            <th>Order ID</th>
            <th>Operation</th>
            <th>Status Change</th>
            <th>Amount</th>
            <th>Changed By</th>
            <th>Timestamp</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((audit) => (
            <tr key={audit.audit_id}>
              <td>#{audit.audit_id}</td>
              <td><strong>{audit.payment_id}</strong></td>
              <td>#{audit.order_id}</td>
              <td>
                <span className={`operation-badge ${getOperationColor(audit.operation_type)}`}>
                  {audit.operation_type}
                </span>
              </td>
              <td>
                {audit.old_status && audit.new_status && (
                  <div>{audit.old_status} → {audit.new_status}</div>
                )}
                {audit.operation_type === 'DELETE' && (
                  <div>{audit.old_status}</div>
                )}
              </td>
              <td>
                {audit.old_amount !== audit.new_amount && audit.new_amount !== null ? (
                  <div style={{fontWeight: '600', color: 'var(--info)'}}>
                    ${audit.old_amount || '0'} → ${audit.new_amount}
                  </div>
                ) : audit.operation_type === 'DELETE' ? (
                  <div>${audit.old_amount}</div>
                ) : '-'}
              </td>
              <td>{audit.changed_by}</td>
              <td style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{formatDate(audit.change_timestamp)}</td>
              <td><em>{audit.change_reason}</em></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderDeletedRecords = () => {
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Entity Type</th>
              <th>Entity ID</th>
              <th>Deleted Data</th>
              <th>Deleted By</th>
              <th>Deletion Time</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((record, index) => (
              <tr key={index} style={{background: 'rgba(239, 68, 68, 0.03)'}}>
                <td>
                  <span className="entity-badge">{record.entity_type}</span>
                </td>
                <td><strong>#{record.entity_id}</strong></td>
                <td>
                  <div style={{fontSize: '0.85rem'}}>
                    {record.old_name && <div><strong>Name:</strong> {record.old_name}</div>}
                    {record.old_email && <div><strong>Email:</strong> {record.old_email}</div>}
                    {record.old_price && <div><strong>Price:</strong> ${record.old_price}</div>}
                    {record.old_status && <div><strong>Status:</strong> {record.old_status}</div>}
                    {record.old_total_amount && <div><strong>Amount:</strong> ${record.old_total_amount}</div>}
                  </div>
                </td>
                <td>{record.changed_by}</td>
                <td style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{formatDate(record.change_timestamp)}</td>
                <td><em>{record.change_reason}</em></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading audit data...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Audit Tables</h2>
          <p className="page-subtitle">Complete history of all database operations including deleted records</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon customers">📋</div>
          <div className="stat-content">
            <div className="stat-label">Total Audits</div>
            <div className="stat-value">{stats.total_audits || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">➕</div>
          <div className="stat-content">
            <div className="stat-label">Insertions</div>
            <div className="stat-value">{stats.total_inserts || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">✏️</div>
          <div className="stat-content">
            <div className="stat-label">Updates</div>
            <div className="stat-value">{stats.total_updates || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">🗑️</div>
          <div className="stat-content">
            <div className="stat-label">Deletions</div>
            <div className="stat-value">{stats.total_deletes || 0}</div>
          </div>
        </div>
      </div>

      {/* Table Selection - Improved Design */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        background: 'var(--bg-card)',
        padding: '1rem',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color)'
      }}>
        <button
          className={activeTable === 'customers' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTable('customers')}
          style={{fontSize: '0.9rem', padding: '0.75rem 1.25rem'}}
        >
          👥 Customers ({stats.customers_count || 0})
        </button>
        <button
          className={activeTable === 'products' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTable('products')}
          style={{fontSize: '0.9rem', padding: '0.75rem 1.25rem'}}
        >
          📦 Products ({stats.products_count || 0})
        </button>
        <button
          className={activeTable === 'orders' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTable('orders')}
          style={{fontSize: '0.9rem', padding: '0.75rem 1.25rem'}}
        >
          🛒 Orders ({stats.orders_count || 0})
        </button>
        <button
          className={activeTable === 'orderitems' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTable('orderitems')}
          style={{fontSize: '0.9rem', padding: '0.75rem 1.25rem'}}
        >
          📝 Order Items ({stats.orderitems_count || 0})
        </button>
        <button
          className={activeTable === 'payments' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTable('payments')}
          style={{fontSize: '0.9rem', padding: '0.75rem 1.25rem'}}
        >
          💳 Payments ({stats.payments_count || 0})
        </button>
        <button
          className={activeTable === 'deleted' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTable('deleted')}
          style={{
            fontSize: '0.9rem',
            padding: '0.75rem 1.25rem',
            background: activeTable === 'deleted' ? 'linear-gradient(135deg, var(--danger), #dc2626)' : undefined
          }}
        >
          🗑️ Deleted ({stats.total_deletes || 0})
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius)',
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px'}}>
          <label style={{fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)'}}>
            Operation:
          </label>
          <select
            value={filters.operationType}
            onChange={(e) => setFilters({...filters, operationType: e.target.value})}
            style={{
              padding: '0.75rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Operations</option>
            <option value="INSERT">Insert</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px'}}>
          <label style={{fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)'}}>
            Date Range:
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            style={{
              padding: '0.75rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1', minWidth: '250px'}}>
          <label style={{fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)'}}>
            Search:
          </label>
          <input
            type="text"
            placeholder="Search audit records..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
            style={{
              padding: '0.75rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <button 
          className="btn-secondary" 
          onClick={() => setFilters({operationType: 'all', dateRange: 'all', searchTerm: ''})}
        >
          Clear
        </button>
      </div>

      {/* Data Card */}
      <div className="data-card">
        <div className="card-header">
          <h3>
            {activeTable === 'deleted' ? 'All Deleted Records' : `${activeTable.charAt(0).toUpperCase() + activeTable.slice(1)} Audit Log`}
          </h3>
          <span className="badge">{filteredData.length} Records</span>
        </div>
        <div className="card-content">
          {filteredData.length === 0 ? (
            <div className="empty-state">
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📋</div>
              <div style={{fontSize: '1.1rem', color: 'var(--text-muted)'}}>
                No audit records found
              </div>
              <div style={{fontSize: '0.9rem', color: 'var(--text-dim)', marginTop: '0.5rem'}}>
                Try adjusting your filters or perform some operations to generate audit logs
              </div>
            </div>
          ) : (
            renderTableContent()
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditTables;