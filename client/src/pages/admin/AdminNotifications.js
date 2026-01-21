import React, { useState, useEffect } from 'react';
import API from '../../api.js';
import AdminLayout from '../../components/admin/AdminLayout';
import Loader from '../../components/Loader';
import {
  Bell,
  Users,
  Package,
  CheckCircle,
  Clock,
  Trash2,
  Send,
  TrendingUp,
} from 'lucide-react';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pending: 0,
    readyToNotify: 0,
    sent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await API.get('/api/admin/notifications', {
        params: { status: filter },
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
      // Compute stats for cards
      setStats({
        totalRequests: response.data.notifications.reduce((sum, n) => sum + n.totalSubscribers, 0),
        pending: response.data.notifications.reduce((sum, n) => sum + n.pendingSubscribers, 0),
        readyToNotify: response.data.notifications.filter(n => n.canNotify).length,
        sent: response.data.notifications.reduce((sum, n) => sum + n.notifiedSubscribers, 0),
      });
    } catch (err) {
      setNotifications([]);
    }
    setLoading(false);
  };

  const handleSend = async (notificationId) => {
    if (!window.confirm('Send notification emails to all pending subscribers for this variant?')) return;
    setSendingId(notificationId);
    try {
      const token = localStorage.getItem('token');
      await API.post(`/api/admin/notifications/${notificationId}/notify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
      alert('Notifications sent!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to send notifications');
    }
    setSendingId(null);
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Delete this notification entry?')) return;
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/api/admin/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      alert('Failed to delete notification');
    }
  };

  // Style for table rows (mimicking AdminDashboard's light look)
  const getStatusBadge = n => {
    if (n.pendingSubscribers === 0) {
      return <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs">All Notified</span>;
    } else if (n.isInStock) {
      return <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs">Ready to Notify</span>;
    } else {
      return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">Out of Stock</span>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center min-h-96 justify-center">
          <Loader />
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">Loading notification requests...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notify Items</h1>
          <p className="text-gray-600">See and manage customer "Notify Me" requests (by variant).</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Requests"
            value={stats.totalRequests}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Pending Notifications"
            value={stats.pending}
            icon={Clock}
            color="bg-orange-500"
          />
          <StatCard
            title="Ready to Notify"
            value={stats.readyToNotify}
            icon={Bell}
            color="bg-green-500"
          />
          <StatCard
            title="Sent Notifications"
            value={stats.sent}
            icon={CheckCircle}
            color="bg-purple-500"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="notified">Already Notified</option>
          </select>
        </div>

        {/* Notifications List/Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No notification requests found.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Variant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Notified</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {notifications.map((n) => (
                  <tr key={n._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          className="w-12 h-12 rounded-lg object-cover mr-4 border"
                          src={n.product.image}
                          alt={n.product.name}
                          onError={e => e.target.src = '/placeholder-tshirt.jpg'}
                        />
                        <div>
                          <div className="font-medium">{n.product.name}</div>
                          <div className="text-xs text-gray-500">ID: {n.product._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center">
                        <span className="px-2 py-1 text-sm rounded bg-gray-100 mr-2">{n.color}</span>
                        <span className="px-2 py-1 text-sm rounded bg-gray-100">{n.size}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {n.currentStock > 0 ?
                        <span className="text-green-600 font-bold">{n.currentStock} in stock</span>
                        :
                        <span className="text-red-500">Out of stock</span>
                      }
                    </td>
                    <td className="px-6 py-4">{n.pendingSubscribers}</td>
                    <td className="px-6 py-4">{n.notifiedSubscribers}</td>
                    <td className="px-6 py-4">{getStatusBadge(n)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex space-x-2">
                        {n.canNotify && (
                          <button
                            className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs disabled:opacity-50"
                            onClick={() => handleSend(n._id)}
                            disabled={sendingId === n._id}
                            title="Notify all subscribers"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            {sendingId === n._id ? 'Sending...' : 'Notify'}
                          </button>
                        )}
                        <button
                          className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                          onClick={() => handleDelete(n._id)}
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
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
    </AdminLayout>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default AdminNotifications;
