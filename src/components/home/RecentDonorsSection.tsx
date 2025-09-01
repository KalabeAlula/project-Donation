import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import donationService from '../../services/donationService';

import './recentDonorsSection.css'

interface Donor {
  _id: string;
  name: string;
  amount: number;
  isCompany: boolean;
  companyName?: string;
  paymentStatus: string;
  paymentType: string;
  paymentMethod: string;
  createdAt: string;
  // Fields for display purposes
  type: string;
  cause: string;
  date: string;
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const DonorCard: React.FC<{ donor: Donor }> = ({ donor }) => {
  return (
    <div className="donorCard bg-white rounded-xl shadow-lg overflow-hidden w-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              donor.type === 'corporate' ? 'bg-primary-100' : 'bg-accent-100'
            }`}>
              <Heart className={`w-6 h-6 ${
                donor.type === 'corporate' ? 'text-primary-600' : 'text-accent-600'
              }`} />
            </div>
            <div className="ml-4">
              <h3 className="font-display font-semibold text-lg text-gray-900 truncate" title={donor.name}>
                {donor.name}
              </h3>
              <p className="text-sm text-gray-500">
                {donor.type === 'corporate' ? 'Corporate Donor' : 'Individual Donor'}
              </p>
            </div>
          </div>
          <span className="text-lg font-bold text-primary-600 whitespace-nowrap">
            {formatAmount(donor.amount)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 truncate">
            Donated to: <span className="font-medium">{donor.cause}</span>
          </span>
          <span className="text-gray-500 whitespace-nowrap">{donor.date}</span>
        </div>
      </div>
    </div>
  );
};

interface ScrollingRowProps {
  donors: Donor[];
  direction: 'left' | 'right';
  duration?: number;
}

const ScrollingRow: React.FC<ScrollingRowProps> = ({ donors, direction, duration = 120 }) => {
  // Duplicate donors for a seamless loop. Ensure there are enough items for a smooth visual.
  const TILE_COUNT = donors.length;
  const MIN_TILES_FOR_SMOOTH_SCROLL = 5; // Adjust if cards are very wide or screen is small
  const effectiveDonors = TILE_COUNT < MIN_TILES_FOR_SMOOTH_SCROLL 
    ? Array(Math.ceil(MIN_TILES_FOR_SMOOTH_SCROLL / TILE_COUNT)).fill(donors).flat()
    : donors;
  
  const duplicatedDonors = [...effectiveDonors, ...effectiveDonors];

  return (
    <div className="overflow-hidden whitespace-nowrap relative group">
      <motion.div
        className="flex"
        animate={{
          x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
        }}
        transition={{
          ease: 'linear',
          duration: duration,
          repeat: Infinity,
        }}
        // Pause on hover
        whileHover={{ animationPlayState: 'paused' }}
      >
        {duplicatedDonors.map((donor, index) => (
          <div key={`${donor.name}-${donor.date}-${index}`} className="inline-block px-2 flex-shrink-0 w-80 md:w-96">
            <DonorCard donor={donor} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// Map payment methods to causes (for demo purposes)
const paymentMethodToCause: Record<string, string> = {
  'credit_card': 'Education',
  'paypal': 'Clean Water',
  'bank_transfer': 'Medical Aid'
};

// Function to format relative time (e.g., "2 hours ago")
const getRelativeTimeString = (date: string): string => {
  const now = new Date();
  const donationDate = new Date(date);
  const diffInMs = now.getTime() - donationDate.getTime();
  
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInSecs < 60) return 'just now';
  if (diffInMins < 60) return `${diffInMins} ${diffInMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  
  return donationDate.toLocaleDateString();
};

// Transform API donor data to match our display format
const transformDonorData = (apiDonor: any): Donor => {
  // Randomly assign a cause based on payment method for demo purposes
  // In a real app, you would have a cause field in your donation model
  const causes = ['Education', 'Clean Water', 'Medical Aid', 'Environmental', 'Hunger Relief'];
  const cause = paymentMethodToCause[apiDonor.paymentMethod] || 
                causes[Math.floor(Math.random() * causes.length)];
  
  return {
    ...apiDonor,
    type: apiDonor.isCompany ? 'corporate' : 'individual',
    cause,
    date: getRelativeTimeString(apiDonor.createdAt)
  };
};

const RecentDonorsSection: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Fetch donors from the API
  const fetchDonors = async () => {
    try {
      setLoading(true);
      
      const response = await donationService.getDonations();
      
      if (response.success) {
        // Filter for completed donations only
        const completedDonations = response.data
          .filter((donor: any) => donor.paymentStatus === 'completed')
          .map(transformDonorData);
        
        setDonors(completedDonations);
      } else {
        setError('Failed to fetch recent donors');
      }
    } catch (error) {
      console.error('Error fetching donors:', error);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch donors on component mount
  useEffect(() => {
    fetchDonors();
    
    // Set up polling to refresh donors every 30 seconds
    const intervalId = setInterval(fetchDonors, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Create different arrangements of the donors for the scrolling rows
  const reversedDonors = [...donors].reverse();
  const mixedDonors = donors.length > 0 
    ? donors.slice(Math.floor(donors.length / 2)).concat(donors.slice(0, Math.floor(donors.length / 2)))
    : [];
  
  // Calculate base duration based on number of donors
  const baseDuration = donors.length > 0 ? donors.length * 6 : 30; // e.g., 6 items * 6s/item = 36s

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Recent Donations
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Join these amazing donors who are making a difference in the world.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading recent donations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : donors.length > 0 ? (
          <div className="rcDonor">
            <div className="scrollRow">
              {
                donors.map((donor, i) => (
                  <div key={`${donor._id}-${i}`} className="inline-block px-2 flex-shrink-0 w-80 md:w-96">
                    <DonorCard donor={donor} />
                  </div>
                ))
              }
              {
                donors.map((donor, i) => (
                  <div key={`${donor._id}-dup-${i}`} className="inline-block px-2 flex-shrink-0 w-80 md:w-96">
                    <DonorCard donor={donor} />
                  </div>
                ))
              }
            </div>
            <div className="scrollRow">
              {
                reversedDonors.map((donor, i) => (
                  <div key={`${donor._id}-rev-${i}`} className="inline-block px-2 flex-shrink-0 w-80 md:w-96">
                    <DonorCard donor={donor} />
                  </div>
                ))
              }
              {
                reversedDonors.map((donor, i) => (
                  <div key={`${donor._id}-rev-dup-${i}`} className="inline-block px-2 flex-shrink-0 w-80 md:w-96">
                    <DonorCard donor={donor} />
                  </div>
                ))
              }
            </div>
            <div className="scrollRow">
              {
                mixedDonors.map((donor, i) => (
                  <div key={`${donor._id}-mix-${i}`} className="inline-block px-2 flex-shrink-0 w-80 md:w-96">
                    <DonorCard donor={donor} />
                  </div>
                ))
              }
              {
                mixedDonors.map((donor, i) => (
                  <div key={`${donor._id}-mix-dup-${i}`} className="inline-block px-2 flex-shrink-0 w-80 md:w-96">
                    <DonorCard donor={donor} />
                  </div>
                ))
              }
            </div>
          </div>
        ) : (
          <p className='text-center text-gray-500'>No recent donations to display yet.</p>
        )}

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <a
            href="#donate"
            className="inline-block px-8 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-full transition-colors"
          >
            Join Our Donors
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default RecentDonorsSection;