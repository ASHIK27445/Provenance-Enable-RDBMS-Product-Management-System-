from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from datetime import datetime, date
from decimal import Decimal
import json

app = Flask(__name__)
CORS(app)


DB_CONFIG = {
    'host': 'localhost',
    'user': 'root', 
    'password': '',  
    'database': 'ecommerce_provenance'
}


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super(CustomJSONEncoder, self).default(obj)

app.json_encoder = CustomJSONEncoder

# Database connection helper
def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Helper function to execute queries
def execute_query(query, params=None, fetch=True):
    connection = get_db_connection()
    if not connection:
        return None
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())
        
        if fetch:
            result = cursor.fetchall()
            # Convert Decimal and datetime objects
            for row in result:
                for key, value in row.items():
                    if isinstance(value, Decimal):
                        row[key] = float(value)
                    elif isinstance(value, (datetime, date)):
                        row[key] = value.isoformat()
            return result
        else:
            connection.commit()
            return cursor.lastrowid
    except Error as e:
        print(f"Error executing query: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

# ============================================
# CUSTOMER ENDPOINTS
# ============================================

@app.route('/api/customers', methods=['GET'])
def get_customers():
    query = "SELECT * FROM Customers ORDER BY created_at DESC"
    customers = execute_query(query)
    return jsonify(customers if customers else [])

@app.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    query = "SELECT * FROM Customers WHERE customer_id = %s"
    customer = execute_query(query, (customer_id,))
    return jsonify(customer[0] if customer else {})

@app.route('/api/customers', methods=['POST'])
def create_customer():
    data = request.json
    query = """
        INSERT INTO Customers (name, email, phone, address)
        VALUES (%s, %s, %s, %s)
    """
    customer_id = execute_query(
        query,
        (data['name'], data['email'], data.get('phone'), data.get('address')),
        fetch=False
    )
    return jsonify({'customer_id': customer_id, 'message': 'Customer created successfully'})

@app.route('/api/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    data = request.json
    query = """
        UPDATE Customers 
        SET name = %s, email = %s, phone = %s, address = %s
        WHERE customer_id = %s
    """
    execute_query(
        query,
        (data['name'], data['email'], data.get('phone'), data.get('address'), customer_id),
        fetch=False
    )
    return jsonify({'message': 'Customer updated successfully'})

@app.route('/api/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    query = "DELETE FROM Customers WHERE customer_id = %s"
    execute_query(query, (customer_id,), fetch=False)
    return jsonify({'message': 'Customer deleted successfully'})

# ============================================
# PRODUCT ENDPOINTS
# ============================================

@app.route('/api/products', methods=['GET'])
def get_products():
    query = "SELECT * FROM Products ORDER BY created_at DESC"
    products = execute_query(query)
    return jsonify(products if products else [])

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    query = "SELECT * FROM Products WHERE product_id = %s"
    product = execute_query(query, (product_id,))
    return jsonify(product[0] if product else {})

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json
    query = """
        INSERT INTO Products (name, description, price, stock_quantity, category)
        VALUES (%s, %s, %s, %s, %s)
    """
    product_id = execute_query(
        query,
        (data['name'], data.get('description'), data['price'], 
         data.get('stock_quantity', 0), data.get('category')),
        fetch=False
    )
    return jsonify({'product_id': product_id, 'message': 'Product created successfully'})

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    query = """
        UPDATE Products 
        SET name = %s, description = %s, price = %s, 
            stock_quantity = %s, category = %s
        WHERE product_id = %s
    """
    execute_query(
        query,
        (data['name'], data.get('description'), data['price'],
         data.get('stock_quantity'), data.get('category'), product_id),
        fetch=False
    )
    return jsonify({'message': 'Product updated successfully'})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    query = "DELETE FROM Products WHERE product_id = %s"
    execute_query(query, (product_id,), fetch=False)
    return jsonify({'message': 'Product deleted successfully'})

# ============================================
# ORDER ENDPOINTS
# ============================================

@app.route('/api/orders', methods=['GET'])
def get_orders():
    query = """
        SELECT o.*, c.name as customer_name, c.email as customer_email
        FROM Orders o
        JOIN Customers c ON o.customer_id = c.customer_id
        ORDER BY o.order_date DESC
    """
    orders = execute_query(query)
    return jsonify(orders if orders else [])

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    query = """
        SELECT o.*, c.name as customer_name, c.email as customer_email
        FROM Orders o
        JOIN Customers c ON o.customer_id = c.customer_id
        WHERE o.order_id = %s
    """
    order = execute_query(query, (order_id,))
    
    if order:
        # Get order items
        items_query = """
            SELECT oi.*, p.name as product_name, p.category
            FROM OrderItems oi
            JOIN Products p ON oi.product_id = p.product_id
            WHERE oi.order_id = %s
        """
        items = execute_query(items_query, (order_id,))
        order[0]['items'] = items
        
        return jsonify(order[0])
    return jsonify({})

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    
    # Create order
    order_query = """
        INSERT INTO Orders (customer_id, status, shipping_address)
        VALUES (%s, %s, %s)
    """
    order_id = execute_query(
        order_query,
        (data['customer_id'], data.get('status', 'Pending'), data.get('shipping_address')),
        fetch=False
    )
    
    # Add order items
    if 'items' in data:
        for item in data['items']:
            item_query = """
                INSERT INTO OrderItems (order_id, product_id, quantity, unit_price)
                VALUES (%s, %s, %s, %s)
            """
            execute_query(
                item_query,
                (order_id, item['product_id'], item['quantity'], item['unit_price']),
                fetch=False
            )
    
    return jsonify({'order_id': order_id, 'message': 'Order created successfully'})

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    data = request.json
    query = "UPDATE Orders SET status = %s WHERE order_id = %s"
    execute_query(query, (data['status'], order_id), fetch=False)
    return jsonify({'message': 'Order status updated successfully'})

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    query = "DELETE FROM Orders WHERE order_id = %s"
    execute_query(query, (order_id,), fetch=False)
    return jsonify({'message': 'Order deleted successfully'})

# ============================================
# PAYMENT ENDPOINTS
# ============================================

@app.route('/api/payments', methods=['GET'])
def get_payments():
    query = """
        SELECT p.*, o.customer_id, c.name as customer_name
        FROM Payments p
        JOIN Orders o ON p.order_id = o.order_id
        JOIN Customers c ON o.customer_id = c.customer_id
        ORDER BY p.payment_date DESC
    """
    payments = execute_query(query)
    return jsonify(payments if payments else [])

@app.route('/api/payments/<int:order_id>', methods=['POST'])
def create_payment(order_id):
    data = request.json
    query = """
        INSERT INTO Payments (order_id, amount, payment_method, status, transaction_id)
        VALUES (%s, %s, %s, %s, %s)
    """
    payment_id = execute_query(
        query,
        (order_id, data['amount'], data['payment_method'], 
         data.get('status', 'Pending'), data.get('transaction_id')),
        fetch=False
    )
    return jsonify({'payment_id': payment_id, 'message': 'Payment created successfully'})

@app.route('/api/payments/<int:payment_id>/status', methods=['PUT'])
def update_payment_status(payment_id):
    data = request.json
    query = "UPDATE Payments SET status = %s WHERE payment_id = %s"
    execute_query(query, (data['status'], payment_id), fetch=False)
    return jsonify({'message': 'Payment status updated successfully'})

# ============================================
# PROVENANCE ENDPOINTS
# ============================================

@app.route('/api/provenance/products/<int:product_id>', methods=['GET'])
def get_product_provenance(product_id):
    """Get complete provenance history for a product (WHY-provenance)"""
    query = """
        SELECT * FROM Audit_Products
        WHERE product_id = %s
        ORDER BY change_timestamp DESC
    """
    history = execute_query(query, (product_id,))
    return jsonify(history if history else [])

@app.route('/api/provenance/orders/<int:order_id>', methods=['GET'])
def get_order_provenance(order_id):
    """Get complete provenance history for an order (HOW-provenance)"""
    query = """
        SELECT 
            'Order' as entity_type,
            audit_id,
            order_id as entity_id,
            operation_type,
            old_status,
            new_status,
            old_total_amount,
            new_total_amount,
            changed_by,
            change_timestamp,
            change_reason
        FROM Audit_Orders
        WHERE order_id = %s
        
        UNION ALL
        
        SELECT 
            'OrderItem' as entity_type,
            audit_id,
            order_item_id as entity_id,
            operation_type,
            CAST(old_quantity AS CHAR) as old_status,
            CAST(new_quantity AS CHAR) as new_status,
            old_unit_price as old_total_amount,
            new_unit_price as new_total_amount,
            changed_by,
            change_timestamp,
            change_reason
        FROM Audit_OrderItems
        WHERE order_id = %s
        
        UNION ALL
        
        SELECT 
            'Payment' as entity_type,
            audit_id,
            payment_id as entity_id,
            operation_type,
            old_status,
            new_status,
            old_amount as old_total_amount,
            new_amount as new_total_amount,
            changed_by,
            change_timestamp,
            change_reason
        FROM Audit_Payments
        WHERE order_id = %s
        
        ORDER BY change_timestamp
    """
    history = execute_query(query, (order_id, order_id, order_id))
    return jsonify(history if history else [])

@app.route('/api/provenance/customers/<int:customer_id>', methods=['GET'])
def get_customer_provenance(customer_id):
    """Get complete provenance history for a customer"""
    query = """
        SELECT * FROM Audit_Customers
        WHERE customer_id = %s
        ORDER BY change_timestamp DESC
    """
    history = execute_query(query, (customer_id,))
    return jsonify(history if history else [])

@app.route('/api/provenance/user/<username>', methods=['GET'])
def get_user_actions(username):
    """Get all actions performed by a user (WHERE-provenance)"""
    query = """
        SELECT 'Customers' as table_name, operation_type, change_timestamp, change_reason
        FROM Audit_Customers WHERE changed_by = %s
        UNION ALL
        SELECT 'Products', operation_type, change_timestamp, change_reason
        FROM Audit_Products WHERE changed_by = %s
        UNION ALL
        SELECT 'Orders', operation_type, change_timestamp, change_reason
        FROM Audit_Orders WHERE changed_by = %s
        UNION ALL
        SELECT 'OrderItems', operation_type, change_timestamp, change_reason
        FROM Audit_OrderItems WHERE changed_by = %s
        UNION ALL
        SELECT 'Payments', operation_type, change_timestamp, change_reason
        FROM Audit_Payments WHERE changed_by = %s
        ORDER BY change_timestamp DESC
    """
    actions = execute_query(query, (username, username, username, username, username))
    return jsonify(actions if actions else [])

@app.route('/api/provenance/price-changes', methods=['GET'])
def get_price_changes():
    """Get all product price changes (WHY-provenance)"""
    query = """
        SELECT 
            p.product_id,
            p.name as product_name,
            ap.old_price,
            ap.new_price,
            ap.price_change_percentage,
            ap.changed_by,
            ap.change_timestamp,
            ap.change_reason
        FROM Audit_Products ap
        JOIN Products p ON ap.product_id = p.product_id
        WHERE ap.old_price IS NOT NULL 
          AND ap.new_price IS NOT NULL
          AND ap.old_price != ap.new_price
        ORDER BY ap.change_timestamp DESC
    """
    changes = execute_query(query)
    return jsonify(changes if changes else [])

@app.route('/api/provenance/summary', methods=['GET'])
def get_provenance_summary():
    """Get summary statistics of all provenance data"""
    query = """
        SELECT 
            'Customers' as table_name,
            COUNT(*) as total_changes,
            COUNT(DISTINCT customer_id) as unique_entities,
            MAX(change_timestamp) as last_change
        FROM Audit_Customers
        UNION ALL
        SELECT 
            'Products',
            COUNT(*),
            COUNT(DISTINCT product_id),
            MAX(change_timestamp)
        FROM Audit_Products
        UNION ALL
        SELECT 
            'Orders',
            COUNT(*),
            COUNT(DISTINCT order_id),
            MAX(change_timestamp)
        FROM Audit_Orders
        UNION ALL
        SELECT 
            'OrderItems',
            COUNT(*),
            COUNT(DISTINCT order_item_id),
            MAX(change_timestamp)
        FROM Audit_OrderItems
        UNION ALL
        SELECT 
            'Payments',
            COUNT(*),
            COUNT(DISTINCT payment_id),
            MAX(change_timestamp)
        FROM Audit_Payments
    """
    summary = execute_query(query)
    return jsonify(summary if summary else [])

@app.route('/api/provenance/timeline', methods=['GET'])
def get_provenance_timeline():
    """Get chronological timeline of all changes"""
    query = """
        SELECT 
            'Customer' as entity_type,
            customer_id as entity_id,
            operation_type,
            change_timestamp,
            changed_by,
            change_reason
        FROM Audit_Customers
        UNION ALL
        SELECT 
            'Product',
            product_id,
            operation_type,
            change_timestamp,
            changed_by,
            change_reason
        FROM Audit_Products
        UNION ALL
        SELECT 
            'Order',
            order_id,
            operation_type,
            change_timestamp,
            changed_by,
            change_reason
        FROM Audit_Orders
        UNION ALL
        SELECT 
            'OrderItem',
            order_item_id,
            operation_type,
            change_timestamp,
            changed_by,
            change_reason
        FROM Audit_OrderItems
        UNION ALL
        SELECT 
            'Payment',
            payment_id,
            operation_type,
            change_timestamp,
            changed_by,
            change_reason
        FROM Audit_Payments
        ORDER BY change_timestamp DESC
        LIMIT 100
    """
    timeline = execute_query(query)
    return jsonify(timeline if timeline else [])

# ============================================
# DASHBOARD ENDPOINTS
# ============================================

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get overall statistics for dashboard"""
    stats_query = """
        SELECT 
            (SELECT COUNT(*) FROM Customers) as total_customers,
            (SELECT COUNT(*) FROM Products) as total_products,
            (SELECT COUNT(*) FROM Orders) as total_orders,
            (SELECT SUM(total_amount) FROM Orders) as total_revenue,
            (SELECT COUNT(*) FROM Audit_Customers) + 
            (SELECT COUNT(*) FROM Audit_Products) + 
            (SELECT COUNT(*) FROM Audit_Orders) + 
            (SELECT COUNT(*) FROM Audit_OrderItems) + 
            (SELECT COUNT(*) FROM Audit_Payments) as total_audit_records
    """
    stats = execute_query(stats_query)
    return jsonify(stats[0] if stats else {})

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# app.py তে এগুলো add করুন

@app.route('/api/audit/customers', methods=['GET'])
def get_audit_customers():
    query = "SELECT * FROM Audit_Customers ORDER BY change_timestamp DESC"
    result = execute_query(query)
    return jsonify(result if result else [])

@app.route('/api/audit/products', methods=['GET'])
def get_audit_products():
    query = "SELECT * FROM Audit_Products ORDER BY change_timestamp DESC"
    result = execute_query(query)
    return jsonify(result if result else [])

@app.route('/api/audit/orders', methods=['GET'])
def get_audit_orders():
    query = "SELECT * FROM Audit_Orders ORDER BY change_timestamp DESC"
    result = execute_query(query)
    return jsonify(result if result else [])

@app.route('/api/audit/orderitems', methods=['GET'])
def get_audit_orderitems():
    query = "SELECT * FROM Audit_OrderItems ORDER BY change_timestamp DESC"
    result = execute_query(query)
    return jsonify(result if result else [])

@app.route('/api/audit/payments', methods=['GET'])
def get_audit_payments():
    query = "SELECT * FROM Audit_Payments ORDER BY change_timestamp DESC"
    result = execute_query(query)
    return jsonify(result if result else [])

@app.route('/api/audit/deleted', methods=['GET'])
def get_deleted_records():
    query = """
        SELECT 'Customer' as entity_type, customer_id as entity_id, 
               old_name, old_email, NULL as old_price, NULL as old_status, 
               NULL as old_total_amount, changed_by, change_timestamp, change_reason
        FROM Audit_Customers WHERE operation_type = 'DELETE'
        UNION ALL
        SELECT 'Product', product_id, old_name, NULL, old_price, NULL, NULL,
               changed_by, change_timestamp, change_reason
        FROM Audit_Products WHERE operation_type = 'DELETE'
        UNION ALL
        SELECT 'Order', order_id, NULL, NULL, NULL, old_status, old_total_amount,
               changed_by, change_timestamp, change_reason
        FROM Audit_Orders WHERE operation_type = 'DELETE'
        UNION ALL
        SELECT 'Payment', payment_id, NULL, NULL, NULL, old_status, old_amount,
               changed_by, change_timestamp, change_reason
        FROM Audit_Payments WHERE operation_type = 'DELETE'
        ORDER BY change_timestamp DESC
    """
    result = execute_query(query)
    return jsonify(result if result else [])

@app.route('/api/audit/stats', methods=['GET'])
def get_audit_stats():
    query = """
        SELECT 
            (SELECT COUNT(*) FROM Audit_Customers) + 
            (SELECT COUNT(*) FROM Audit_Products) + 
            (SELECT COUNT(*) FROM Audit_Orders) + 
            (SELECT COUNT(*) FROM Audit_OrderItems) + 
            (SELECT COUNT(*) FROM Audit_Payments) as total_audits,
            
            (SELECT COUNT(*) FROM Audit_Customers WHERE operation_type = 'INSERT') + 
            (SELECT COUNT(*) FROM Audit_Products WHERE operation_type = 'INSERT') + 
            (SELECT COUNT(*) FROM Audit_Orders WHERE operation_type = 'INSERT') + 
            (SELECT COUNT(*) FROM Audit_OrderItems WHERE operation_type = 'INSERT') + 
            (SELECT COUNT(*) FROM Audit_Payments WHERE operation_type = 'INSERT') as total_inserts,
            
            (SELECT COUNT(*) FROM Audit_Customers WHERE operation_type = 'UPDATE') + 
            (SELECT COUNT(*) FROM Audit_Products WHERE operation_type = 'UPDATE') + 
            (SELECT COUNT(*) FROM Audit_Orders WHERE operation_type = 'UPDATE') + 
            (SELECT COUNT(*) FROM Audit_OrderItems WHERE operation_type = 'UPDATE') + 
            (SELECT COUNT(*) FROM Audit_Payments WHERE operation_type = 'UPDATE') as total_updates,
            
            (SELECT COUNT(*) FROM Audit_Customers WHERE operation_type = 'DELETE') + 
            (SELECT COUNT(*) FROM Audit_Products WHERE operation_type = 'DELETE') + 
            (SELECT COUNT(*) FROM Audit_Orders WHERE operation_type = 'DELETE') + 
            (SELECT COUNT(*) FROM Audit_OrderItems WHERE operation_type = 'DELETE') + 
            (SELECT COUNT(*) FROM Audit_Payments WHERE operation_type = 'DELETE') as total_deletes,
            
            (SELECT COUNT(*) FROM Audit_Customers) as customers_count,
            (SELECT COUNT(*) FROM Audit_Products) as products_count,
            (SELECT COUNT(*) FROM Audit_Orders) as orders_count,
            (SELECT COUNT(*) FROM Audit_OrderItems) as orderitems_count,
            (SELECT COUNT(*) FROM Audit_Payments) as payments_count
    """
    result = execute_query(query)
    return jsonify(result[0] if result else {})


# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5001")
    print("Make sure XAMPP MySQL is running!")
    app.run(debug=True, host='0.0.0.0', port=5001)