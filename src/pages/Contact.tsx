import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MapWrapper from '../components/map/MapWrapper';
import messageService, { MessageData } from '../services/messageService';


const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({});
    
    try {
      const response = await messageService.sendContactMessage(formData as MessageData);
      
      setSubmitStatus({
        success: true,
        message: response.data.message || 'Thank you for your message! We will get back to you soon.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        success: false,
        message: 'There was an error sending your message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-primary-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.h1 
              className="font-display font-bold text-4xl md:text-5xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Contact Us
            </motion.h1>
            <motion.p 
              className="max-w-2xl mx-auto text-lg text-primary-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Have questions or want to get involved? We'd love to hear from you.
            </motion.p>
          </div>
        </section>

        {/* Contact Form and Info Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                className="bg-white p-8 rounded-xl shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 mb-2">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Donation Question">Donation Question</option>
                      <option value="Partnership Opportunity">Partnership Opportunity</option>
                      <option value="Volunteer Information">Volunteer Information</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-gray-700 mb-2">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    ></textarea>
                  </div>
                  {submitStatus.message && (
                    <div className={`mb-4 p-3 rounded-lg ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {submitStatus.message}
                    </div>
                  )}
                  
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center justify-center w-full py-3 px-6 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'} text-white font-medium rounded-lg transition-colors`}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="h-96 lg:h-auto"
              >
                <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">Contact Information</h2>
                
                <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                  <div className="flex items-start mb-6">
                    <MapPin className="h-6 w-6 text-primary-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Our Location</h3>
                      <p className="text-gray-600">st.Zewditu,kazanchis Glory Blodg.8th Floor</p>
                      <p className="text-gray-600 mt-2">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <Phone className="h-6 w-6 text-primary-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                      <p className="text-gray-600">Main: +(251) 912506322</p>
                      
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-6 w-6 text-primary-600 mr-3 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">General: GloryIntergratedDevelopmentFoundtion@gmail.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary-50 p-6 rounded-xl border border-primary-100">
                  <h3 className="font-display font-semibold text-xl text-primary-800 mb-3">Connect With Us</h3>
                  <p className="text-gray-600 mb-4">
                    Follow us on social media to stay updated on our latest projects, success stories, and opportunities to get involved.
                  </p>
                  <div className="flex space-x-4">
                    {['facebook', 'twitter', 'instagram', 'linkedin'].map(platform => (
                      <a 
                        key={platform}
                        href={`https://${platform}.com`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white p-2 rounded-full hover:bg-primary-600 hover:text-white transition-colors"
                        aria-label={platform}
                      >
                        <span className="sr-only">{platform}</span>
                        <img 
                          src={`https://api.iconify.design/mdi:${platform}.svg?color=currentColor`}
                          alt={platform}
                          width="20"
                          height="20"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">Find Us</h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                Visit our headquarters or reach out to one of our regional offices.
              </p>
            </motion.div>

            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="h-96 w-full" id="map-container" style={{ height: '24rem', width: '100%' }}>
                {/* Coordinates converted from DMS (0°46'46.9"N, 38°46'25.7"E) to decimal degrees */}
                <MapWrapper 
                  center={[0.7797, 38.7738]}
                  zoom={13}
                  markerPosition={[0.7797, 38.7738]}
                  popupContent="Glory Intergrated Development Foundation <br />st.Zewditu, kazanchis Glory Bldg. 8th Floor"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;