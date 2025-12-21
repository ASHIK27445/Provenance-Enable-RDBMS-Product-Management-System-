-- ============================================
-- PROVENANCE QUERIES
-- Demonstrating Why, Where, and How Provenance
-- ============================================

USE ecommerce_provenance;

-- ============================================
-- QUERY 1: WHY-PROVENANCE
-- Why does Product 1 (Laptop) have its current price?
-- Traces all price changes and their justifications
-- ============================================

SELECT 
    'WHY-PROVENANCE: Product Price History' as Query_Type,
    p.name as Product_Name,
    ap.old_price as Previous_Price,
    ap.new_price as Updated_Price,
    ap.price_change_percentage as Change_Percentage,
    ap.change_timestamp as When_Changed,
    ap.changed_by as Changed_By,
    ap.change_reason as Why_Changed
FROM Audit_Products ap
JOIN Products p ON ap.product_id = p.product_id
WHERE ap.product_id = 1
  AND (ap.old_price IS NOT NULL OR ap.new_price IS NOT NULL)
ORDER BY ap.change_timestamp;

-- Expected Output: Shows the complete price history of the Laptop,
-- explaining WHY the current price exists through historical changes

-- ============================================
-- QUERY 2: HOW-PROVENANCE
-- How did Order 1 evolve from creation to delivery?
-- Traces the complete lifecycle and transformations
-- ============================================

SELECT 
    'HOW-PROVENANCE: Order Status Evolution' as Query_Type,
    o.order_id,
    c.name as Customer_Name,
    COALESCE(ao.old_status, 'N/A') as From_Status,
    ao.new_status as To_Status,
    ao.change_timestamp as Transition_Time,
    ao.changed_by as Changed_By,
    ao.change_reason as Transition_Reason,
    TIMESTAMPDIFF(MINUTE, 
        LAG(ao.change_timestamp) OVER (ORDER BY ao.change_timestamp),
        ao.change_timestamp
    ) as Minutes_In_Previous_State
FROM Audit_Orders ao
JOIN Orders o ON ao.order_id = o.order_id
JOIN Customers c ON o.customer_id = c.customer_id
WHERE ao.order_id = 1
ORDER BY ao.change_timestamp;

-- Expected Output: Shows HOW Order 1 progressed through different states
-- (Pending → Processing → Shipped → Delivered) with timing information

-- ============================================
-- QUERY 3: WHERE-PROVENANCE
-- Where did changes to the Orders table come from?
-- Identifies all users and their actions on orders
-- ============================================

SELECT 
    'WHERE-PROVENANCE: User Actions on Orders' as Query_Type,
    changed_by as User_Source,
    operation_type as Action_Type,
    COUNT(*) as Number_of_Actions,
    MIN(change_timestamp) as First_Action,
    MAX(change_timestamp) as Last_Action,
    GROUP_CONCAT(DISTINCT change_reason SEPARATOR '; ') as Action_Reasons
FROM Audit_Orders
GROUP BY changed_by, operation_type
ORDER BY Number_of_Actions DESC, Last_Action DESC;

-- Expected Output: Shows WHERE changes originated (which users performed operations)
-- and their activity patterns on the Orders table

-- ============================================
-- QUERY 4: WHY-PROVENANCE (Customer Perspective)
-- Why was customer information modified?
-- Complete audit trail of customer data changes
-- ============================================

SELECT 
    'WHY-PROVENANCE: Customer Information Changes' as Query_Type,
    c.customer_id,
    c.name as Customer_Name,
    ac.operation_type as Operation,
    CASE 
        WHEN ac.old_name != ac.new_name THEN CONCAT('Name: ', ac.old_name, ' → ', ac.new_name)
        WHEN ac.old_email != ac.new_email THEN CONCAT('Email: ', ac.old_email, ' → ', ac.new_email)
        WHEN ac.old_phone != ac.new_phone THEN CONCAT('Phone: ', ac.old_phone, ' → ', ac.new_phone)
        WHEN ac.old_address != ac.new_address THEN CONCAT('Address: ', LEFT(ac.old_address, 30), '... → ', LEFT(ac.new_address, 30), '...')
        ELSE 'Multiple fields changed'
    END as What_Changed,
    ac.change_timestamp as When_Changed,
    ac.changed_by as Who_Changed,
    ac.change_reason as Why_Changed
FROM Audit_Customers ac
JOIN Customers c ON ac.customer_id = c.customer_id
WHERE ac.customer_id = 1
ORDER BY ac.change_timestamp;

-- Expected Output: Shows WHY and what changes were made to customer information

-- ============================================
-- QUERY 5: HOW-PROVENANCE (Data Lineage)
-- How does a product price change cascade through the system?
-- Traces the impact of product price changes on orders
-- ============================================

SELECT 
    'HOW-PROVENANCE: Price Change Impact Analysis' as Query_Type,
    p.product_id,
    p.name as Product_Name,
    ap.old_price,
    ap.new_price,
    ap.change_timestamp as Price_Changed_At,
    COUNT(DISTINCT oi.order_id) as Affected_Orders_Count,
    GROUP_CONCAT(DISTINCT oi.order_id ORDER BY oi.order_id SEPARATOR ', ') as Affected_Order_IDs,
    SUM(oi.quantity) as Total_Units_In_Affected_Orders
FROM Audit_Products ap
JOIN Products p ON ap.product_id = p.product_id
LEFT JOIN OrderItems oi ON p.product_id = oi.product_id 
    AND oi.order_id IN (
        SELECT order_id FROM Orders 
        WHERE order_date <= ap.change_timestamp
    )
WHERE ap.product_id = 1
  AND ap.old_price IS NOT NULL 
  AND ap.new_price IS NOT NULL
GROUP BY p.product_id, p.name, ap.old_price, ap.new_price, ap.change_timestamp
ORDER BY ap.change_timestamp;

-- Expected Output: Shows HOW product price changes affect related orders,
-- demonstrating data lineage and transformation

-- ============================================
-- QUERY 6: WHERE-PROVENANCE (Data Source Tracking)
-- Where did the order items originate from?
-- Tracks the source of order composition
-- ============================================

SELECT 
    'WHERE-PROVENANCE: Order Items Source Tracking' as Query_Type,
    o.order_id,
    c.name as Customer,
    p.name as Product,
    aoi.operation_type,
    aoi.new_quantity as Quantity_Added,
    aoi.new_unit_price as Price_At_Time,
    aoi.change_timestamp as Added_At,
    aoi.changed_by as Added_By,
    p.category as Product_Category
FROM Audit_OrderItems aoi
JOIN Orders o ON aoi.order_id = o.order_id
JOIN Customers c ON o.customer_id = c.customer_id
JOIN Products p ON aoi.product_id = p.product_id
WHERE aoi.operation_type = 'INSERT'
  AND o.order_id IN (1, 2, 3)
ORDER BY o.order_id, aoi.change_timestamp;

-- Expected Output: Shows WHERE each item in an order came from,
-- tracking the source and context of order composition

-- ============================================
-- QUERY 7: WHY-PROVENANCE (Payment Status)
-- Why did payment statuses change?
-- Complete payment lifecycle tracking
-- ============================================

SELECT 
    'WHY-PROVENANCE: Payment Status Changes' as Query_Type,
    p.payment_id,
    o.order_id,
    c.name as Customer_Name,
    ap.old_status as Previous_Status,
    ap.new_status as Current_Status,
    p.payment_method,
    ap.change_timestamp as Status_Changed_At,
    ap.changed_by as Changed_By,
    ap.change_reason as Why_Changed,
    TIMESTAMPDIFF(MINUTE, p.payment_date, ap.change_timestamp) as Minutes_After_Payment_Initiated
FROM Audit_Payments ap
JOIN Payments p ON ap.payment_id = p.payment_id
JOIN Orders o ON p.order_id = o.order_id
JOIN Customers c ON o.customer_id = c.customer_id
WHERE ap.old_status IS NOT NULL AND ap.new_status IS NOT NULL
ORDER BY ap.change_timestamp;

-- Expected Output: Shows WHY payment statuses changed throughout their lifecycle

-- ============================================
-- QUERY 8: HOW-PROVENANCE (Comprehensive Order Evolution)
-- How did an entire order evolve across all related entities?
-- Complete multi-table provenance tracking
-- ============================================

SELECT 
    'HOW-PROVENANCE: Complete Order Evolution' as Query_Type,
    entity_type,
    operation_type,
    old_status,
    new_status,
    change_timestamp,
    changed_by,
    change_reason,
    TIMESTAMPDIFF(MINUTE, 
        LAG(change_timestamp) OVER (ORDER BY change_timestamp),
        change_timestamp
    ) as Minutes_Since_Last_Change
FROM (
    SELECT 
        'Order' as entity_type,
        operation_type,
        old_status,
        new_status,
        change_timestamp,
        changed_by,
        change_reason
    FROM Audit_Orders
    WHERE order_id = 1
    
    UNION ALL
    
    SELECT 
        'OrderItem' as entity_type,
        operation_type,
        CONCAT('Qty: ', COALESCE(old_quantity, 0)) as old_status,
        CONCAT('Qty: ', COALESCE(new_quantity, 0)) as new_status,
        change_timestamp,
        changed_by,
        change_reason
    FROM Audit_OrderItems
    WHERE order_id = 1
    
    UNION ALL
    
    SELECT 
        'Payment' as entity_type,
        operation_type,
        old_status,
        new_status,
        change_timestamp,
        changed_by,
        change_reason
    FROM Audit_Payments
    WHERE order_id = 1
) combined_audit
ORDER BY change_timestamp;

-- Expected Output: Shows HOW Order 1 evolved across all related entities
-- (Order, OrderItems, Payments) in chronological order

-- ============================================
-- QUERY 9: WHERE-PROVENANCE (Time-based Analysis)
-- Where (when) did most database operations occur?
-- Temporal analysis of data modifications
-- ============================================

SELECT 
    'WHERE-PROVENANCE: Temporal Activity Analysis' as Query_Type,
    DATE(change_timestamp) as Activity_Date,
    HOUR(change_timestamp) as Activity_Hour,
    table_name,
    operation_type,
    COUNT(*) as Operation_Count
FROM (
    SELECT 'Customers' as table_name, operation_type, change_timestamp FROM Audit_Customers
    UNION ALL
    SELECT 'Products', operation_type, change_timestamp FROM Audit_Products
    UNION ALL
    SELECT 'Orders', operation_type, change_timestamp FROM Audit_Orders
    UNION ALL
    SELECT 'OrderItems', operation_type, change_timestamp FROM Audit_OrderItems
    UNION ALL
    SELECT 'Payments', operation_type, change_timestamp FROM Audit_Payments
) all_audits
GROUP BY DATE(change_timestamp), HOUR(change_timestamp), table_name, operation_type
ORDER BY Activity_Date DESC, Activity_Hour DESC, Operation_Count DESC;

-- Expected Output: Shows WHERE in time (temporal patterns) operations occurred

-- ============================================
-- QUERY 10: WHY-PROVENANCE (Stock Level Changes)
-- Why did product stock levels change?
-- Inventory management provenance
-- ============================================

SELECT 
    'WHY-PROVENANCE: Stock Level Changes' as Query_Type,
    p.product_id,
    p.name as Product_Name,
    p.category,
    ap.old_stock_quantity as Previous_Stock,
    ap.new_stock_quantity as New_Stock,
    (ap.new_stock_quantity - ap.old_stock_quantity) as Stock_Change,
    ap.change_timestamp as When_Changed,
    ap.changed_by as Changed_By,
    ap.change_reason as Why_Changed
FROM Audit_Products ap
JOIN Products p ON ap.product_id = p.product_id
WHERE ap.old_stock_quantity IS NOT NULL 
  AND ap.new_stock_quantity IS NOT NULL
  AND ap.old_stock_quantity != ap.new_stock_quantity
ORDER BY ap.change_timestamp DESC;

-- Expected Output: Shows WHY stock levels changed for products

-- ============================================
-- ADVANCED QUERY: Complete Provenance Graph for an Order
-- Combines Why, Where, and How provenance
-- ============================================

SELECT 
    'COMBINED PROVENANCE: Complete Order Journey' as Analysis_Type,
    'Order Details' as Section,
    CONCAT('Order #', o.order_id) as Identifier,
    c.name as Customer,
    o.status as Current_Status,
    o.total_amount as Total_Amount,
    o.order_date as Created_At
FROM Orders o
JOIN Customers c ON o.customer_id = c.customer_id
WHERE o.order_id = 1

UNION ALL

SELECT 
    'COMBINED PROVENANCE',
    'Order History (HOW)',
    CONCAT('Status: ', COALESCE(old_status, 'Created'), ' → ', new_status),
    changed_by,
    CAST(TIMESTAMPDIFF(MINUTE, LAG(change_timestamp) OVER (ORDER BY change_timestamp), change_timestamp) AS CHAR),
    change_reason,
    change_timestamp
FROM Audit_Orders
WHERE order_id = 1

UNION ALL

SELECT 
    'COMBINED PROVENANCE',
    'Items in Order (WHERE)',
    p.name,
    CONCAT('Qty: ', oi.quantity, ' @ $', oi.unit_price),
    CAST(oi.subtotal AS CHAR),
    'Item source',
    NULL
FROM OrderItems oi
JOIN Products p ON oi.product_id = p.product_id
WHERE oi.order_id = 1

UNION ALL

SELECT 
    'COMBINED PROVENANCE',
    'Payment History (WHY)',
    CONCAT('Status: ', COALESCE(old_status, 'Initiated'), ' → ', new_status),
    changed_by,
    CAST(amount AS CHAR),
    change_reason,
    change_timestamp
FROM Audit_Payments ap
JOIN Payments p ON ap.payment_id = p.payment_id
WHERE p.order_id = 1;

-- Expected Output: Complete provenance view combining all three types
-- for a comprehensive understanding of an order's lifecycle

-- ============================================
-- SUMMARY STATISTICS
-- ============================================

SELECT 
    'PROVENANCE SUMMARY STATISTICS' as Report_Type,
    (SELECT COUNT(*) FROM Audit_Customers) as Customer_Changes,
    (SELECT COUNT(*) FROM Audit_Products) as Product_Changes,
    (SELECT COUNT(*) FROM Audit_Orders) as Order_Changes,
    (SELECT COUNT(*) FROM Audit_OrderItems) as OrderItem_Changes,
    (SELECT COUNT(*) FROM Audit_Payments) as Payment_Changes,
    (SELECT COUNT(*) FROM Audit_Customers) + 
    (SELECT COUNT(*) FROM Audit_Products) + 
    (SELECT COUNT(*) FROM Audit_Orders) + 
    (SELECT COUNT(*) FROM Audit_OrderItems) + 
    (SELECT COUNT(*) FROM Audit_Payments) as Total_Audit_Records;

-- ============================================
-- END OF PROVENANCE QUERIES
-- ============================================

/*
PROVENANCE TYPE SUMMARY:

WHY-PROVENANCE (Queries 1, 4, 7, 10):
- Explains the justification for data values
- Answers "Why does this data exist?"
- Examples: Price changes, customer updates, payment status changes

WHERE-PROVENANCE (Queries 3, 6, 9):
- Identifies the source/origin of data
- Answers "Where did this data come from?"
- Examples: User actions, order item sources, temporal patterns

HOW-PROVENANCE (Queries 2, 5, 8):
- Traces data transformation and evolution
- Answers "How did this data evolve?"
- Examples: Order lifecycle, price impact, multi-entity evolution
*/
