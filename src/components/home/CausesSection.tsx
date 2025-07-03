import React from 'react';
import { motion } from 'framer-motion';
import CauseCard from './CauseCard';
import CauseIcon from '../CauseIcon';

const causes = [
  {
    id: 1,
    title: 'Training',
    description: 'Short term training to let them create their own job.',
    iconType: 'water',
    iconColor: '#0ea5e9',
    image: '/cause1.jpg',
    raised: 23450,
    goal: 50000
  },
  {
    id: 2,
    title: 'Education',
    description: 'Support education initiatives bringing quality learning to children and adults .',
    iconType: 'education',
    iconColor: '#f97316',
    image: '/cause2.jpg',
    raised: 34560,
    goal: 60000
  },
  {
    id: 3,
    title: 'Support',
    description: 'Support our students in their journey to higher education.',
    iconType: 'medical',
    iconColor: '#14b8a6',
    image: '/cause3.jpg',
    raised: 42300,
    goal: 75000
  },
  {
    id: 4,
    title: 'Environmental',
    description: 'Support conservation efforts and sustainable practices to protect our communities .',
    iconType: 'environment',
    iconColor: '#22c55e',
    image: '/cause4.jpg',
    raised: 18700,
    goal: 40000
  }
];

// Using the new CauseIcon component directly

const CausesSection: React.FC = () => {
  return (
    <section id="causes" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Our Core Support
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Explore our featured causes and discover where your donation can make the biggest difference. Every contribution helps us reach our goals.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {causes.map((cause, index) => (
            <motion.div
              key={cause.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <CauseCard
                title={cause.title}
                description={cause.description}
                image={cause.image}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <motion.a
            href="#donate"
            className="inline-block px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-full text-center transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See All Causes
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default CausesSection;