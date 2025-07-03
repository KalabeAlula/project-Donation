import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Monthly Donor',
    content: 'Seeing my donations visualized in 3D makes giving so much more meaningful. I can actually see the impact I\'m making around the world.',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Community Partner',
    content: 'As a partner organization, the transparency Glory Intergrated Development Foundtion provides is unmatched. The 3D visualizations help us show our stakeholders exactly how funds are used.',
  },
  {
    id: 3,
    name: 'Aisha Williams',
    role: 'Impact Investor',
    content: 'The immersive experience on this platform transformed how I think about charitable giving. It\'s like I can reach out and touch the lives I\'m helping.',
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-100 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Hear From Our Community
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Discover why donors choose us and how the interactive experience transforms their giving.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className="bg-white p-8 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transition: { duration: 0.3 } 
              }}
            >
              <div className="flex items-center mb-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-gray-900">
                    {testimonial.name}
                  </h3>
                  <p className="text-primary-600">{testimonial.role}</p>
                </div>
              </div>
              <blockquote>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
              </blockquote>
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
            Join Our Community
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;