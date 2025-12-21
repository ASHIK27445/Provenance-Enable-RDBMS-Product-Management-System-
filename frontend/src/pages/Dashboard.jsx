import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, summaryData] = await Promise.all([
        api.getDashboardStats(),
        api.getProvenanceSummary()
      ]);
      setStats(statsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">Overview of your e-commerce system and provenance tracking</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon customers">👥</div>
          <div className="stat-content">
            <div className="stat-label">Total Customers</div>
            <div className="stat-value">{stats?.total_customers || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon products">📦</div>
          <div className="stat-content">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{stats?.total_products || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">🛒</div>
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats?.total_orders || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">${stats?.total_revenue?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Provenance Statistics</h3>
            <span className="badge">{stats?.total_audit_records || 0} Records</span>
          </div>
          <div className="card-content">
            <div className="provenance-stats">
              {summary.map((item, index) => (
                <div key={index} className="provenance-stat-row">
                  <div className="provenance-stat-label">{item.table_name}</div>
                  <div className="provenance-stat-bar">
                    <div 
                      className="provenance-stat-fill"
                      style={{
                        width: `${(item.total_changes / stats?.total_audit_records * 100) || 0}%`
                      }}
                    ></div>
                  </div>
                  <div className="provenance-stat-value">{item.total_changes}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Provenance Types</h3>
            <span className="badge info">Info</span>
          </div>
          <div className="card-content">
            <div className="provenance-types">
              <div className="provenance-type-card why">
                <div className="provenance-type-icon">❓</div>
                <div className="provenance-type-label">WHY</div>
                <div className="provenance-type-desc">Justification for data values</div>
              </div>
              <div className="provenance-type-card where">
                <div className="provenance-type-icon">📍</div>
                <div className="provenance-type-label">WHERE</div>
                <div className="provenance-type-desc">Origin and source of data</div>
              </div>
              <div className="provenance-type-card how">
                <div className="provenance-type-icon">🔄</div>
                <div className="provenance-type-label">HOW</div>
                <div className="provenance-type-desc">Evolution and transformation</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="info-card">
        <div className="info-icon">ℹ️</div>
        <div className="info-content">
          <h4>About Provenance Tracking</h4>
          <p>
            This system automatically captures complete provenance (audit trail) of all data changes 
            using database triggers. Every INSERT, UPDATE, and DELETE operation is logged with 
            timestamps, user information, and change reasons. Use the Audit Logs and Timeline pages 
            to explore the provenance data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;