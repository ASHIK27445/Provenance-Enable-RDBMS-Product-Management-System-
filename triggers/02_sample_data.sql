-- ============================================
-- Sample Data for E-Commerce Provenance System
-- ============================================

USE ecommerce_provenance;

-- ============================================
-- INSERT SAMPLE CUSTOMERS
-- ============================================

INSERT INTO Customers (name, email, phone, address) VALUES
('John Doe', 'john.doe@email.com', '+1-555-0101', '123 Main St, New York, NY 10001'),
('Jane Smith', 'jane.smith@email.com', '+1-555-0102', '456 Oak Ave, Los Angeles, CA 90001'),
('Robert Johnson', 'robert.j@email.com', '+1-555-0103', '789 Pine Rd, Chicago, IL 60601'),
('Emily Davis', 'emily.davis@email.com', '+1-555-0104', '321 Elm St, Houston, TX 77001'),
('Michael Brown', 'michael.b@email.com', '+1-555-0105', '654 Maple Dr, Phoenix, AZ 85001'),
('Sarah Wilson', 'sarah.w@email.com', '+1-555-0106', '987 Cedar Ln, Philadelphia, PA 19019'),
('David Martinez', 'david.m@email.com', '+1-555-0107', '147 Birch Ct, San Antonio, TX 78201'),
('Lisa Anderson', 'lisa.a@email.com', '+1-555-0108', '258 Spruce Way, San Diego, CA 92101'),
('James Taylor', 'james.t@email.com', '+1-555-0109', '369 Willow Pl, Dallas, TX 75201'),
('Maria Garcia', 'maria.g@email.com', '+1-555-0110', '741 Ash Blvd, San Jose, CA 95101');

-- ============================================
-- INSERT SAMPLE PRODUCTS
-- ============================================

INSERT INTO Products (name, description, price, stock_quantity, category) VALUES
('Laptop Pro 15"', 'High-performance laptop with 16GB RAM and 512GB SSD', 1299.99, 50, 'Electronics'),
('Wireless Mouse', 'Ergonomic wireless mouse with precision tracking', 29.99, 200, 'Electronics'),
('USB-C Hub', '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader', 49.99, 150, 'Electronics'),
('Mechanical Keyboard', 'RGB mechanical keyboard with blue switches', 89.99, 100, 'Electronics'),
('27" Monitor', '4K UHD monitor with 144Hz refresh rate', 399.99, 75, 'Electronics'),
('Webcam HD', '1080p HD webcam with built-in microphone', 79.99, 120, 'Electronics'),
('Office Chair', 'Ergonomic office chair with lumbar support', 249.99, 60, 'Furniture'),
('Standing Desk', 'Adjustable height standing desk', 449.99, 40, 'Furniture'),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 39.99, 180, 'Furniture'),
('Bookshelf', '5-tier wooden bookshelf', 129.99, 35, 'Furniture'),
('Coffee Maker', '12-cup programmable coffee maker', 79.99, 90, 'Appliances'),
('Blender', 'High-speed blender with 1000W motor', 99.99, 70, 'Appliances'),
('Microwave', '1.1 cu ft microwave oven', 149.99, 45, 'Appliances'),
('Air Purifier', 'HEPA air purifier for large rooms', 199.99, 55, 'Appliances'),
('Vacuum Cleaner', 'Cordless stick vacuum with 60min runtime', 299.99, 40, 'Appliances');

-- ============================================
-- INSERT SAMPLE ORDERS
-- ============================================

INSERT INTO Orders (customer_id, order_date, status, shipping_address) VALUES
(1, '2024-11-01 10:30:00', 'Delivered', '123 Main St, New York, NY 10001'),
(2, '2024-11-02 14:15:00', 'Delivered', '456 Oak Ave, Los Angeles, CA 90001'),
(3, '2024-11-03 09:45:00', 'Shipped', '789 Pine Rd, Chicago, IL 60601'),
(4, '2024-11-04 16:20:00', 'Processing', '321 Elm St, Houston, TX 77001'),
(5, '2024-11-05 11:00:00', 'Pending', '654 Maple Dr, Phoenix, AZ 85001'),
(1, '2024-11-10 13:30:00', 'Processing', '123 Main St, New York, NY 10001'),
(6, '2024-11-12 10:00:00', 'Shipped', '987 Cedar Ln, Philadelphia, PA 19019'),
(7, '2024-11-15 15:45:00', 'Delivered', '147 Birch Ct, San Antonio, TX 78201'),
(8, '2024-11-18 09:30:00', 'Processing', '258 Spruce Way, San Diego, CA 92101'),
(9, '2024-11-20 14:00:00', 'Pending', '369 Willow Pl, Dallas, TX 75201');

-- ============================================
-- INSERT SAMPLE ORDER ITEMS
-- ============================================

-- Order 1 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 1299.99),
(1, 2, 2, 29.99),
(1, 3, 1, 49.99);

-- Order 2 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(2, 5, 1, 399.99),
(2, 4, 1, 89.99),
(2, 6, 1, 79.99);

-- Order 3 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(3, 7, 2, 249.99),
(3, 9, 2, 39.99);

-- Order 4 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(4, 11, 1, 79.99),
(4, 12, 1, 99.99),
(4, 13, 1, 149.99);

-- Order 5 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(5, 14, 1, 199.99),
(5, 15, 1, 299.99);

-- Order 6 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(6, 1, 1, 1299.99),
(6, 4, 1, 89.99);

-- Order 7 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(7, 8, 1, 449.99),
(7, 7, 1, 249.99);

-- Order 8 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(8, 2, 3, 29.99),
(8, 3, 2, 49.99);

-- Order 9 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(9, 10, 2, 129.99),
(9, 9, 1, 39.99);

-- Order 10 items
INSERT INTO OrderItems (order_id, product_id, quantity, unit_price) VALUES
(10, 15, 1, 299.99),
(10, 14, 1, 199.99);

-- ============================================
-- INSERT SAMPLE PAYMENTS
-- ============================================

INSERT INTO Payments (order_id, amount, payment_method, payment_date, status, transaction_id) VALUES
(1, 1409.96, 'Credit Card', '2024-11-01 10:35:00', 'Completed', 'TXN-2024110100001'),
(2, 569.97, 'PayPal', '2024-11-02 14:20:00', 'Completed', 'TXN-2024110200001'),
(3, 579.96, 'Debit Card', '2024-11-03 09:50:00', 'Completed', 'TXN-2024110300001'),
(4, 329.97, 'Credit Card', '2024-11-04 16:25:00', 'Completed', 'TXN-2024110400001'),
(5, 499.98, 'Credit Card', '2024-11-05 11:05:00', 'Pending', 'TXN-2024110500001'),
(6, 1389.98, 'PayPal', '2024-11-10 13:35:00', 'Completed', 'TXN-2024111000001'),
(7, 699.98, 'Credit Card', '2024-11-12 10:05:00', 'Completed', 'TXN-2024111200001'),
(8, 189.95, 'Debit Card', '2024-11-18 09:35:00', 'Completed', 'TXN-2024111800001'),
(9, 299.97, 'Credit Card', '2024-11-20 14:05:00', 'Pending', 'TXN-2024112000001');

-- ============================================
-- SIMULATE DATA MODIFICATIONS TO CREATE PROVENANCE HISTORY
-- ============================================

-- Simulate product price changes
UPDATE Products SET price = 1199.99 WHERE product_id = 1; -- Laptop price reduced
UPDATE Products SET price = 34.99 WHERE product_id = 2;   -- Mouse price increased
UPDATE Products SET price = 379.99 WHERE product_id = 5;  -- Monitor price reduced

-- Simulate order status changes
UPDATE Orders SET status = 'Processing' WHERE order_id = 1;
UPDATE Orders SET status = 'Shipped' WHERE order_id = 1;
UPDATE Orders SET status = 'Delivered' WHERE order_id = 1;

UPDATE Orders SET status = 'Processing' WHERE order_id = 2;
UPDATE Orders SET status = 'Shipped' WHERE order_id = 2;
UPDATE Orders SET status = 'Delivered' WHERE order_id = 2;

UPDATE Orders SET status = 'Shipped' WHERE order_id = 3;

UPDATE Orders SET status = 'Processing' WHERE order_id = 4;

-- Simulate stock quantity changes
UPDATE Products SET stock_quantity = 45 WHERE product_id = 1;  -- Laptop sold
UPDATE Products SET stock_quantity = 195 WHERE product_id = 2; -- Mouse sold
UPDATE Products SET stock_quantity = 70 WHERE product_id = 5;  -- Monitor sold

-- Simulate customer information updates
UPDATE Customers SET phone = '+1-555-0199' WHERE customer_id = 1;
UPDATE Customers SET address = '123 Main St, Apt 5B, New York, NY 10001' WHERE customer_id = 1;

-- Simulate payment status changes
UPDATE Payments SET status = 'Completed' WHERE payment_id = 5;

-- More price adjustments to create rich history
UPDATE Products SET price = 1249.99 WHERE product_id = 1; -- Laptop price back up
UPDATE Products SET price = 44.99 WHERE product_id = 3;   -- Hub price reduced

-- Additional order status progression
UPDATE Orders SET status = 'Processing' WHERE order_id = 6;
UPDATE Orders SET status = 'Shipped' WHERE order_id = 7;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show summary of records created
SELECT 'Customers' as Table_Name, COUNT(*) as Record_Count FROM Customers
UNION ALL
SELECT 'Products', COUNT(*) FROM Products
UNION ALL
SELECT 'Orders', COUNT(*) FROM Orders
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM OrderItems
UNION ALL
SELECT 'Payments', COUNT(*) FROM Payments
UNION ALL
SELECT '---Audit Tables---', NULL
UNION ALL
SELECT 'Audit_Customers', COUNT(*) FROM Audit_Customers
UNION ALL
SELECT 'Audit_Products', COUNT(*) FROM Audit_Products
UNION ALL
SELECT 'Audit_Orders', COUNT(*) FROM Audit_Orders
UNION ALL
SELECT 'Audit_OrderItems', COUNT(*) FROM Audit_OrderItems
UNION ALL
SELECT 'Audit_Payments', COUNT(*) FROM Audit_Payments;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 'Sample data inserted successfully!' as Status,
       'Database is now populated with test data and provenance history.' as Message;
