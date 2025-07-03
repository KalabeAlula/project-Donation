import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const About: React.FC = () => {
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
              About Glory Intergrated Development Foundtion
            </motion.h1>
            <motion.p 
              className="max-w-2xl mx-auto text-lg text-primary-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Our mission, vision, and the impact we're making together.
            </motion.p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display font-bold text-3xl text-gray-900 mb-6">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  GGlory Integrated Development Foundation (GIDF) originated from a proposal to establish the Gondar Boarding School, initiated in February 2016 in Addis Ababa. The school aims to meet the growing demand for high-quality, structured, and disciplined boarding education in Ethiopia, particularly in the Amhara region. This initiative reflects a shared vision among the founding board members to create a modern educational model that equips students to excel academically, socially, and ethically in both national and global contexts
                </p>
                <p className="text-gray-600 mb-4">
                The foundation was established in response to the significant and recurring decline in academic performance among students in the Amhara region and other parts of Ethiopia, particularly in national examinations such as the Grade 12 University entrance exam. Pass rates have consistently dropped, highlighting a broader crisis in educational equity and access. Many high-potential students fail not due to a lack of talent or ambition
                </p>
                <p className="text-gray-600">
                Boarding schools in various parts of Ethiopia have demonstrated notable success in mitigating these barriers by creating safe, focused, and empowering environments that promote academic excellence. Inspired by these outcomes, GIDF was formally established to scale and institutionalize this success through an inclusive and integrated model. GIDF envisions a generation of students who are not only academically strong but also socially responsible and future-ready
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl overflow-hidden shadow-xl"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <img 
                  src="/about-story.jpg" 
                  alt="Glory Intergrated Development Foundtion team working in the field" 
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/600x400/0ea5e9/ffffff?text=Our+Story';
                  }}
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">Our Values</h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                These core principles guide everything we do and every decision we make.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {[
                {
                  title: 'Integration',
                  description: 'We combine diverse approaches and resources to create holistic solutions that address complex challenges.',
                  color: 'bg-blue-500'
                },
                {
                  title: 'Sustainability',
                  description: 'We develop programs and initiatives that can be maintained over time with minimal external support.',
                  color: 'bg-green-500'
                },
                {
                  title: 'Collaboration',
                  description: 'We work together with communities, organizations, and stakeholders to achieve shared goals.',
                  color: 'bg-orange-500'
                },
                {
                  title: 'Accountability',
                  description: 'We take responsibility for our actions and are answerable to those we serve and support.',
                  color: 'bg-purple-500'
                },
                {
                  title: 'Transparency',
                  description: 'We believe in complete openness about how funds are used and the impact they create.',
                  color: 'bg-red-500'
                },
                {
                  title: 'Inclusiveness',
                  description: 'We embrace diversity and ensure that everyone has equal access to opportunities and resources.',
                  color: 'bg-yellow-500'
                },
                {
                  title: 'Equitability',
                  description: 'We strive for fairness in the distribution of resources and opportunities based on individual needs.',
                  color: 'bg-indigo-500'
                },
                {
                  title: 'Innovation',
                  description: 'We continuously seek creative and effective solutions to address evolving challenges.',
                  color: 'bg-pink-500'
                },
                {
                  title: 'Team-work',
                  description: 'We foster a collaborative environment where diverse skills and perspectives come together for greater impact.',
                  color: 'bg-teal-500'
                }
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  className="bg-white p-6 rounded-xl shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-12 h-12 ${value.color} rounded-full flex items-center justify-center mb-4`}>
                    <span className="text-white font-bold text-xl">{index + 1}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display font-bold text-3xl text-gray-900 mb-4">Our Borad Members</h2>
              <p className="max-w-2xl mx-auto text-gray-600">
                Meet the dedicated individuals working tirelessly to make our mission a reality.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: 'Asmaru Berihun Kebede',
                  role: ' Board chair person',
                  image: '/Logo.png'
                },
                {
                  name: 'Hiwot Alemu Taffere',
                  role: 'Board Member',
                  image: '/Logo.png'
                },
                {
                  name: 'Etsegenet Alrmu',
                  role: 'Board Member',
                  image: '/Logo.png'
                },
                {
                  name: 'Assefa Negasa Gudeta',
                  role: 'Board Member',
                  image: '/Logo.png'
                },

                {
                  name: 'Alemu Taffere  Tessema',
                  role: 'CEO and Board Secretary without Vote',
                  image: '/Logo.png'
                },
                {
                  name: 'Endalk Alemu',
                  role: 'Deputy Chairperson',
                  image: '/Logo.png'
                },

                {
                  name: 'Mrs. Bizuhan Getnet Gedamu',
                  role: 'Project Manager of GID',
                  image: '/Bizuhan.png'
                },
                {
                  name: 'Denekew Berihun Kebede',
                  role: 'IT Expert and Foreign Relation Head',
                  image: '/Logo.png'
                },
                {
                  name: 'Elesabet Abuneha Mengesha',
                  role: 'Auditor',
                  image: '/elesabet.png'
                },
                {
                  name: 'Helom Fantahun  Yemam',
                  role: 'Cashier',
                  image: '/helom (1).png'
                },
                {
                  name: 'Samueal Wolelawu Amare',
                  role: 'Finance Head',
                  image: '/Logo.png'
                },
              ].map((member, index) => (
                <motion.div
                  key={member.name}
                  className="bg-white rounded-xl overflow-hidden shadow-md"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/300x300/0ea5e9/ffffff?text=' + member.name.split(' ').map(n => n[0]).join('');
                    }}
                  />
                  <div className="p-4 text-center">
                    <h3 className="font-display font-bold text-xl text-gray-900">{member.name}</h3>
                    <p className="text-primary-600">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;