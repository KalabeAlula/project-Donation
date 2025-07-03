import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  summary: string;
  imageUrl: string;
  isLatest?: boolean;
}

const News: React.FC = () => {
  // Sample news data - in a real application, this would come from an API
  const latestNews: NewsItem[] = [
    {
      id: 1,
      title: 'New Partnership with Local Schools',
      date: 'June 15, 2023',
      summary: 'We are excited to announce our new partnership with local schools to provide educational resources to underprivileged children.',
      imageUrl: '/cause1.jpg',
      isLatest: true
    },
    {
      id: 2,
      title: 'Annual Charity Gala Raises Record Funds',
      date: 'May 28, 2023',
      summary: 'Our annual charity gala was a huge success, raising over $500,000 for various causes around the world.',
      imageUrl: '/cause2.jpg',
      isLatest: true
    },
    {
      id: 3,
      title: 'New Clean Water Initiative Launched',
      date: 'May 10, 2023',
      summary: 'We have launched a new initiative to provide clean water to communities in need across Africa.',
      imageUrl: '/cause3.jpg',
      isLatest: true
    }
  ];

  const oldNews: NewsItem[] = [
    {
      id: 4,
      title: 'Volunteer Program Expands to New Regions',
      date: 'April 22, 2023',
      summary: 'Our volunteer program has expanded to include three new regions, allowing us to help more communities than ever before.',
      imageUrl: '/cause4.jpg'
    },
    {
      id: 5,
      title: 'Foundation Celebrates 5 Years of Impact',
      date: 'March 15, 2023',
      summary: 'Glory Intergrated Development Foundation celebrates 5 years of making a positive impact in communities worldwide.',
      imageUrl: '/cause1.jpg'
    },
    {
      id: 6,
      title: 'New Board Members Announced',
      date: 'February 28, 2023',
      summary: 'We are pleased to welcome three new members to our board of directors, bringing fresh perspectives and expertise.',
      imageUrl: '/cause2.jpg'
    }
  ];

  // Function to render a news card
  const renderNewsCard = (item: NewsItem) => (
    <motion.div
      key={item.id}
      className={`bg-white rounded-lg overflow-hidden shadow-lg ${item.isLatest ? 'gradient-border-news' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <img 
        src={item.imageUrl} 
        alt={item.title} 
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">{item.date}</span>
          {item.isLatest && (
            <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">Latest</span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
        <p className="text-gray-600">{item.summary}</p>
        <motion.button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Read More
        </motion.button>
      </div>
    </motion.div>
  );

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
              News & Updates
            </motion.h1>
            <motion.p 
              className="max-w-2xl mx-auto text-lg text-primary-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Stay informed about our latest initiatives, events, and success stories.
            </motion.p>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-center mb-12">Latest News</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestNews.map(renderNewsCard)}
            </div>
          </div>
        </section>

        {/* Archive News Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-center mb-12">News Archive</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {oldNews.map(renderNewsCard)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;