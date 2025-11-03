import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import api from '../utils/api';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all'); // all, pending, processing, shipped, delivered
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    stock: '',
    category: 'electronics',
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else {
      fetchStats();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/orders/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        alert('Product updated successfully!');
      } else {
        await api.post('/products', formData);
        alert('Product created successfully!');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        stock: '',
        category: 'electronics',
      });
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save product');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image,
      stock: product.stock,
      category: product.category || 'electronics',
    });
    setShowProductForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await api.delete(`/products/${id}`);
      alert('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      alert('Order status updated successfully!');
      fetchOrders();
      fetchStats(); // Refresh stats
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Filter orders by status
  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === orderFilter);

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="flex space-x-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 ${
              activeTab === 'products'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 ${
              activeTab === 'orders'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Orders
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    ${stats?.stats.totalSales.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats?.stats.totalOrders || 0}
                  </p>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              <div className="space-y-2">
                {stats?.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">{order.user.name}</p>
                      <p className="text-sm text-gray-600">{order.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.totalPrice.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Product Management</h2>
              <button
                onClick={() => {
                  setShowProductForm(true);
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: '',
                    image: '',
                    stock: '',
                    category: 'electronics',
                  });
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Product
              </button>
            </div>

            {showProductForm && (
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-lg border-2 border-blue-200 p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Stock</label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        required
                        className="w-full border rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Image URL <span className="text-gray-500 text-xs">(optional - default will be used if empty)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="Leave empty for default category image"
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing & Apparel</option>
                      <option value="home">Home & Kitchen</option>
                      <option value="books">Books</option>
                      <option value="sports">Sports & Fitness</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submitLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          {editingProduct ? '✅ Update Product' : '✨ Create Product'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                      disabled={submitLoading}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found</p>
                  <button
                    onClick={() => {
                      setShowProductForm(true);
                      setEditingProduct(null);
                      setFormData({
                        name: '',
                        description: '',
                        price: '',
                        image: '',
                        stock: '',
                        category: 'electronics',
                      });
                    }}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Image</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Price</th>
                      <th className="px-4 py-3 text-left">Stock</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {product.category || 'electronics'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.stock > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Received Orders</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    orderFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('pending')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    orderFilter === 'pending'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Pending ({orders.filter(o => o.status === 'pending').length})
                </button>
                <button
                  onClick={() => setOrderFilter('processing')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    orderFilter === 'processing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Processing ({orders.filter(o => o.status === 'processing').length})
                </button>
                <button
                  onClick={() => setOrderFilter('shipped')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    orderFilter === 'shipped'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Shipped ({orders.filter(o => o.status === 'shipped').length})
                </button>
                <button
                  onClick={() => setOrderFilter('delivered')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    orderFilter === 'delivered'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Delivered ({orders.filter(o => o.status === 'delivered').length})
                </button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="text-lg">Loading orders...</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500 text-lg">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md border-l-4 border-blue-500 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Customer:</span> {order.user.name}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span> {order.user.email}
                          </div>
                          <div>
                            <span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {new Date(order.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-3xl font-bold text-blue-600 mb-2">
                          ${order.totalPrice.toFixed(2)}
                        </p>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Update Status:
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order.id, e.target.value)
                          }
                          className="border-2 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-bold text-lg mb-3 text-gray-800">Order Items ({order.orderItems.length}):</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {order.orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                              <p className="text-sm font-semibold text-blue-600">
                                Subtotal: ${(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Admin;

