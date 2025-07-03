import React from 'react';
import { motion } from 'framer-motion';

interface CauseCardProps {
  title: string;
  description: string;
  image: string;
}

const CauseCard: React.FC<CauseCardProps> = ({ 
  title, 
  description, 
  image
}) => {
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col"
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6 flex-grow">
          {description}
        </p>
        
        <div className="mt-auto pt-6">
          <motion.a
            href="#donate"
            className="block w-full py-2 text-center rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Donate Now
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default CauseCard;