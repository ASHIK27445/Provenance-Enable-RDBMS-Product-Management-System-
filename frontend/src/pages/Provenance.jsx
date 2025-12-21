import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Provenance() {
  const [priceChanges, setPriceChanges] = useState([]);
  const [summary, setSummary] = useState([]);
  const [activeTab, setActiveTab] = useState('prices');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pricesData, summaryData] = await Promise.all([
        api.getPriceChanges(),
        api.getProvenanceSummary()
      ]);
      setPriceChanges(pricesData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load provenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading audit logs...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Audit Logs</h2>
        <p className="page-subtitle">Comprehensive provenance tracking across all entities</p>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'prices' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('prices')}
        >
          💰 Price Changes
        </button>
        <button 
          className={activeTab === 'summary' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('summary')}
        >
          📊 Summary
        </button>
      </div>

      {activeTab === 'prices' && (
        <div className="tab-content">
          <div className="content-header">
            <h3>Product Price History</h3>
            <span className="badge">{priceChanges.length} Changes</span>
          </div>
          
          {priceChanges.length === 0 ? (
            <div className="empty-state">No price changes recorded</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Old Price</th>
                    <th>New Price</th>
                    <th>Change</th>
                    <th>Date</th>
                    <th>Changed By</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {priceChanges.map((change, index) => (
                    <tr key={index}>
                      <td>
                        <div className="table-cell-main">{change.product_name}</div>
                        <div className="table-cell-sub">ID: {change.product_id}</div>
                      </td>
                      <td className="price">${change.old_price}</td>
                      <td className="price">${change.new_price}</td>
                      <td>
                        <span className={`change-percent ${change.price_change_percentage > 0 ? 'increase' : 'decrease'}`}>
                          {change.price_change_percentage > 0 ? '▲' : '▼'} 
                          {Math.abs(change.price_change_percentage).toFixed(2)}%
                        </span>
                      </td>
                      <td>{formatDate(change.change_timestamp)}</td>
                      <td>{change.changed_by}</td>
                      <td>{change.change_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="tab-content">
          <div className="content-header">
            <h3>Audit Summary by Entity</h3>
          </div>
          
          <div className="summary-grid">
            {summary.map((item, index) => (
              <div key={index} className="summary-card">
                <div className="summary-card-header">
                  <h4>{item.table_name}</h4>
                  <span className="summary-count">{item.total_changes}</span>
                </div>
                <div className="summary-card-body">
                  <div className="summary-stat">
                    <span className="summary-label">Total Changes</span>
                    <span className="summary-value">{item.total_changes}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-label">Unique Entities</span>
                    <span className="summary-value">{item.unique_entities}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="summary-label">Last Activity</span>
                    <span className="summary-value-small">
                      {item.last_change ? formatDate(item.last_change) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="provenance-types-section">
            <h3>Provenance Types Explained</h3>
            <div className="provenance-types-grid">
              <div className="provenance-explanation-card">
                <div className="provenance-type-header why">
                  <span className="provenance-icon">❓</span>
                  <h4>WHY-Provenance</h4>
                </div>
                <p>Explains <strong>why</strong> a data value exists by tracking its justification and reasons for changes.</p>
                <div className="examples">
                  <strong>Examples:</strong>
                  <ul>
                    <li>Price change history with reasons</li>
                    <li>Customer information updates</li>
                    <li>Payment status changes</li>
                  </ul>
                </div>
              </div>

              <div className="provenance-explanation-card">
                <div className="provenance-type-header where">
                  <span className="provenance-icon">📍</span>
                  <h4>WHERE-Provenance</h4>
                </div>
                <p>Identifies <strong>where</strong> data originated from, including sources and actors.</p>
                <div className="examples">
                  <strong>Examples:</strong>
                  <ul>
                    <li>User actions on tables</li>
                    <li>Order item sources</li>
                    <li>Temporal activity patterns</li>
                  </ul>
                </div>
              </div>

              <div className="provenance-explanation-card">
                <div className="provenance-type-header how">
                  <span className="provenance-icon">🔄</span>
                  <h4>HOW-Provenance</h4>
                </div>
                <p>Traces <strong>how</strong> data evolved through transformations and state changes.</p>
                <div className="examples">
                  <strong>Examples:</strong>
                  <ul>
                    <li>Order status lifecycle</li>
                    <li>Multi-entity evolution</li>
                    <li>Cascading updates impact</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Provenance;