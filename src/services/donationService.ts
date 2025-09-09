import api from './api';

export interface DonationData {
  name: string;
  email: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  isCompany: boolean;
  companyName?: string;
}

export interface Donor {
  _id: string;
  name: string;
  email: string;
  amount: number;
  paymentType: string;
  paymentStatus: string;
  paymentMethod: string;
  isCompany: boolean;
  companyName?: string;
  createdAt: string;
}

const donationService = {
  // Create a new donation
  createDonation: async (donationData: DonationData) => {
    const response = await api.post('/api/donations', donationData);
    return response.data;
  },

  // Get all donations
  getDonations: async () => {
    const response = await api.get('/api/donations');
    return response.data;
  },

  // Get donation by ID
  getDonationById: async (id: string) => {
    const response = await api.get(`/api/donations/${id}`);
    return response.data;
  },

  // Verify payment by transaction reference (legacy)
  verifyPayment: async (txRef: string) => {
    const response = await api.get(`/api/donations/verify/${txRef}`);
    return response.data;
  },

  // Verify payment by sessionId (ArifPay)
  verifyPaymentBySessionId: async (sessionId: string) => {
    const response = await api.get(`/api/donations?sessionId=${sessionId}`);
    return response.data;
  },
};

export default donationService;