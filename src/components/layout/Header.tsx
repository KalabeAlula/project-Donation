import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white bg-opacity-80 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="/" className="flex items-center">
          <img 
            src="/Logo.png" 
            alt="Logo"
            className={`h-8 w-auto mr-2`}
          />
          <span className={`font-display font-bold text-xl ${scrolled ? 'text-primary-800' : 'text-white'}`}>
            Glory Intergrated Development Foundtion
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {[
            { name: 'Home', path: '/' },
            { name: 'Causes', path: '/#causes' },
            { name: 'News', path: '/news' },
            { name: 'About', path: '/about' },
            { name: 'Contact', path: '/contact' }
          ].map((item) => (
            <a 
              key={item.name}
              href={item.path}
              className={`font-medium transition-colors hover:text-primary-500 ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Donate Button */}
        <motion.a
          href="#donate"
          className={`hidden md:flex items-center px-6 py-2 rounded-full 
            ${scrolled 
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white border border-white border-opacity-30'
            } 
            transition-all font-medium text-sm`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Donate Now
        </motion.a>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <X className={scrolled ? 'text-gray-700' : 'text-white'} />
          ) : (
            <Menu className={scrolled ? 'text-gray-700' : 'text-white'} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-3 bg-white shadow-lg">
          {[
            { name: 'Home', path: '/' },
            { name: 'Causes', path: '/#causes' },
            { name: 'News', path: '/news' },
            { name: 'About', path: '/about' },
            { name: 'Contact', path: '/contact' },
            { name: 'Donate', path: '/#donate' }
          ].map((item) => (
            <a 
              key={item.name}
              href={item.path}
              className="block py-2 text-gray-700 font-medium hover:text-primary-500"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <motion.a
            href="#donate"
            className="block mt-3 mb-1 text-center py-3 rounded-full bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(false)}
          >
            Donate Now
          </motion.a>
        </div>
      </div>
    </header>
  );
};

export default Header;