import React, { useState, useEffect } from 'react';
import API from '../../api.js';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { ChevronDown, Loader2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [updating, setUpdating] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  const statusOptions = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['all', 'stripe', 'cod', 'upi', 'netbanking', 'qrcode'];

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentFilter !== 'all' && { payment: paymentFilter })
      });
      
      const { data } = await API.get(`/api/admin/orders?${params}`);
      setOrders(data.orders);
      setPages(data.totalPages);
    } catch (err) {
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await API.put(`/api/admin/orders/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchOrders();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const verifyPayment = async (id) => {
    setUpdating(id);
    try {
      await API.put(`/api/admin/orders/${id}/verify-payment`);
      toast.success('Payment verified and order updated');
      fetchOrders();
    } catch (err) {
      toast.error('Payment verification failed');
    } finally {
      setUpdating(null);
    }
  };

  const getPaymentBadge = (order) => {
    const method = order.paymentMethod;
    const colors = {
      stripe: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cod: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      upi: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      netbanking: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      qrcode: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
        {method.toUpperCase()}
        {order.isPaid && <CheckCircle className="w-3 h-3 inline ml-1" />}
        {!order.isPaid && method !== 'cod' && <Clock className="w-3 h-3 inline ml-1" />}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Orders</h1>
          
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All Status' : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>
                  {method === 'all' ? 'All Payments' : method.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-6 flex justify-center">
              <Loader2 className="animate-spin w-6 h-6" />
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Order ID</th>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-300">Customer</th>
                  <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Total</th>
                  <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">Payment</th>
                  <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">
                      {order.user?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">
                      ₹{order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getPaymentBadge(order)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <select
                          disabled={updating === order._id}
                          value={order.status}
                          onChange={(e) => changeStatus(order._id, e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-600 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {statusOptions.filter(s => s !== 'all').map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>

                        {/* Verify Payment Button for non-COD, non-Stripe orders */}
                        {!order.isPaid && order.paymentMethod !== 'cod' && order.paymentMethod !== 'stripe' && (
                          <button
                            onClick={() => verifyPayment(order._id)}
                            disabled={updating === order._id}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              Prev
            </button>
            <span className="px-2 py-1 text-gray-600 dark:text-gray-400">{page}/{pages}</span>
            <button
              onClick={() => setPage(p => Math.min(p + 1, pages))}
              disabled={page === pages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Order Details - #{viewingOrder._id.slice(-8)}
            </h2>
            
            {/* Order Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer</p>
                  <p className="text-gray-800 dark:text-gray-200">{viewingOrder.user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                  <p className="text-gray-800 dark:text-gray-200">₹{viewingOrder.totalPrice.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment Details */}
              {viewingOrder.paymentMethod === 'upi' && viewingOrder.upiDetails && (
                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">UPI Payment Details</h3>
                  <p><strong>UPI ID:</strong> {viewingOrder.upiDetails.upiId}</p>
                  <p><strong>Transaction ID:</strong> {viewingOrder.upiDetails.transactionId}</p>
                  {viewingOrder.upiDetails.screenshot && (
                    <div className="mt-2">
                      <img 
                        src={viewingOrder.upiDetails.screenshot} 
                        alt="Payment Screenshot" 
                        className="max-w-full h-auto rounded"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Add similar sections for netbanking and qrcode */}
              
              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Order Items</h3>
                <div className="space-y-2">
                  {viewingOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.size} | {item.color} | Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
