const express = require('express');
const router = express.Router();
const ApiManager = require('../services/apiManager');
const asyncHandler = require('../middleware/asyncHandler');

// Initialize bank APIs on startup
ApiManager.initializeBankApis();

// GET /api/api-management - Get all API configurations
router.get('/api-management', asyncHandler(async (req, res) => {
  const apis = await ApiManager.getAllActiveApis();
  
  res.json({
    success: true,
    count: apis.length,
    data: apis.map(api => ({
      id: api._id,
      bankName: api.bankName,
      apiEndpoint: api.apiEndpoint,
      expirationDate: api.expirationDate,
      isActive: api.isActive,
      usageCount: api.usageCount,
      lastUsedAt: api.lastUsedAt,
      daysUntilExpiration: Math.ceil((api.expirationDate - new Date()) / (1000 * 60 * 60 * 24))
    }))
  });
}));

// GET /api/api-management/stats - Get API usage statistics
router.get('/api-management/stats', asyncHandler(async (req, res) => {
  const stats = await ApiManager.getUsageStatistics();
  
  res.json({
    success: true,
    data: stats
  });
}));

// GET /api/api-management/health - Health check for all APIs
router.get('/api-management/health', asyncHandler(async (req, res) => {
  const healthStatus = await ApiManager.healthCheck();
  
  res.json({
    success: true,
    data: healthStatus
  });
}));

// GET /api/api-management/expiring - Get APIs expiring soon
router.get('/api-management/expiring', asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const expiringApis = await ApiManager.checkExpiringApis();
  
  res.json({
    success: true,
    count: expiringApis.length,
    data: expiringApis.map(api => ({
      id: api._id,
      bankName: api.bankName,
      expirationDate: api.expirationDate,
      daysUntilExpiration: Math.ceil((api.expirationDate - new Date()) / (1000 * 60 * 60 * 24))
    }))
  });
}));

// GET /api/api-management/:bankName - Get specific bank API configuration
router.get('/api-management/:bankName', asyncHandler(async (req, res) => {
  const { bankName } = req.params;
  const api = await ApiManager.getApiConfig(bankName);
  
  if (!api) {
    return res.status(404).json({
      success: false,
      message: `API configuration not found for bank: ${bankName}`
    });
  }
  
  res.json({
    success: true,
    data: {
      id: api._id,
      bankName: api.bankName,
      apiEndpoint: api.apiEndpoint,
      expirationDate: api.expirationDate,
      isActive: api.isActive,
      usageCount: api.usageCount,
      lastUsedAt: api.lastUsedAt,
      lastRenewalDate: api.lastRenewalDate,
      daysUntilExpiration: Math.ceil((api.expirationDate - new Date()) / (1000 * 60 * 60 * 24))
    }
  });
}));

// PUT /api/api-management/:bankName - Update API configuration
router.put('/api-management/:bankName', asyncHandler(async (req, res) => {
  const { bankName } = req.params;
  const updates = req.body;
  
  // Remove sensitive fields from updates if not provided
  const allowedUpdates = [
    'apiEndpoint', 'expirationDate', 'isActive', 'rateLimit'
  ];
  
  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });
  
  const updatedApi = await ApiManager.updateApiConfig(bankName, filteredUpdates);
  
  if (!updatedApi) {
    return res.status(404).json({
      success: false,
      message: `API configuration not found for bank: ${bankName}`
    });
  }
  
  res.json({
    success: true,
    message: 'API configuration updated successfully',
    data: updatedApi
  });
}));

// POST /api/api-management/:bankName/renew - Renew API credentials
router.post('/api-management/:bankName/renew', asyncHandler(async (req, res) => {
  const { bankName } = req.params;
  const { apiKey, apiSecret, merchantId, expirationDate } = req.body;
  
  if (!apiKey || !apiSecret || !merchantId || !expirationDate) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: apiKey, apiSecret, merchantId, expirationDate'
    });
  }
  
  const newCredentials = {
    apiKey,
    apiSecret,
    merchantId,
    expirationDate: new Date(expirationDate)
  };
  
  const updatedApi = await ApiManager.renewApiCredentials(bankName, newCredentials);
  
  if (!updatedApi) {
    return res.status(404).json({
      success: false,
      message: `API configuration not found for bank: ${bankName}`
    });
  }
  
  res.json({
    success: true,
    message: 'API credentials renewed successfully',
    data: updatedApi
  });
}));

// POST /api/api-management/check-expiration - Manually trigger expiration check
router.post('/api-management/check-expiration', asyncHandler(async (req, res) => {
  const expiringApis = await ApiManager.checkExpiringApis();
  
  res.json({
    success: true,
    count: expiringApis.length,
    message: 'Expiration check completed',
    data: expiringApis.map(api => ({
      bankName: api.bankName,
      expirationDate: api.expirationDate,
      daysUntilExpiration: Math.ceil((api.expirationDate - new Date()) / (1000 * 60 * 60 * 24))
    }))
  });
}));

// POST /api/api-management/initialize - Initialize default bank APIs
router.post('/api-management/initialize', asyncHandler(async (req, res) => {
  await ApiManager.initializeBankApis();
  
  res.json({
    success: true,
    message: 'Bank API initialization completed'
  });
}));

module.exports = router;