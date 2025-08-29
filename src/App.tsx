import React from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import CausesSection from './components/home/CausesSection';
import DonationForm from './components/home/DonationForm';
import TestimonialsSection from './components/home/TestimonialsSection';
import SupportersSection from './components/home/SupportersSection';
import RecentDonorsSection from './components/home/RecentDonorsSection';
import About from './pages/About';
import Contact from './pages/Contact';
import News from './pages/News';
import DonationSuccess from './pages/DonationSuccess';

const HomePage = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <CausesSection />
        </motion.div>
        {/* Impact Section removed as requested */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <SupportersSection />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <RecentDonorsSection />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <DonationForm />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <TestimonialsSection />
        </motion.div>
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/news" element={<News />} />
          <Route path="/donation-success" element={<DonationSuccess />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;