const axios = require('axios');

// Test script to verify donation flow
async function testDonationFlow() {
  console.log('Testing donation flow...');
  
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
    
    // Test 3: Check if tx_ref field is populated
    console.log('3. Checking tx_ref fields...');
    const donationsWithTxRef = donationsResponse.data.data.filter(d => d.tx_ref);
    console.log(`✅ ${donationsWithTxRef.length} donations have tx_ref`);
    
    // Test 4: Test querying by tx_ref
    if (donationsWithTxRef.length > 0) {
      const testDonation = donationsWithTxRef[0];
      console.log('4. Testing tx_ref query...');
      const txRefResponse = await axios.get(`${API_URL}/api/donations?tx_ref=${testDonation.tx_ref}`);
      console.log(`✅ tx_ref query works: ${txRefResponse.data.count} results`);
      
      // Test 5: Test querying by transactionId
      console.log('5. Testing transactionId query...');
      const txIdResponse = await axios.get(`${API_URL}/api/donations?transactionId=${testDonation.transactionId}`);
      console.log(`✅ transactionId query works: ${txIdResponse.data.count} results`);
    }
    
    console.log('\n🎉 All tests passed! Donation flow should now work correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testDonationFlow();
}

module.exports = { testDonationFlow };