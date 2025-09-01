import React from 'react';
import { motion } from 'framer-motion';

const supporters = [
  {
    name: 'TechCorp Global',
    logo: '/public/Glory.jpg',
    
  },
  {
    name: 'GreenEarth Industries',
    logo: '/public/Daftech.jpg',
    
  },
  {
    name: 'Future Finance',
    logo: '/public/Glory.jpg',
    
  },
  {
    name: 'HealthPlus Corp',
    logo: '/public/Daftech.jpg',
    
  },
  {
    name: 'EduTech Solutions',
    logo: '/public/Glory.jpg',
    
  }
];

interface ScrollingRowProps {
  logos: typeof supporters;
  direction: 'left' | 'right';
  duration?: number;
}

const ScrollingRow: React.FC<ScrollingRowProps> = ({ logos, direction, duration = 30 }) => {
  // Ensure we have enough items for a smooth scroll
  const LOGO_COUNT = logos.length;
  const MIN_LOGOS_FOR_SMOOTH_SCROLL = 5;
  const effectiveLogos = LOGO_COUNT < MIN_LOGOS_FOR_SMOOTH_SCROLL 
    ? Array(Math.ceil(MIN_LOGOS_FOR_SMOOTH_SCROLL / LOGO_COUNT)).fill(logos).flat()
    : logos;
  
  // Create duplicates to ensure seamless looping
  const duplicatedLogos = [...effectiveLogos, ...effectiveLogos, ...effectiveLogos];

  return (
    <div className="overflow-hidden whitespace-nowrap relative group">
      <motion.div
        className="flex items-center"
        animate={{
          x: direction === 'left' ? ['0%', '-33.33%'] : ['-33.33%', '0%'],
        }}
        transition={{
          ease: 'linear',
          duration: duration,
          repeat: Infinity,
          repeatType: 'loop'
        }}
        // Optional: Pause on hover for better UX
        whileHover={{ animationPlayState: 'paused' }}
      >
        {duplicatedLogos.map((supporter, index) => (
          <div
            key={`${supporter.name}-${index}`}
            className="flex-shrink-0 w-52 flex justify-center items-center"
          >
            <div className="relative group flex flex-col items-center flex-shrink-0">
              <div className="w-40 h-28 rounded-lg overflow-hidden flex items-center justify-center p-0">
                <img
                  src={supporter.logo}
                  alt={supporter.name}
                  className="object-contain w-full h-full filter grayscale group-hover:grayscale-0 transition-all duration-300 bg-transparent"
                  style={{ background: 'transparent', boxShadow: 'none' }}
                />
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const SupportersSection: React.FC = () => {
  const baseDuration = supporters.length > 0 ? supporters.length * 7 : 30;
  
  return (
    <section className="py-20 w-full bg-transparent">
      <div className="w-full max-w-none px-0">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Our Corporate Partners
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Leading companies that share our vision and support our mission to create positive change worldwide.
            </p>
          </motion.div>
        </div>

        <div className="relative w-full">
          <ScrollingRow logos={supporters} direction="left" duration={baseDuration} />
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <a
            href="#donate"
            className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full transition-colors"
          >
            Become a Corporate Partner
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default SupportersSection;