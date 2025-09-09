import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const DonationSuccess: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDonationStatus = async () => {
      try {
        // Get query parameters
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('sessionId');
        const status = params.get('status');
        
        if (!sessionId) {
          setError('Missing session ID');
          setLoading(false);
          return;
        }

        // Use environment variable or fallback to localhost
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // Try to find the donation by sessionId
        let donationData = null;
        
        // 1. Try sessionId first
        if (sessionId) {
          try {
            const sessionResponse = await axios.get(`${API_URL}/api/donations?sessionId=${sessionId}`);
            if (sessionResponse.data.success && sessionResponse.data.data.length > 0) {
              donationData = sessionResponse.data.data[0];
            }
          } catch (error) {
            console.log('sessionId query failed, trying all donations...');
          }
        }
        
        // 2. If not found, get all donations and search manually
        if (!donationData && sessionId) {
          try {
            const allResponse = await axios.get(`${API_URL}/api/donations`);
            if (allResponse.data.success && allResponse.data.data) {
              donationData = allResponse.data.data.find((d: any) => 
                d.sessionId === sessionId ||
                (d.sessionId && d.sessionId.includes(sessionId))
              );
            }
          } catch (error) {
            console.log('All donations query failed');
          }
        }
        
        if (donationData) {
          setDonation(donationData);
        } else {
          setError('Donation not found');
        }
      } catch (error) {
        console.error('Error fetching donation:', error);
        setError('Failed to fetch donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonationStatus();
  }, [location]);

  const handleBackToDonate = () => {
    navigate('/#donate');
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-lg">
              <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Verifying your donation...</p>
            </div>
          ) : error ? (
            <motion.div 
              className="text-center p-8 bg-white rounded-xl shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 text-red-500">
                <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4">Something Went Wrong</h3>
              <p className="text-lg text-gray-600 mb-6">{error}</p>
              <motion.button
                onClick={handleBackToDonate}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : donation ? (
            <motion.div
              className="text-center p-8 bg-white rounded-xl shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`mb-6 ${donation.paymentStatus === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                {donation.paymentStatus === 'completed' ? (
                  <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              <h3 className="text-2xl font-display font-semibold mb-4">
                {donation.paymentStatus === 'completed' 
                  ? 'Thank You For Your Donation!' 
                  : donation.paymentStatus === 'pending'
                    ? 'Your Donation is Being Processed'
                    : 'Donation Payment Failed'}
              </h3>
              
              <p className="text-lg text-gray-600 mb-4">
                {donation.paymentStatus === 'completed' 
                  ? 'Your generosity helps us make a real difference. We\'ve sent a receipt to your email.'
                  : donation.paymentStatus === 'pending'
                    ? 'Your donation is being processed. We\'ll send you an email once it\'s confirmed.'
                    : 'There was an issue processing your donation. Please try again or contact support.'}
              </p>
              
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  Payment Method: <span className="capitalize">{donation.paymentMethod.replace('_', ' ')}</span>
                </p>
                <p className="text-blue-800 font-medium mt-1">
                  Amount: ${donation.amount}
                </p>
                <p className="text-blue-800 font-medium mt-1">
                  Frequency: {donation.paymentType === 'one-time' ? 'One-time donation' : 'Monthly donation'}
                </p>
                <p className="text-blue-800 font-medium mt-1">
                  Status: <span className="capitalize">{donation.paymentStatus}</span>
                </p>
                {donation.transactionId && (
                  <p className="text-blue-800 font-medium mt-1">
                    Transaction ID: <span className="font-mono text-sm">{donation.transactionId}</span>
                  </p>
                )}
              </div>
              
              <motion.button
                onClick={handleBackToDonate}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {donation.paymentStatus === 'completed' ? 'Make Another Donation' : 'Return to Donation Page'}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center p-8 bg-white rounded-xl shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-6 text-yellow-500">
                <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-semibold mb-4">No Donation Found</h3>
              <p className="text-lg text-gray-600 mb-6">We couldn't find any donation information. Please try making a donation again.</p>
              <motion.button
                onClick={handleBackToDonate}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Make a Donation
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DonationSuccess;