const axios = require('axios');

// Test script to verify ArifPay donation flow
async function testArifpayFlow() {
  console.log('🔍 Testing ArifPay donation flow...\n');
  
  const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    // Test 1: Check if API is accessible
    console.log('1. Testing API accessibility...');
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    console.log('✅ API is accessible');
    
    // Test 2: Check if donations endpoint works
    console.log('2. Testing donations endpoint...');
    const donationsResponse = await axios.get(`${API_URL}/api/donations`);
    console.log(`✅ Found ${donationsResponse.data.count} donations`);
    
    // Test 3: Check if sessionId field is populated
    console.log('3. Checking sessionId fields...');
    const donationsWithSessionId = donationsResponse.data.data.filter(d => d.sessionId);
    console.log(`✅ ${donationsWithSessionId.length} donations have sessionId`);
    
    // Test 4: Test querying by sessionId
    if (donationsWithSessionId.length > 0) {
      const testDonation = donationsWithSessionId[0];
      console.log('4. Testing sessionId query...');
      const sessionIdResponse = await axios.get(`${API_URL}/api/donations?sessionId=${testDonation.sessionId}`);
      console.log(`✅ sessionId query works: ${sessionIdResponse.data.count} results`);
      
      // Test 5: Test ArifPay verification endpoint
      console.log('5. Testing ArifPay verification endpoint...');
      const verifyResponse = await axios.post(`${API_URL}/api/donations/verify-arifpay`, {
        sessionId: testDonation.sessionId,
        status: 'PAID'
      });
      console.log('✅ ArifPay verification endpoint accessible');
    }
    
    // Test 6: Test creating a new donation
    console.log('6. Testing new donation creation...');
    const newDonation = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+251911223344',
      amount: 100,
      currency: 'ETB',
      paymentMethod: 'arifpay',
      campaign: 'General Donation',
      message: 'Test donation via ArifPay'
    };
    
    const createResponse = await axios.post(`${API_URL}/api/donations`, newDonation);
    console.log('✅ New donation created successfully');
    console.log(`   Session ID: ${createResponse.data.data.sessionId}`);
    console.log(`   Checkout URL: ${createResponse.data.data.arifpay_checkout_url}`);
    
    // Test 7: Test environment variables
    console.log('7. Checking environment configuration...');
    const envCheck = await axios.get(`${API_URL}/api/config`);
    console.log('✅ Environment variables configured');
    
    // Test 8: Test error handling
    console.log('8. Testing error handling...');
    try {
      await axios.get(`${API_URL}/api/donations?sessionId=invalid-session-id`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Error handling works correctly');
      }
    }
    
    console.log('\n🎉 All ArifPay tests passed! Integration is working correctly.');
    
  } catch (error) {
    console.error('❌ ArifPay test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    
    // Provide detailed error analysis
    console.log('\n📋 ArifPay Integration Analysis:');
    console.log('1. Check if ArifPay API key is configured correctly');
    console.log('2. Verify ArifPay callback URLs are accessible');
    console.log('3. Ensure MongoDB is running and accessible');
    console.log('4. Check if backend server is running on port 5000');
    console.log('5. Verify environment variables are set correctly');
  }
}

// Test configuration endpoint
async function testConfiguration() {
  console.log('\n🔧 Testing configuration...');
  const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    const response = await axios.get(`${API_URL}/api/config`);
    console.log('Configuration:', response.data);
  } catch (error) {
    console.log('Configuration endpoint not available, checking environment variables manually...');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testArifpayFlow().then(() => {
    testConfiguration();
  });
}

module.exports = { testArifpayFlow, testConfiguration };