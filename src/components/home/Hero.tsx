import React, { Suspense, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

// Component to cycle through different words with different colors
const CyclingWords: React.FC = () => {
  const words = [
    { text: 'Life', color: '#7dd3fc' },  // Orange
    
    { text: 'World', color: '#7dd3fc' },  // Purple
    { text: 'Future', color: '#7dd3fc' }  // Blue
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayText, setDisplayText] = useState(words[0].text);
  const [displayColor, setDisplayColor] = useState(words[0].color);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // After fade out, change the text and start fade in
      setTimeout(() => {
        const nextIndex = (currentIndex + 1) % words.length;
        setCurrentIndex(nextIndex);
        setDisplayText(words[nextIndex].text);
        setDisplayColor(words[nextIndex].color);
        setIsAnimating(false);
      }, 500); // Half of the total animation time
      
    }, 2000); // Change word every 2 seconds
    
    return () => clearInterval(interval);
  }, [currentIndex, words]);
  
  return (
    <span 
      style={{ 
        color: displayColor,
        opacity: isAnimating ? 0 : 1,
        transform: `translateY(${isAnimating ? '10px' : '0'})`,
        display: 'inline-block',
        transition: 'all 0.5s ease-in-out'
      }}
    >
      {displayText}
    </span>
  );
};

// Component to load and display the GLTF model
const Model = () => {
  const { scene } = useGLTF('/scene.gltf');
  const modelRef = useRef<THREE.Object3D>();

  useFrame((_state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.1; // Adjust rotation speed here
    }
  });

  return <primitive object={scene} scale={1.5} ref={modelRef} position={[0, 0, 0]} />;
};

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative h-screen flex items-center">
      {/* 3D Globe Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="h-full w-full bg-primary-900" />}>
          <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Model />
            <OrbitControls
              enableZoom={true}
              enablePan={true}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 to-primary-900/"></div>

      {/* Hero content */}
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
              Your Donation Can Change Our <CyclingWords />
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-lg md:text-xl text-white text-opacity-90 mb-8">
              Join our global community of givers and see your impact visualized in real-time. Every donation creates a ripple effect of positive change.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <motion.a
              href="#donate"
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full text-center transition-colors gradient-border-button gradient-border-blue"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Donate Now
            </motion.a>
            <motion.a
              href="#causes"
              className="px-8 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white font-medium rounded-full text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Causes
            </motion.a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <div className="w-8 h-12 rounded-full border-2 border-white border-opacity-50 flex justify-center pt-2">
          <div className="w-1 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;