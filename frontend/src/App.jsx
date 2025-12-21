import React, { useState } from 'react';
import './styles/App.css';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Provenance from './pages/Provenance';
import ProvenanceTimeline from './pages/ProvenanceTimeline';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'orders':
        return <Orders />;
      case 'customers':
        return <Customers />;
      case 'provenance':
        return <Provenance />;
      case 'timeline':
        return <ProvenanceTimeline />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <div className="logo">
          <div className="logo-icon">📊</div>
          <h1>ProvenanceDB</h1>
        </div>
        
        <div className="nav-section">
          <div className="nav-label">Main</div>
          <button 
            className={currentPage === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-label">Data Management</div>
          <button 
            className={currentPage === 'products' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentPage('products')}
          >
            <span className="nav-icon">📦</span>
            Products
          </button>
          <button 
            className={currentPage === 'orders' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentPage('orders')}
          >
            <span className="nav-icon">🛒</span>
            Orders
          </button>
          <button 
            className={currentPage === 'customers' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentPage('customers')}
          >
            <span className="nav-icon">👥</span>
            Customers
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-label">Provenance</div>
          <button 
            className={currentPage === 'provenance' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentPage('provenance')}
          >
            <span className="nav-icon">🔍</span>
            Audit Logs
          </button>
          <button 
            className={currentPage === 'timeline' ? 'nav-item active' : 'nav-item'}
            onClick={() => setCurrentPage('timeline')}
          >
            <span className="nav-icon">⏱️</span>
            Timeline
          </button>
        </div>

        <div className="nav-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <div className="user-name">Database User</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;