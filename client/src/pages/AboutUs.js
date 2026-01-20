// Create file: client/src/pages/AboutUs.js
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  Heart, 
  Users, 
  Truck, 
  Shield, 
  Award, 
  Leaf, 
  Target,
  Star,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const AboutUs = () => {
  const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;

  const stats = [
    { number: '10,000+', label: 'Happy Customers', icon: Users },
    { number: '50,000+', label: 'Products Sold', icon: Award },
    { number: '500+', label: 'Unique Designs', icon: Star },
    { number: '24/7', label: 'Customer Support', icon: Shield }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Quality First',
      description: 'We use only premium materials and advanced printing techniques to ensure every t-shirt meets our high standards.',
      color: 'text-red-500'
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'Our customers are at the heart of everything we do. We listen, adapt, and continuously improve based on your feedback.',
      color: 'text-blue-500'
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly',
      description: 'We are committed to sustainable practices, using eco-friendly materials and minimizing our environmental impact.',
      color: 'text-green-500'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'We constantly innovate our designs and processes to bring you the latest trends and highest quality products.',
      color: 'text-purple-500'
    }
  ];

  const teamMembers = [
    {
      name: 'Souvik Dalui',
      role: 'Founder & CEO',
      image: '/team/ceo.jpg',
      description: 'Passionate about fashion and technology, Souvik founded Gen-Z Fashion to bring unique designs to the digital generation.',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Soumya Das',
      role: 'Head of Design',
      image: '/team/designer.jpg',
      description: 'Creative visionary with 8+ years in fashion design, Soumya Das our design team to create trending and timeless pieces.',
      social: { linkedin: '#', instagram: '#' }
    },
    {
      name: 'Soumya Das',
      role: 'Quality Manager',
      image: '/team/quality.jpg',
      description: 'Ensuring every product meets our quality standards, Soumya oversees production and quality control processes.',
      social: { linkedin: '#' }
    },
    {
      name: 'Souvik Dalui',
      role: 'Customer Experience',
      image: '/team/support.jpg',
      description: 'Dedicated to customer satisfaction, Souvik Dalui our support team to provide exceptional service experiences.',
      social: { linkedin: '#', twitter: '#' }
    }
  ];

  const milestones = [
    { year: '2020', title: 'Company Founded', description: 'Started with a vision to revolutionize online t-shirt shopping' },
    { year: '2021', title: 'First 1000 Customers', description: 'Reached our first milestone of satisfied customers' },
    { year: '2022', title: 'Eco-Friendly Initiative', description: 'Launched sustainable product line and green packaging' },
    { year: '2023', title: 'International Expansion', description: 'Expanded shipping to 15+ countries worldwide' },
    { year: '2024', title: '10,000+ Happy Customers', description: 'Celebrating incredible growth and customer trust' }
  ];

  return (
    <>
      <SEO
        title="About Us - Gen-Z Fashion | Premium T-Shirts Online"
        description="Learn about Gen-Z Fashion's journey, values, and commitment to providing high-quality t-shirts. Meet our team and discover our story."
        keywords="about gen-z fashion, our story, team, quality t-shirts, sustainable fashion, customer service"
        canonical={`${siteUrl}/about`}
        image={`${siteUrl}/og-about.jpg`}
      />

      <div className="bg-gray-50 dark:bg-gray-900 transition-colors">
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative container mx-auto px-4 py-20 lg:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                About <span className="text-yellow-300">Gen-Z Fashion</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
                Crafting premium t-shirts for the digital generation. Where style meets comfort, 
                and quality meets affordability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  Shop Our Collection
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <a
                  href="#story"
                  className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-colors inline-flex items-center justify-center"
                >
                  Our Story
                </a>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-300 rounded-full opacity-20 animate-pulse delay-1000"></div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white dark:bg-gray-800 transition-colors">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section id="story" className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                    Our Story
                  </h2>
                  <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p>
                      Gen-Z Fashion was born from a simple idea: to create high-quality, 
                      stylish t-shirts that speak to the digital generation. In 2020, 
                      we started our journey with a passion for fashion and a commitment 
                      to excellence.
                    </p>
                    <p>
                      What began as a small startup has grown into a trusted brand, 
                      serving thousands of customers worldwide. We believe that clothing 
                      is more than just fabric – it's a form of self-expression, a way 
                      to show the world who you are.
                    </p>
                    <p>
                      Every t-shirt we create is crafted with care, using premium materials 
                      and innovative designs that reflect the spirit of today's youth. 
                      We're not just selling clothes; we're building a community of 
                      fashion-forward individuals who value quality and authenticity.
                    </p>
                  </div>
                  
                  <div className="mt-8 flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Premium Quality Materials</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Sustainable Practices</span>
                    </div>
                    <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Global Shipping</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-8 text-white">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">2020</div>
                        <div className="text-lg opacity-90">Founded</div>
                      </div>
                      <div className="border-t border-white/20 pt-6">
                        <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
                        <p className="opacity-90 leading-relaxed">
                          To provide high-quality, stylish, and affordable t-shirts 
                          while building a sustainable future for fashion.
                        </p>
                      </div>
                      <div className="border-t border-white/20 pt-6">
                        <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
                        <p className="opacity-90 leading-relaxed">
                          To become the world's most trusted online destination 
                          for premium t-shirts and casual wear.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Values
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  These core values guide everything we do, from product design to customer service.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => {
                  const IconComponent = value.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl text-center hover:shadow-lg transition-shadow"
                    >
                      <div className={`w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mx-auto mb-6 shadow-md`}>
                        <IconComponent className={`w-8 h-8 ${value.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Journey
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Key milestones in our growth story
                </p>
              </div>
              
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 dark:bg-blue-800"></div>
                
                {milestones.map((milestone, index) => (
                  <div key={index} className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}>
                    {/* Timeline Node */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 z-10"></div>
                    
                    {/* Content */}
                    <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-white dark:bg-gray-800 transition-colors">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Meet Our Team
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  The passionate individuals behind Gen-Z Fashion, working to bring you the best t-shirt experience.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {member.name}
                    </h3>
                    <div className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                      {member.role}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Get In Touch
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                Have questions or want to learn more? We'd love to hear from you!
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Us</h3>
                  <p className="text-gray-600 dark:text-gray-300">tshirtwala247@gmail.com</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Call Us</h3>
                  <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Visit Us</h3>
                  <p className="text-gray-600 dark:text-gray-300">New York, NY 10001</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-colors inline-flex items-center justify-center"
                >
                  Contact Us
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/products"
                  className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-semibold transition-colors inline-flex items-center justify-center"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;
