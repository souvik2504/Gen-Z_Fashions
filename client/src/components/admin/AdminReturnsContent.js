import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Truck,
  RefreshCw,
  User,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  RotateCcw
} from 'lucide-react';

const AdminReturnsContent= () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [returnStats, setReturnStats] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundMethod, setRefundMethod] = useState('original_payment');
  const [transactionId, setTransactionId] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const returnStatuses = [
    { value: 'requested', label: 'Requested', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'pickup_scheduled', label: 'Pickup Scheduled', color: 'bg-purple-100 text-purple-800' },
    { value: 'picked_up', label: 'Picked Up', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'refund_processing', label: 'Refund Processing', color: 'bg-orange-100 text-orange-800' },
    { value: 'refund_completed', label: 'Refund Completed', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    fetchReturns();
  }, [currentPage, statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/returns', {
        params: {
          page: currentPage,
          status: statusFilter,
          limit: 10
        }
      });
      
      setReturns(response.data.returns);
      setTotalPages(response.data.totalPages);
      setReturnStats(response.data.returnStats);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (returnOrder) => {
    try {
      const response = await axios.get(`/api/admin/orders/${returnOrder._id}/return-details`);
      setSelectedReturn(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching return details:', error);
      toast.error('Failed to load return details');
    }
  };

  const handleStatusUpdate = (returnOrder) => {
    setSelectedReturn(returnOrder);
    setNewStatus(returnOrder.returnStatus);
    setStatusNotes('');
    setShowStatusModal(true);
  };

  const handleRefundProcess = (returnOrder) => {
    setSelectedReturn(returnOrder);
    setRefundAmount(returnOrder.totalPrice);
    setRefundMethod('original_payment');
    setTransactionId('');
    setRefundNotes('');
    setShowRefundModal(true);
  };

  const updateReturnStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    setUpdating(true);
    try {
      await axios.put(`/api/admin/orders/${selectedReturn._id}/return-status`, {
        returnStatus: newStatus,
        notes: statusNotes
      });

      toast.success('Return status updated successfully');
      setShowStatusModal(false);
      fetchReturns();
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const processRefund = async () => {
    if (!refundAmount || refundAmount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    setUpdating(true);
    try {
      await axios.put(`/api/admin/orders/${selectedReturn._id}/process-refund`, {
        refundAmount: parseFloat(refundAmount),
        refundMethod,
        transactionId,
        notes: refundNotes
      });

      toast.success('Refund initiated successfully');
      setShowRefundModal(false);
      fetchReturns();
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error(error.response?.data?.message || 'Failed to process refund');
    } finally {
      setUpdating(false);
    }
  };

  const completeRefund = async (orderId) => {
    const transactionId = prompt('Enter transaction ID (optional):');
    const notes = prompt('Enter completion notes (optional):');

    try {
      await axios.put(`/api/admin/orders/${orderId}/complete-refund`, {
        transactionId,
        notes
      });

      toast.success('Refund completed successfully');
      fetchReturns();
    } catch (error) {
      console.error('Error completing refund:', error);
      toast.error(error.response?.data?.message || 'Failed to complete refund');
    }
  };

  const getStatusColor = (status) => {
    const statusObj = returnStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const statusObj = returnStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Returns & Refunds
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer return requests and process refunds
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {returnStats.map((stat) => (
          <div key={stat._id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {getStatusLabel(stat._id)}
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {stat.count}
                </p>
              </div>
              <RotateCcw className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Returns</option>
              {returnStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Loading returns...</span>
            </div>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No returns found</h3>
            <p className="text-gray-500 dark:text-gray-400">No return requests match your current filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Return Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {returns.map((returnOrder) => (
                    <tr key={returnOrder._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            #{returnOrder._id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {returnOrder.orderItems.length} item{returnOrder.orderItems.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {returnOrder.returnReason}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {returnOrder.user.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {returnOrder.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(returnOrder.returnStatus)}`}>
                            {getStatusLabel(returnOrder.returnStatus)}
                          </span>
                          {returnOrder.refundStatus && (
                            <div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Refund: {returnOrder.refundStatus}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            ₹{returnOrder.totalPrice.toFixed(2)}
                          </p>
                          {returnOrder.refundAmount && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Refund: ₹{returnOrder.refundAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(returnOrder.returnRequestedAt).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(returnOrder.returnRequestedAt).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(returnOrder)}
                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(returnOrder)}
                            className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          {returnOrder.returnStatus === 'picked_up' && !returnOrder.refundAmount && (
                            <button
                              onClick={() => handleRefundProcess(returnOrder)}
                              className="p-2 text-purple-600 hover:text-purple-900 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-colors"
                              title="Process Refund"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                          {returnOrder.refundStatus === 'processing' && (
                            <button
                              onClick={() => completeRefund(returnOrder._id)}
                              className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                              title="Complete Refund"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Update Return Status
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {returnStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this status update..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateReturnStatus}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Process Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Process Refund
              </h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Refund Amount
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={selectedReturn?.totalPrice}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: ₹{selectedReturn?.totalPrice.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Refund Method
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="original_payment">Original Payment Method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="wallet">Wallet Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter transaction ID if available"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this refund..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processRefund}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {updating ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedReturn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Return Details - #{selectedReturn.order._id.slice(-8)}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Name:</span>
                    <p className="text-gray-900 dark:text-white">{selectedReturn.order.user.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <p className="text-gray-900 dark:text-white">{selectedReturn.order.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Return Information */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Return Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Reason:</span>
                    <p className="text-gray-900 dark:text-white">{selectedReturn.returnInfo.reason}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Details:</span>
                    <p className="text-gray-900 dark:text-white">{selectedReturn.returnInfo.details}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReturn.returnInfo.status)}`}>
                      {getStatusLabel(selectedReturn.returnInfo.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedReturn.order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <img
                        src={item.image || '/placeholder-tshirt.jpg'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => { e.target.src = '/placeholder-tshirt.jpg'; }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.size} | {item.color} | Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund Information */}
              {selectedReturn.refundInfo.amount && (
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Refund Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                      <p className="text-gray-900 dark:text-white">₹{selectedReturn.refundInfo.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Method:</span>
                      <p className="text-gray-900 dark:text-white capitalize">{selectedReturn.refundInfo.method?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <p className="text-gray-900 dark:text-white capitalize">{selectedReturn.refundInfo.status}</p>
                    </div>
                    {selectedReturn.refundInfo.transactionId && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                        <p className="text-gray-900 dark:text-white">{selectedReturn.refundInfo.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturnsContent;
