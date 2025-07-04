import React from 'react';
import { Heart, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and mission */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <Heart className="h-6 w-6 text-primary-400 mr-2" fill="#38bdf8" />
              <span className="font-display font-bold text-xl">Glory Intergrated Development Foundtion</span>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering communities through your generosity. Every donation creates a ripple of positive change.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map(platform => (
                <a 
                  key={platform}
                  href={`https://${platform}.com`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors"
                  aria-label={platform}
                >
                  <span className="sr-only">{platform}</span>
                  <img 
                    src={`https://api.iconify.design/mdi:${platform}.svg?color=white`}
                    alt={platform}
                    width="20"
                    height="20"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {['Our Mission', 'Causes', 'How We Help', 'Get Involved', 'Impact Reports'].map(link => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Causes */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Our Causes</h3>
            <ul className="space-y-3">
              {['Safety', 'Education', 'Medical Aid', 'Environmental', ].map(cause => (
                <li key={cause}>
                  <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                    {cause}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-400 mr-2 mt-0.5" />
                <span className="text-gray-400">st.Zewditu,kazanchis Glory Blodg.8th Floor</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary-400 mr-2" />
                <a href="tel:+11234567890" className="text-gray-400 hover:text-primary-400 transition-colors">
                  +(251) 912506322 
                </a>
              </li>
              <li className="flex flex-col">
                <div className="flex items-center mb-1">
                  <Mail className="h-5 w-5 text-primary-400 mr-2" />
                  <span className="text-gray-400">Email</span>
                </div>
                <a href="mailto:GloryIntergratedDevelopmentFoundtion@gmail.com" className="text-gray-400 hover:text-primary-400 transition-colors pl-7">
                  GloryIntergratedDevelopmentFoundtion@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p className="mb-2">© {new Date().getFullYear()} Glory Intergrated Development Foundtion. All rights reserved.</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;