import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Gift, Copy, CheckCircle, Shirt } from 'lucide-react';
import API from '../api.js';
// import { Shirt } from 'lucide-react';

const MAX_STAMPS = 10;

const LoyaltyCardModal = ({ isOpen, onClose }) => {
  const [loyaltyData, setLoyaltyData] = useState({
    stamps: 0,
    cyclesCompleted: 0,
    loyaltyLevel: 'Bronze',
    claimedCoupons: []
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null); // coupon code & description on claim

  useEffect(() => {
    if (isOpen) {
      fetchLoyaltyStatus();
      setClaimResult(null);
    }
  }, [isOpen]);

  const fetchLoyaltyStatus = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/loyalty/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLoyaltyData(response.data);
    } catch (error) {
      toast.error('Failed to load loyalty status');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (loyaltyData.stamps < MAX_STAMPS) {
      toast.error(`You need ${MAX_STAMPS} stamps to claim a surprise`);
      return;
    }

    setClaiming(true);
    try {
      const response = await API.post('/api/loyalty/claim', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setClaimResult(response.data.coupon);
      setLoyaltyData(prev => ({
        ...prev,
        stamps: 0,
        cyclesCompleted: response.data.cyclesCompleted,
        loyaltyLevel: response.data.loyaltyLevel,
        claimedCoupons: [...prev.claimedCoupons, response.data.coupon]
      }));

      toast.success('Surprise claimed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to claim surprise');
    } finally {
      setClaiming(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard!');
  };

  const renderShirtIcons = () => {
    const icons = [];
    for (let i = 0; i < MAX_STAMPS; i++) {
      const filled = i < loyaltyData.stamps;
      icons.push(
        <svg
          key={i}
          className={`w-10 h-10 mx-1 ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M10 3v2m4-2v2M5.343 6.343l1.414 1.414M16.243 7.05l1.414-1.415M16 21l-4 0-4-4-0-4 4 0 4 4z" />
        </svg>
      );
    }
    return icons;
  };

  return !isOpen ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full relative text-gray-900 dark:text-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <Gift className="w-6 h-6 text-yellow-400" />
          <span>Loyalty Card</span>
        </h2>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="flex flex-wrap max-w-xs justify-center">
                {renderShirtIcons()}
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg">Progress: {loyaltyData.stamps} / {MAX_STAMPS}</span>
              <span className="font-semibold text-lg">Level: {loyaltyData.loyaltyLevel}</span>
            </div>

            <div className="mb-4">
              <span className="block mb-1 font-medium">Cycles Completed:</span>
              <span>{loyaltyData.cyclesCompleted}</span>
            </div>

            {loyaltyData.stamps === MAX_STAMPS ? (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg py-2 font-semibold text-black"
              >
                {claiming ? 'Claiming...' : 'Claim Surprise'}
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 dark:bg-gray-700 rounded-lg py-2 font-semibold text-gray-500 cursor-not-allowed"
              >
                Collect {MAX_STAMPS - loyaltyData.stamps} more t-shirts to claim
              </button>
            )}

            {/* Show coupon if claimed */}
            {claimResult && (
              <div className="mt-6 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded p-4 text-center">
                <p className="mb-2 font-semibold">You unlocked: {claimResult.description}</p>
                <div className="flex justify-center items-center space-x-2">
                  <code className="bg-white dark:bg-gray-800 rounded px-3 py-1 font-mono tracking-widest select-all">
                    {claimResult.code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(claimResult.code)}
                    title="Copy coupon code"
                    className="text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-400"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="mt-1 text-sm">Expires on: {new Date(claimResult.expiresAt).toLocaleDateString()}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoyaltyCardModal;
