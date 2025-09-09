const mongoose = require('mongoose');

const apiConfigSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  apiEndpoint: {
    type: String,
    required: true,
    trim: true
  },
  apiKey: {
    type: String,
    required: true,
    trim: true
  },
  apiSecret: {
    type: String,
    required: true,
    trim: true
  },
  merchantId: {
    type: String,
    required: true,
    trim: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRenewalDate: {
    type: Date,
    default: Date.now
  },
  renewalAlertSent: {
    type: Boolean,
    default: false
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date,
    default: null
  },
  rateLimit: {
    requestsPerMinute: { type: Number, default: 100 },
    requestsPerHour: { type: Number, default: 1000 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
apiConfigSchema.index({ bankName: 1 });
apiConfigSchema.index({ expirationDate: 1 });
apiConfigSchema.index({ isActive: 1, expirationDate: 1 });

// Pre-save middleware to update updatedAt
apiConfigSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if API is expired
apiConfigSchema.methods.isExpired = function() {
  return new Date() > this.expirationDate;
};

// Method to check if API is nearing expiration (within 7 days)
apiConfigSchema.methods.isNearingExpiration = function(days = 7) {
  const now = new Date();
  const expirationDate = new Date(this.expirationDate);
  const daysUntilExpiration = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
  return daysUntilExpiration <= days && daysUntilExpiration > 0;
};

// Static method to get active APIs
apiConfigSchema.statics.getActiveApis = function() {
  return this.find({ isActive: true, expirationDate: { $gt: new Date() } });
};

// Static method to get expiring APIs
apiConfigSchema.statics.getExpiringApis = function(days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    isActive: true,
    expirationDate: { $gte: now, $lte: futureDate }
  });
};

module.exports = mongoose.model('ApiConfig', apiConfigSchema);