-- ============================================
-- CSE464: Provenance-Enabled RDBMS
-- E-Commerce Application Database Schema
-- ============================================

-- Drop existing database if exists
DROP DATABASE IF EXISTS ecommerce_provenance;
CREATE DATABASE ecommerce_provenance;
USE ecommerce_provenance;

-- ============================================
-- CORE TABLES
-- ============================================

-- Customers Table
CREATE TABLE Customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Products Table
CREATE TABLE Products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_price (price)
) ENGINE=InnoDB;

-- Orders Table
CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_address TEXT,
    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id) ON DELETE CASCADE,
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_date (order_date)
) ENGINE=InnoDB;

-- OrderItems Table
CREATE TABLE OrderItems (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- Payments Table
CREATE TABLE Payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('Credit Card', 'Debit Card', 'PayPal', 'Cash') NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================
-- AUDIT/PROVENANCE TABLES
-- ============================================

-- Audit_Customers: Tracks all changes to customer records
CREATE TABLE Audit_Customers (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_name VARCHAR(100),
    new_name VARCHAR(100),
    old_email VARCHAR(100),
    new_email VARCHAR(100),
    old_phone VARCHAR(20),
    new_phone VARCHAR(20),
    old_address TEXT,
    new_address TEXT,
    changed_by VARCHAR(100) DEFAULT USER(),
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason VARCHAR(255),
    INDEX idx_customer (customer_id),
    INDEX idx_timestamp (change_timestamp),
    INDEX idx_operation (operation_type)
) ENGINE=InnoDB;

-- Audit_Products: Tracks product changes (especially price changes)
CREATE TABLE Audit_Products (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_name VARCHAR(200),
    new_name VARCHAR(200),
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2),
    price_change_percentage DECIMAL(5, 2),
    old_stock_quantity INT,
    new_stock_quantity INT,
    old_category VARCHAR(50),
    new_category VARCHAR(50),
    changed_by VARCHAR(100) DEFAULT USER(),
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason VARCHAR(255),
    INDEX idx_product (product_id),
    INDEX idx_timestamp (change_timestamp),
    INDEX idx_operation (operation_type)
) ENGINE=InnoDB;

-- Audit_Orders: Tracks order status changes and modifications
CREATE TABLE Audit_Orders (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    old_total_amount DECIMAL(10, 2),
    new_total_amount DECIMAL(10, 2),
    old_shipping_address TEXT,
    new_shipping_address TEXT,
    changed_by VARCHAR(100) DEFAULT USER(),
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason VARCHAR(255),
    INDEX idx_order (order_id),
    INDEX idx_timestamp (change_timestamp),
    INDEX idx_operation (operation_type),
    INDEX idx_status_change (old_status, new_status)
) ENGINE=InnoDB;

-- Audit_OrderItems: Tracks changes to order items
CREATE TABLE Audit_OrderItems (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    order_item_id INT NOT NULL,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_quantity INT,
    new_quantity INT,
    old_unit_price DECIMAL(10, 2),
    new_unit_price DECIMAL(10, 2),
    changed_by VARCHAR(100) DEFAULT USER(),
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason VARCHAR(255),
    INDEX idx_order_item (order_item_id),
    INDEX idx_order (order_id),
    INDEX idx_timestamp (change_timestamp)
) ENGINE=InnoDB;

-- Audit_Payments: Tracks payment status changes
CREATE TABLE Audit_Payments (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT NOT NULL,
    order_id INT NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    old_amount DECIMAL(10, 2),
    new_amount DECIMAL(10, 2),
    changed_by VARCHAR(100) DEFAULT USER(),
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason VARCHAR(255),
    INDEX idx_payment (payment_id),
    INDEX idx_order (order_id),
    INDEX idx_timestamp (change_timestamp)
) ENGINE=InnoDB;

-- ============================================
-- TRIGGERS FOR PROVENANCE TRACKING
-- ============================================

-- ==================== CUSTOMERS TRIGGERS ====================

DELIMITER $$

-- Trigger: After Insert on Customers
CREATE TRIGGER trg_customers_after_insert
AFTER INSERT ON Customers
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Customers (
        customer_id, operation_type, new_name, new_email, 
        new_phone, new_address, change_reason
    ) VALUES (
        NEW.customer_id, 'INSERT', NEW.name, NEW.email,
        NEW.phone, NEW.address, 'New customer registration'
    );
END$$

-- Trigger: After Update on Customers
CREATE TRIGGER trg_customers_after_update
AFTER UPDATE ON Customers
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Customers (
        customer_id, operation_type,
        old_name, new_name,
        old_email, new_email,
        old_phone, new_phone,
        old_address, new_address,
        change_reason
    ) VALUES (
        NEW.customer_id, 'UPDATE',
        OLD.name, NEW.name,
        OLD.email, NEW.email,
        OLD.phone, NEW.phone,
        OLD.address, NEW.address,
        'Customer information updated'
    );
END$$

-- Trigger: Before Delete on Customers
CREATE TRIGGER trg_customers_before_delete
BEFORE DELETE ON Customers
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Customers (
        customer_id, operation_type,
        old_name, old_email, old_phone, old_address,
        change_reason
    ) VALUES (
        OLD.customer_id, 'DELETE',
        OLD.name, OLD.email, OLD.phone, OLD.address,
        'Customer account deleted'
    );
END$$

-- ==================== PRODUCTS TRIGGERS ====================

-- Trigger: After Insert on Products
CREATE TRIGGER trg_products_after_insert
AFTER INSERT ON Products
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Products (
        product_id, operation_type,
        new_name, new_price, new_stock_quantity, new_category,
        change_reason
    ) VALUES (
        NEW.product_id, 'INSERT',
        NEW.name, NEW.price, NEW.stock_quantity, NEW.category,
        'New product added to catalog'
    );
END$$

-- Trigger: After Update on Products (with price change calculation)
CREATE TRIGGER trg_products_after_update
AFTER UPDATE ON Products
FOR EACH ROW
BEGIN
    DECLARE price_change DECIMAL(5, 2);
    
    -- Calculate price change percentage if price was modified
    IF OLD.price != NEW.price AND OLD.price > 0 THEN
        SET price_change = ((NEW.price - OLD.price) / OLD.price) * 100;
    ELSE
        SET price_change = NULL;
    END IF;
    
    INSERT INTO Audit_Products (
        product_id, operation_type,
        old_name, new_name,
        old_price, new_price,
        price_change_percentage,
        old_stock_quantity, new_stock_quantity,
        old_category, new_category,
        change_reason
    ) VALUES (
        NEW.product_id, 'UPDATE',
        OLD.name, NEW.name,
        OLD.price, NEW.price,
        price_change,
        OLD.stock_quantity, NEW.stock_quantity,
        OLD.category, NEW.category,
        CASE 
            WHEN OLD.price != NEW.price THEN 'Price updated'
            WHEN OLD.stock_quantity != NEW.stock_quantity THEN 'Stock quantity adjusted'
            ELSE 'Product details modified'
        END
    );
END$$

-- Trigger: Before Delete on Products
CREATE TRIGGER trg_products_before_delete
BEFORE DELETE ON Products
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Products (
        product_id, operation_type,
        old_name, old_price, old_stock_quantity, old_category,
        change_reason
    ) VALUES (
        OLD.product_id, 'DELETE',
        OLD.name, OLD.price, OLD.stock_quantity, OLD.category,
        'Product removed from catalog'
    );
END$$

-- ==================== ORDERS TRIGGERS ====================

-- Trigger: After Insert on Orders
CREATE TRIGGER trg_orders_after_insert
AFTER INSERT ON Orders
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Orders (
        order_id, operation_type,
        new_status, new_total_amount, new_shipping_address,
        change_reason
    ) VALUES (
        NEW.order_id, 'INSERT',
        NEW.status, NEW.total_amount, NEW.shipping_address,
        'New order created'
    );
END$$

-- Trigger: After Update on Orders
CREATE TRIGGER trg_orders_after_update
AFTER UPDATE ON Orders
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Orders (
        order_id, operation_type,
        old_status, new_status,
        old_total_amount, new_total_amount,
        old_shipping_address, new_shipping_address,
        change_reason
    ) VALUES (
        NEW.order_id, 'UPDATE',
        OLD.status, NEW.status,
        OLD.total_amount, NEW.total_amount,
        OLD.shipping_address, NEW.shipping_address,
        CASE 
            WHEN OLD.status != NEW.status THEN CONCAT('Status changed from ', OLD.status, ' to ', NEW.status)
            WHEN OLD.total_amount != NEW.total_amount THEN 'Order total updated'
            ELSE 'Order details modified'
        END
    );
END$$

-- Trigger: Before Delete on Orders
CREATE TRIGGER trg_orders_before_delete
BEFORE DELETE ON Orders
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Orders (
        order_id, operation_type,
        old_status, old_total_amount, old_shipping_address,
        change_reason
    ) VALUES (
        OLD.order_id, 'DELETE',
        OLD.status, OLD.total_amount, OLD.shipping_address,
        'Order deleted'
    );
END$$

-- ==================== ORDER ITEMS TRIGGERS ====================

-- Trigger: After Insert on OrderItems
CREATE TRIGGER trg_orderitems_after_insert
AFTER INSERT ON OrderItems
FOR EACH ROW
BEGIN
    INSERT INTO Audit_OrderItems (
        order_item_id, order_id, product_id, operation_type,
        new_quantity, new_unit_price,
        change_reason
    ) VALUES (
        NEW.order_item_id, NEW.order_id, NEW.product_id, 'INSERT',
        NEW.quantity, NEW.unit_price,
        'Item added to order'
    );
    
    -- Update order total
    UPDATE Orders 
    SET total_amount = (
        SELECT SUM(subtotal) FROM OrderItems WHERE order_id = NEW.order_id
    )
    WHERE order_id = NEW.order_id;
END$$

-- Trigger: After Update on OrderItems
CREATE TRIGGER trg_orderitems_after_update
AFTER UPDATE ON OrderItems
FOR EACH ROW
BEGIN
    INSERT INTO Audit_OrderItems (
        order_item_id, order_id, product_id, operation_type,
        old_quantity, new_quantity,
        old_unit_price, new_unit_price,
        change_reason
    ) VALUES (
        NEW.order_item_id, NEW.order_id, NEW.product_id, 'UPDATE',
        OLD.quantity, NEW.quantity,
        OLD.unit_price, NEW.unit_price,
        'Order item quantity or price modified'
    );
    
    -- Update order total
    UPDATE Orders 
    SET total_amount = (
        SELECT SUM(subtotal) FROM OrderItems WHERE order_id = NEW.order_id
    )
    WHERE order_id = NEW.order_id;
END$$

-- Trigger: Before Delete on OrderItems
CREATE TRIGGER trg_orderitems_before_delete
BEFORE DELETE ON OrderItems
FOR EACH ROW
BEGIN
    INSERT INTO Audit_OrderItems (
        order_item_id, order_id, product_id, operation_type,
        old_quantity, old_unit_price,
        change_reason
    ) VALUES (
        OLD.order_item_id, OLD.order_id, OLD.product_id, 'DELETE',
        OLD.quantity, OLD.unit_price,
        'Item removed from order'
    );
END$$

-- Trigger: After Delete on OrderItems (Update order total)
CREATE TRIGGER trg_orderitems_after_delete
AFTER DELETE ON OrderItems
FOR EACH ROW
BEGIN
    UPDATE Orders 
    SET total_amount = COALESCE((
        SELECT SUM(subtotal) FROM OrderItems WHERE order_id = OLD.order_id
    ), 0)
    WHERE order_id = OLD.order_id;
END$$

-- ==================== PAYMENTS TRIGGERS ====================

-- Trigger: After Insert on Payments
CREATE TRIGGER trg_payments_after_insert
AFTER INSERT ON Payments
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Payments (
        payment_id, order_id, operation_type,
        new_status, new_amount,
        change_reason
    ) VALUES (
        NEW.payment_id, NEW.order_id, 'INSERT',
        NEW.status, NEW.amount,
        'Payment initiated'
    );
END$$

-- Trigger: After Update on Payments
CREATE TRIGGER trg_payments_after_update
AFTER UPDATE ON Payments
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Payments (
        payment_id, order_id, operation_type,
        old_status, new_status,
        old_amount, new_amount,
        change_reason
    ) VALUES (
        NEW.payment_id, NEW.order_id, 'UPDATE',
        OLD.status, NEW.status,
        OLD.amount, NEW.amount,
        CASE 
            WHEN OLD.status != NEW.status THEN CONCAT('Payment status changed from ', OLD.status, ' to ', NEW.status)
            ELSE 'Payment details modified'
        END
    );
END$$

-- Trigger: Before Delete on Payments
CREATE TRIGGER trg_payments_before_delete
BEFORE DELETE ON Payments
FOR EACH ROW
BEGIN
    INSERT INTO Audit_Payments (
        payment_id, order_id, operation_type,
        old_status, old_amount,
        change_reason
    ) VALUES (
        OLD.payment_id, OLD.order_id, 'DELETE',
        OLD.status, OLD.amount,
        'Payment record deleted'
    );
END$$

DELIMITER ;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER $$

-- Procedure: Get complete provenance history for a specific order
CREATE PROCEDURE sp_get_order_provenance(IN p_order_id INT)
BEGIN
    SELECT 
        'Order' as entity_type,
        audit_id,
        order_id as entity_id,
        operation_type,
        old_status,
        new_status,
        changed_by,
        change_timestamp,
        change_reason
    FROM Audit_Orders
    WHERE order_id = p_order_id
    
    UNION ALL
    
    SELECT 
        'OrderItem' as entity_type,
        audit_id,
        order_item_id as entity_id,
        operation_type,
        CAST(old_quantity AS CHAR) as old_status,
        CAST(new_quantity AS CHAR) as new_status,
        changed_by,
        change_timestamp,
        change_reason
    FROM Audit_OrderItems
    WHERE order_id = p_order_id
    
    UNION ALL
    
    SELECT 
        'Payment' as entity_type,
        audit_id,
        payment_id as entity_id,
        operation_type,
        old_status,
        new_status,
        changed_by,
        change_timestamp,
        change_reason
    FROM Audit_Payments
    WHERE order_id = p_order_id
    
    ORDER BY change_timestamp;
END$$

-- Procedure: Get product price history
CREATE PROCEDURE sp_get_product_price_history(IN p_product_id INT)
BEGIN
    SELECT 
        audit_id,
        product_id,
        operation_type,
        old_price,
        new_price,
        price_change_percentage,
        changed_by,
        change_timestamp,
        change_reason
    FROM Audit_Products
    WHERE product_id = p_product_id
    AND (old_price IS NOT NULL OR new_price IS NOT NULL)
    ORDER BY change_timestamp;
END$$

-- Procedure: Get all actions by a specific user
CREATE PROCEDURE sp_get_user_actions(IN p_username VARCHAR(100))
BEGIN
    SELECT 'Customers' as table_name, operation_type, change_timestamp, change_reason
    FROM Audit_Customers WHERE changed_by = p_username
    UNION ALL
    SELECT 'Products', operation_type, change_timestamp, change_reason
    FROM Audit_Products WHERE changed_by = p_username
    UNION ALL
    SELECT 'Orders', operation_type, change_timestamp, change_reason
    FROM Audit_Orders WHERE changed_by = p_username
    UNION ALL
    SELECT 'OrderItems', operation_type, change_timestamp, change_reason
    FROM Audit_OrderItems WHERE changed_by = p_username
    UNION ALL
    SELECT 'Payments', operation_type, change_timestamp, change_reason
    FROM Audit_Payments WHERE changed_by = p_username
    ORDER BY change_timestamp DESC;
END$$

DELIMITER ;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional indexes for audit tables to improve query performance
CREATE INDEX idx_audit_customers_timestamp ON Audit_Customers(change_timestamp);
CREATE INDEX idx_audit_products_timestamp ON Audit_Products(change_timestamp);
CREATE INDEX idx_audit_orders_timestamp ON Audit_Orders(change_timestamp);
CREATE INDEX idx_audit_orderitems_timestamp ON Audit_OrderItems(change_timestamp);
CREATE INDEX idx_audit_payments_timestamp ON Audit_Payments(change_timestamp);

-- ============================================
-- VIEWS FOR COMMON PROVENANCE QUERIES
-- ============================================

-- View: Recent price changes across all products
CREATE VIEW vw_recent_price_changes AS
SELECT 
    p.product_id,
    p.name as product_name,
    ap.old_price,
    ap.new_price,
    ap.price_change_percentage,
    ap.changed_by,
    ap.change_timestamp
FROM Audit_Products ap
JOIN Products p ON ap.product_id = p.product_id
WHERE ap.old_price IS NOT NULL 
  AND ap.new_price IS NOT NULL
  AND ap.old_price != ap.new_price
ORDER BY ap.change_timestamp DESC;

-- View: Order status transition history
CREATE VIEW vw_order_status_history AS
SELECT 
    o.order_id,
    c.name as customer_name,
    ao.old_status,
    ao.new_status,
    ao.change_timestamp,
    ao.changed_by,
    ao.change_reason
FROM Audit_Orders ao
JOIN Orders o ON ao.order_id = o.order_id
JOIN Customers c ON o.customer_id = c.customer_id
WHERE ao.old_status IS NOT NULL AND ao.new_status IS NOT NULL
ORDER BY ao.change_timestamp DESC;

-- View: Complete audit trail summary
CREATE VIEW vw_audit_summary AS
SELECT 
    DATE(change_timestamp) as audit_date,
    'Customers' as table_name,
    operation_type,
    COUNT(*) as operation_count
FROM Audit_Customers
GROUP BY DATE(change_timestamp), operation_type
UNION ALL
SELECT 
    DATE(change_timestamp),
    'Products',
    operation_type,
    COUNT(*)
FROM Audit_Products
GROUP BY DATE(change_timestamp), operation_type
UNION ALL
SELECT 
    DATE(change_timestamp),
    'Orders',
    operation_type,
    COUNT(*)
FROM Audit_Orders
GROUP BY DATE(change_timestamp), operation_type
UNION ALL
SELECT 
    DATE(change_timestamp),
    'OrderItems',
    operation_type,
    COUNT(*)
FROM Audit_OrderItems
GROUP BY DATE(change_timestamp), operation_type
UNION ALL
SELECT 
    DATE(change_timestamp),
    'Payments',
    operation_type,
    COUNT(*)
FROM Audit_Payments
GROUP BY DATE(change_timestamp), operation_type
ORDER BY audit_date DESC, table_name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 'Database schema created successfully!' as Status,
       'All tables, triggers, procedures, and views are ready.' as Message;


