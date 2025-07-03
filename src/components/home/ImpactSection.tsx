import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import ModelViewer from '../ModelViewer';

const impactMetrics = [
  { id: 1, metric: '10000+', description: 'People Helped', color: '#0ea5e9' },
  { id: 3, metric: '25', description: 'Local Partners', color: '#f97316' },
  { id: 4, metric: '$50K', description: 'Donations Raised', color: '#8b5cf6' }
];

const ImpactSection: React.FC = () => {
  return (
    <section id="impact" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 mb-4">
              Your Impact Visualized
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              See how your donations transform lives around the world through our interactive visualizations and real impact metrics.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* 3D Impact Visualization */}
          <div className="h-[400px] bg-white rounded-xl shadow-lg overflow-hidden">
            <Suspense fallback={<div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading visualization...</div>}>
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <ModelViewer modelPath="/scene.gltf" scale={0.5} />
              </Canvas>
            </Suspense>
          </div>

          {/* Impact Metrics */}
          <div className="grid grid-cols-2 gap-6">
            {impactMetrics.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white p-6 rounded-xl shadow-md text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 12px 20px -4px rgba(0, 0, 0, 0.1)",
                  transition: { duration: 0.3 } 
                }}
              >
                <h3 
                  className="text-3xl md:text-4xl font-bold mb-2" 
                  style={{ color: item.color }}
                >
                  {item.metric}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}

            <motion.div
              className="col-span-2 bg-primary-600 p-6 rounded-xl shadow-md text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 12px 20px -4px rgba(0, 0, 0, 0.15)",
                transition: { duration: 0.3 } 
              }}
            >
              <h3 className="text-2xl font-bold mb-2">Download Our Impact Report</h3>
              <p className="mb-4">Get detailed insights into how we're making a difference.</p>
              <motion.a
                href="#"
                className="inline-block px-6 py-2 bg-white text-primary-600 font-medium rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get the Report
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );

};

export default ImpactSection;