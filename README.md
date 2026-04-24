<div align="center">

<br/>

# ProvenanceDB

### *E-Commerce Provenance Tracking System*

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Course](https://img.shields.io/badge/Course-CSE464-purple?style=for-the-badge)](/)
[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)]()

<br/>

> A full-stack web application that demonstrates **database provenance** (WHY, WHERE, and HOW) through a real-world e-commerce scenario. Every INSERT, UPDATE, and DELETE operation is automatically captured by MySQL triggers into dedicated audit tables, giving you a complete, tamper-evident history of all data changes.

<br/>

[Quick Start](#quick-start) &nbsp;·&nbsp; [API Reference](#api-reference) &nbsp;·&nbsp; [Database Schema](#database-schema) &nbsp;·&nbsp; [Provenance Queries](#provenance-queries)

<br/>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Trigger System](#trigger-system)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Provenance Queries](#provenance-queries)
- [UI Pages](#ui-pages)
- [Known Issues & Notes](#known-issues--notes)

---

## Overview

ProvenanceDB is built to answer three fundamental questions about your data:

| Type | Question | Example |
|------|----------|---------|
| **WHY-Provenance** | Why does this value currently exist? | Why is the laptop priced at $1,249.99? |
| **WHERE-Provenance** | Where did this data originate from? | Who created this order and from which source? |
| **HOW-Provenance** | How did this data evolve? | How did Order #1 go from Pending to Delivered? |

All tracking happens **automatically** via MySQL triggers — no application code changes are needed to capture audit history.

---

## Features

- **Customer Management** — Create, edit, and delete customers with full WHERE-provenance history per record
- **Product Management** — Manage inventory with price history tracking (WHY-provenance)
- **Order Management** — Update order statuses with HOW-provenance showing the full lifecycle
- **Audit Tables** — Dedicated view of all five raw audit tables (Customers, Products, Orders, OrderItems, Payments)
- **Audit Logs** — Price change history and per-entity summary statistics
- **Provenance Timeline** — Chronological, filterable view of every event across all entities
- **Dashboard** — System-wide statistics and provenance record counts
- **Automatic Trigger Logging** — All DB operations captured without any manual instrumentation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, CSS (custom) |
| Backend | Python 3, Flask, Flask-CORS |
| Database | MySQL (via XAMPP / MySQL Server) |
| DB Connector | `mysql-connector-python` |

---

## Project Structure

```
provenancedb/
│
├── README.md
│
├── database/
│   ├── 01_schema_and_triggers.sql    <- Core tables + all audit tables + triggers
│   ├── 02_sample_data.sql            <- Sample data + simulated modification history
│   └── 03_provenance_queries.sql     <- 10 example provenance queries (WHY/WHERE/HOW)
│
├── backend/
│   └── app.py                        <- Flask REST API server (port 5001)
│
└── frontend/
    └── src/
        ├── App.jsx                   <- Root component + sidebar navigation
        ├── styles/
        │   └── App.css               <- Global styles
        ├── services/
        │   └── api.jsx               <- Centralized API service layer
        └── pages/
            ├── Dashboard.jsx         <- Stats overview
            ├── Customers.jsx         <- Customer CRUD + history modal
            ├── Products.jsx          <- Product CRUD + price history modal
            ├── Orders.jsx            <- Order status updates + lifecycle modal
            ├── AuditTables.jsx       <- Raw audit table viewer
            ├── Provenance.jsx        <- Price changes + summary tabs
            └── ProvenanceTimeline.jsx <- Chronological event timeline
```

---

## Database Schema

### Core Tables

```
Customers       -> customer_id, name, email, phone, address, created_at
Products        -> product_id, name, description, price, stock_quantity, category, created_at
Orders          -> order_id, customer_id, order_date, status, total_amount, shipping_address
OrderItems      -> order_item_id, order_id, product_id, quantity, unit_price, subtotal (generated)
Payments        -> payment_id, order_id, amount, payment_method, payment_date, status, transaction_id
```

### Audit (Provenance) Tables

Each core table has a corresponding audit table that stores before/after values for every operation:

```
Audit_Customers   -> audit_id, customer_id, operation_type, old_*/new_*, changed_by, change_timestamp, change_reason
Audit_Products    -> audit_id, product_id, operation_type, old_*/new_*, price_change_percentage, ...
Audit_Orders      -> audit_id, order_id, operation_type, old_status, new_status, old_total_amount, ...
Audit_OrderItems  -> audit_id, order_item_id, order_id, product_id, operation_type, old_*/new_*, ...
Audit_Payments    -> audit_id, payment_id, order_id, operation_type, old_*/new_*, ...
```

> `Audit_Products` stores a computed `price_change_percentage` field automatically calculated as `((new_price - old_price) / old_price) x 100`.

---

## Trigger System

**15 triggers** are defined across the 5 core tables (`AFTER INSERT`, `AFTER UPDATE`, `AFTER DELETE` x 5 tables). They populate the audit tables automatically on every data change.

```
Customers   ->  trg_customers_after_insert / update / delete
Products    ->  trg_products_after_insert / update / delete   <- also computes price_change_percentage
Orders      ->  trg_orders_after_insert / update / delete
OrderItems  ->  trg_orderitems_after_insert / update / delete
Payments    ->  trg_payments_after_insert / update / delete
```

> `changed_by` is automatically captured using MySQL's `CURRENT_USER()` function inside each trigger — no application code required.

---

## Quick Start

### Prerequisites

| Requirement | Version | Download |
|-------------|---------|----------|
| MySQL / XAMPP | 8.0+ | [apachefriends.org](https://www.apachefriends.org/) |
| Python | 3.8+ | [python.org](https://python.org) |
| Node.js | 16+ | [nodejs.org](https://nodejs.org) |

### Step 1 — Database Setup

> Start MySQL first via XAMPP Control Panel or your MySQL service.

```bash
# Run scripts in order
mysql -u root -p < database/01_schema_and_triggers.sql
mysql -u root -p < database/02_sample_data.sql
```

This creates the `ecommerce_provenance` database, all tables, all 15 triggers, and populates sample data with a rich simulated modification history.

### Step 2 — Backend Setup

```bash
cd backend

# Install dependencies
pip install flask flask-cors mysql-connector-python

# Start the API server
python app.py
```

API running at **http://localhost:5001**

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm start
```

App running at **http://localhost:3000**

---

## Configuration

**Backend** — database credentials in `backend/app.py`:

```python
DB_CONFIG = {
    'host':     'localhost',
    'user':     'root',        # change if needed
    'password': '',            # set your MySQL password
    'database': 'ecommerce_provenance'
}
```

**Frontend** — API base URL in `frontend/src/services/api.jsx`:

```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

---

## API Reference

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/customers` | List all customers |
| `GET` | `/api/customers/:id` | Get a single customer |
| `POST` | `/api/customers` | Create a customer |
| `PUT` | `/api/customers/:id` | Update a customer |
| `DELETE` | `/api/customers/:id` | Delete (cascades to orders) |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Get a single product |
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/:id` | Update a product |
| `DELETE` | `/api/products/:id` | Delete a product |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | List all orders (with customer info) |
| `GET` | `/api/orders/:id` | Get order with its items |
| `POST` | `/api/orders` | Create order with items |
| `PUT` | `/api/orders/:id/status` | Update order status |
| `DELETE` | `/api/orders/:id` | Delete an order |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/payments` | List all payments |
| `POST` | `/api/payments/:order_id` | Create payment for an order |
| `PUT` | `/api/payments/:id/status` | Update payment status |

### Provenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/provenance/products/:id` | Full price & stock history for a product |
| `GET` | `/api/provenance/orders/:id` | Complete status lifecycle for an order |
| `GET` | `/api/provenance/customers/:id` | Change history for a customer |
| `GET` | `/api/provenance/price-changes` | All product price changes system-wide |
| `GET` | `/api/provenance/summary` | Audit record counts per entity type |
| `GET` | `/api/provenance/timeline` | Latest 100 events across all entities |

### Audit Tables (Raw)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/audit/customers` | Raw `Audit_Customers` rows |
| `GET` | `/api/audit/products` | Raw `Audit_Products` rows |
| `GET` | `/api/audit/orders` | Raw `Audit_Orders` rows |
| `GET` | `/api/audit/orderitems` | Raw `Audit_OrderItems` rows |
| `GET` | `/api/audit/payments` | Raw `Audit_Payments` rows |
| `GET` | `/api/audit/deleted` | All DELETE records across entities |
| `GET` | `/api/audit/stats` | INSERT / UPDATE / DELETE totals |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/stats` | Customers, products, orders, revenue & audit record totals |

---

## Provenance Queries

`database/03_provenance_queries.sql` contains **10 ready-to-run SQL queries** demonstrating all three provenance types. Run them directly against `ecommerce_provenance` after loading sample data.

| Query | Type | Description |
|-------|------|-------------|
| Q1 | WHY | Product price history with change justifications |
| Q2 | HOW | Order status evolution with timing between states |
| Q3 | WHERE | User action patterns on the Orders table |
| Q4 | WHY | Customer information change audit trail |
| Q5 | HOW | Price change impact on related orders (data lineage) |
| Q6 | WHERE | Order item source tracking per order |
| Q7 | WHY | Payment status lifecycle with reasons |
| Q8 | HOW | Multi-entity order evolution (Order + Items + Payment) |
| Q9 | WHERE | Temporal activity analysis — when operations occurred |
| Q10 | WHY | Stock level change history per product |
| BONUS | ALL | Combined provenance graph for one complete order |

**Example — WHY Provenance (Q1):**

```sql
SELECT p.name, ap.old_price, ap.new_price,
       ap.price_change_percentage,
       ap.change_timestamp, ap.changed_by, ap.change_reason
FROM Audit_Products ap
JOIN Products p ON ap.product_id = p.product_id
WHERE ap.product_id = 1
  AND (ap.old_price IS NOT NULL OR ap.new_price IS NOT NULL)
ORDER BY ap.change_timestamp;
```

**Example — HOW Provenance (Q2):**

```sql
SELECT COALESCE(ao.old_status, 'N/A') AS From_Status,
       ao.new_status                  AS To_Status,
       ao.change_timestamp,
       TIMESTAMPDIFF(MINUTE,
           LAG(ao.change_timestamp) OVER (ORDER BY ao.change_timestamp),
           ao.change_timestamp
       ) AS Minutes_In_Previous_State
FROM Audit_Orders ao
WHERE ao.order_id = 1
ORDER BY ao.change_timestamp;
```

---

## UI Pages

| Page | Nav Key | Description |
|------|---------|-------------|
| Dashboard | `dashboard` | Stats cards + provenance record bar chart + type explainer |
| Products | `products` | Product table with create/edit/delete + WHY-provenance price history modal |
| Orders | `orders` | Order table with status updater + HOW-provenance lifecycle modal |
| Customers | `customers` | Customer table with create/edit/delete + WHERE-provenance history modal |
| Audit Tables | `audit-tables` | Raw audit table browser with per-table tabs and DELETE record viewer |
| Audit Logs | `provenance` | Price change history + per-entity summary statistics |
| Timeline | `timeline` | Filterable chronological event feed across all entity types |

---

## Known Issues & Notes

> **Duplicate method definitions in `api.jsx`**
>
> `deleteCustomer()` and `deleteProduct()` are each defined twice in the API service. JavaScript silently uses the last declaration so functionality is unaffected — but the duplicates should be cleaned up for clarity.

> **`changed_by` reflects MySQL user, not app user**
>
> Since triggers use `CURRENT_USER()`, the `changed_by` value shows your MySQL login (e.g. `root@localhost`) rather than an application-level username. For production use, pass user context via a MySQL session variable before each operation.

> **`change_reason` is optional**
>
> Audit records will have `NULL` in `change_reason` unless the application explicitly provides one. The current frontend does not send reasons for all operations.

---

<div align="center">

**ProvenanceDB** &nbsp;·&nbsp; *Built for CSE464 — Provenance-Enabled RDBMS*

*Every change leaves a trace. Every trace tells a story.*

</div>