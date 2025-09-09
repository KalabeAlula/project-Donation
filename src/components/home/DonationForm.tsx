import React, { useState } from 'react';
import { motion } from 'framer-motion';
import donationService, { DonationData } from '../../services/donationService';

const donationAmounts = [25, 50, 100, 250, 500];

const DonationForm: React.FC = () => {
  const [amount, setAmount] = useState<number | null>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isDonationComplete, setIsDonationComplete] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<string>('one-time');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [showBankDetails, setShowBankDetails] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [arifpayCheckoutUrl, setArifpayCheckoutUrl] = useState<string>('');
  const [donationData, setDonationData] = useState<any>(null);
  
  const handleAmountClick = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };
  
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
      setAmount(value ? parseInt(value) : null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && amount > 0 && name && email) {
      setIsSubmitting(true);
      setError('');
      
      const donationData: DonationData = {
        name,
        email,
        amount,
        paymentType,
        paymentMethod: paymentMethod === 'credit_card' ? 'arifpay' : paymentMethod, // Ensure 'credit_card' is sent as 'arifpay'
        isCompany: false
      };
      
      console.log('Submitting donation data:', donationData);
      
      try {
        const response = await donationService.createDonation(donationData);
        console.log('Full donation response:', response);
        console.log('Raw checkout_url:', response.data?.checkout_url);
        
        if (response.data?.checkout_url) {
          // Clean the checkout_url to remove any extra characters
          const cleanCheckoutUrl = response.data.checkout_url
            .toString()
            .replace(/[`\s]/g, '')
            .trim();
          
          console.log('Cleaned checkout_url:', cleanCheckoutUrl);
          setArifpayCheckoutUrl(cleanCheckoutUrl);
          setDonationData(response.data);
          
          // Try multiple redirect methods to handle browser security
          try {
            // Method 1: Direct redirect
            window.location.href = cleanCheckoutUrl;
          } catch (redirectError) {
            console.error('Direct redirect failed:', redirectError);
            try {
              // Method 2: Open in new tab
              window.open(cleanCheckoutUrl, '_blank');
            } catch (tabError) {
              console.error('New tab failed:', tabError);
              // Method 3: Show manual redirect link
              setError(`Redirect failed. Please click this link to complete payment: ${cleanCheckoutUrl}`);
            }
          }
        } else if (response.data.success) {
          console.log('Payment method:', paymentMethod);
          console.log('Checkout URL exists:', !!response.data.data.checkout_url);
          
          if (paymentMethod === 'credit_card' && response.data.data.checkout_url) {
            // For ArifPay payments, redirect to checkout URL
            const cleanCheckoutUrl = response.data.data.checkout_url.trim();
            console.log('Redirecting to ArifPay checkout:', cleanCheckoutUrl);
            
            // Use window.location.replace for better redirect handling
            window.location.replace(cleanCheckoutUrl);
            return; // Exit early to prevent showing completion screen
          } else {
            // For other payment methods, show completion screen
            console.log('Showing completion screen for non-ArifPay payment');
            setDonationData(response.data.data);
            setIsDonationComplete(true);
          }
        } else {
          setError('There was a problem processing your donation. Please try again.');
        }
      } catch (error) {
        console.error('Error submitting donation:', error);
        setError('There was a problem connecting to the server. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const resetForm = () => {
    setAmount(50);
    setCustomAmount('');
    setName('');
    setEmail('');
    setPaymentMethod('credit_card');
    setShowBankDetails(false);
    setIsDonationComplete(false);
    setArifpayCheckoutUrl('');
    setDonationData(null);
    setError('');
  };
  
  // Ethiopian bank account details
  const bankAccounts = [
    {
      name: 'Commercial Bank of Ethiopia',
      accountNumber: '1000656272035'
    },
    {
      name: 'United Bank',
      accountNumber: '1370414274379017'
    }
  ];

  return (
    <section id="donate" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Make Your Donation Today
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Your generosity powers our mission. Choose a cause that resonates with you and make a difference with your contribution.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-12 items-center">
          {/* Donation Form */}
          <div className="w-full max-w-2xl mx-auto">
            {!isDonationComplete ? (
              <motion.form 
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-display font-semibold mb-6">Choose Donation Amount</h3>
                
                {/* Donation Amount Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {donationAmounts.map((value) => (
                    <motion.button
                      key={value}
                      type="button"
                      className={`py-3 rounded-lg font-medium text-lg transition-colors ${amount === value && customAmount === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => handleAmountClick(value)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {value}
                    </motion.button>
                  ))}
                  
                  <div className="col-span-3 mt-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Custom Amount"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        className={`w-full py-3 px-4 border ${customAmount !== '' ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                      />
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email Input */}
                <div className="mb-8">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                
                {/* Donation Frequency removed as requested */}
                
                {/* Payment Method */}
                <div className="mb-8">
                  <h3 className="text-xl font-display font-semibold mb-4">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      className={`py-3 px-4 rounded-lg font-medium ${paymentMethod === 'credit_card' ? 'bg-primary-50 text-primary-800 border border-primary-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setPaymentMethod('credit_card');
                        setShowBankDetails(false);
                      }}
                    >
                      ArifPay
                    </motion.button>
                    <motion.button
                      type="button"
                      className={`py-3 px-4 rounded-lg font-medium ${paymentMethod === 'bank_transfer' ? 'bg-primary-50 text-primary-800 border border-primary-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setPaymentMethod('bank_transfer');
                        setShowBankDetails(true);
                      }}
                    >
                      Bank Transfer
                    </motion.button>
                  </div>
                  
                  {/* Bank Account Details */}
                  {showBankDetails && (
                    <motion.div 
                      className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">Bank Account Details</h4>
                      <p className="text-sm text-gray-600 mb-3">Please transfer your donation to one of the following bank accounts:</p>
                      
                      <div className="space-y-3">
                        {bankAccounts.map((bank, index) => (
                          <div key={index} className="p-3 bg-white rounded-md border border-gray-200">
                            <p className="font-medium text-gray-800">{bank.name}</p>
                            <p className="text-gray-600">Account Number: <span className="font-mono font-medium">{bank.accountNumber}</span></p>
                          </div>
                        ))}
                      </div>
                      
                      <p className="mt-3 text-sm text-gray-600">
                        After completing your transfer, Please note that you can ask us about any question about the foundation though our email or Phone number.
                      </p>
                    </motion.div>
                  )}
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">
                    {error}
                  </div>
                )}
                
                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className={`w-full py-4 ${isSubmitting ? 'bg-gray-400' : 'bg-primary-600 hover:bg-green-600'} text-white font-medium text-lg rounded-full transition-colors flex items-center justify-center`}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  disabled={!amount || amount <= 0 || !name || !email || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>Donate {amount || 0}</>
                  )}
                </motion.button>
                
                <p className="mt-4 text-sm text-gray-500 text-center">
                  All donations are secure and encrypted. By donating, you agree to our terms and privacy policy.
                </p>
              </motion.form>
            ) : (
              <motion.div
                className="bg-white p-8 rounded-xl shadow-lg text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6 text-green-500">
                  <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-display font-semibold mb-4">Thank You For Your Donation!</h3>
                <p className="text-lg text-gray-600 mb-4">
                  Your generosity helps us make a real difference. We've sent a receipt to your email.
                </p>
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    Payment Method: <span className="capitalize">{donationData?.paymentMethod?.replace('_', ' ') || paymentMethod.replace('_', ' ')}</span>
                  </p>
                  <p className="text-blue-800 font-medium mt-1">
                    Amount: {donationData?.amount || amount}
                  </p>
                  <p className="text-blue-800 font-medium mt-1">
                    Frequency: {(donationData?.paymentType || paymentType) === 'one-time' ? 'One-time donation' : 'Monthly donation'}
                  </p>
                  
                  {(donationData?.paymentMethod || paymentMethod) === 'bank_transfer' && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-blue-800 font-medium mb-2">Bank Transfer Details:</p>
                      <div className="space-y-2">
                        {bankAccounts.map((bank, index) => (
                          <div key={index} className="p-2 bg-white rounded-md border border-blue-100">
                            <p className="font-medium text-gray-800">{bank.name}</p>
                            <p className="text-gray-600 text-sm">Account: <span className="font-mono">{bank.accountNumber}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <motion.button
                  onClick={resetForm}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Make Another Donation
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationForm;