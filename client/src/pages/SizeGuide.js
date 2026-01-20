// Create file: client/src/pages/SizeGuide.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  Ruler, 
  User, 
  Shirt, 
  Info, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Users,
  Baby,
  RefreshCw,
  Lightbulb,
  Camera,
  Calculator
} from 'lucide-react';

const SizeGuide = () => {
  const [selectedCategory, setSelectedCategory] = useState('men');
  const [selectedUnit, setSelectedUnit] = useState('cm');
  const [userMeasurements, setUserMeasurements] = useState({
    chest: '',
    height: '',
    weight: ''
  });
  const [recommendedSize, setRecommendedSize] = useState('');

  const siteUrl = process.env.REACT_APP_SITE_URL || window.location.origin;

  const categories = [
    { id: 'men', label: 'Men', icon: User },
    { id: 'women', label: 'Women', icon: Users },
    { id: 'unisex', label: 'Unisex', icon: Shirt },
    { id: 'kids', label: 'Kids', icon: Baby }
  ];

  const sizeCharts = {
    men: {
      title: "Men's T-Shirt Size Chart",
      sizes: [
        { size: 'XS', chest: { cm: '86-91', inches: '34-36' }, length: { cm: '66', inches: '26' }, shoulder: { cm: '41', inches: '16' } },
        { size: 'S', chest: { cm: '91-96', inches: '36-38' }, length: { cm: '69', inches: '27' }, shoulder: { cm: '44', inches: '17' } },
        { size: 'M', chest: { cm: '96-101', inches: '38-40' }, length: { cm: '72', inches: '28' }, shoulder: { cm: '47', inches: '18' } },
        { size: 'L', chest: { cm: '101-106', inches: '40-42' }, length: { cm: '75', inches: '29' }, shoulder: { cm: '50', inches: '19' } },
        { size: 'XL', chest: { cm: '106-111', inches: '42-44' }, length: { cm: '78', inches: '30' }, shoulder: { cm: '53', inches: '21' } },
        { size: 'XXL', chest: { cm: '111-116', inches: '44-46' }, length: { cm: '81', inches: '32' }, shoulder: { cm: '56', inches: '22' } }
      ]
    },
    women: {
      title: "Women's T-Shirt Size Chart",
      sizes: [
        { size: 'XS', chest: { cm: '81-86', inches: '32-34' }, length: { cm: '61', inches: '24' }, shoulder: { cm: '38', inches: '15' } },
        { size: 'S', chest: { cm: '86-91', inches: '34-36' }, length: { cm: '64', inches: '25' }, shoulder: { cm: '41', inches: '16' } },
        { size: 'M', chest: { cm: '91-96', inches: '36-38' }, length: { cm: '67', inches: '26' }, shoulder: { cm: '44', inches: '17' } },
        { size: 'L', chest: { cm: '96-101', inches: '38-40' }, length: { cm: '70', inches: '27' }, shoulder: { cm: '47', inches: '18' } },
        { size: 'XL', chest: { cm: '101-106', inches: '40-42' }, length: { cm: '73', inches: '29' }, shoulder: { cm: '50', inches: '19' } },
        { size: 'XXL', chest: { cm: '106-111', inches: '42-44' }, length: { cm: '76', inches: '30' }, shoulder: { cm: '53', inches: '21' } }
      ]
    },
    unisex: {
      title: "Unisex T-Shirt Size Chart",
      sizes: [
        { size: 'XS', chest: { cm: '84-89', inches: '33-35' }, length: { cm: '64', inches: '25' }, shoulder: { cm: '40', inches: '15.5' } },
        { size: 'S', chest: { cm: '89-94', inches: '35-37' }, length: { cm: '67', inches: '26' }, shoulder: { cm: '43', inches: '16.5' } },
        { size: 'M', chest: { cm: '94-99', inches: '37-39' }, length: { cm: '70', inches: '27' }, shoulder: { cm: '46', inches: '18' } },
        { size: 'L', chest: { cm: '99-104', inches: '39-41' }, length: { cm: '73', inches: '28' }, shoulder: { cm: '49', inches: '19' } },
        { size: 'XL', chest: { cm: '104-109', inches: '41-43' }, length: { cm: '76', inches: '30' }, shoulder: { cm: '52', inches: '20' } },
        { size: 'XXL', chest: { cm: '109-114', inches: '43-45' }, length: { cm: '79', inches: '31' }, shoulder: { cm: '55', inches: '21' } }
      ]
    },
    kids: {
      title: "Kids T-Shirt Size Chart",
      sizes: [
        { size: '2-3Y', chest: { cm: '56-58', inches: '22-23' }, length: { cm: '38', inches: '15' }, shoulder: { cm: '26', inches: '10' } },
        { size: '3-4Y', chest: { cm: '58-60', inches: '23-24' }, length: { cm: '41', inches: '16' }, shoulder: { cm: '28', inches: '11' } },
        { size: '4-5Y', chest: { cm: '60-62', inches: '24-25' }, length: { cm: '44', inches: '17' }, shoulder: { cm: '30', inches: '12' } },
        { size: '5-6Y', chest: { cm: '62-64', inches: '25-26' }, length: { cm: '47', inches: '18' }, shoulder: { cm: '32', inches: '13' } },
        { size: '7-8Y', chest: { cm: '66-68', inches: '26-27' }, length: { cm: '52', inches: '20' }, shoulder: { cm: '34', inches: '13.5' } },
        { size: '9-10Y', chest: { cm: '70-72', inches: '28-29' }, length: { cm: '57', inches: '22' }, shoulder: { cm: '36', inches: '14' } }
      ]
    }
  };

  const measurementSteps = [
    {
      title: "Chest/Bust",
      description: "Measure around the fullest part of your chest, keeping the tape measure horizontal.",
      icon: "chest",
      tip: "Keep the tape snug but not tight. Breathe normally while measuring."
    },
    {
      title: "Length",
      description: "Measure from the highest point of your shoulder to where you want the t-shirt to end.",
      icon: "length",
      tip: "This determines how long the t-shirt will be on your body."
    },
    {
      title: "Shoulder",
      description: "Measure from one shoulder point to the other across your back.",
      icon: "shoulder",
      tip: "Have someone help you with this measurement for accuracy."
    }
  ];

  const fitGuide = {
    'Regular Fit': {
      description: 'Classic comfortable fit with room to move',
      image: '/fit-guides/regular-fit.svg',
      characteristics: ['Comfortable through chest and waist', 'Not too loose or tight', 'Traditional t-shirt silhouette']
    },
    'Slim Fit': {
      description: 'Closer to the body for a modern silhouette',
      image: '/fit-guides/slim-fit.svg',
      characteristics: ['Tailored through the body', 'Follows your natural shape', 'Contemporary styling']
    },
    'Oversized': {
      description: 'Relaxed, trendy loose fit',
      image: '/fit-guides/oversized-fit.svg',
      characteristics: ['Deliberately loose fitting', 'Dropped shoulders', 'Casual, street-style look']
    }
  };

  const sizingTips = [
    {
      icon: Ruler,
      title: "Always Measure",
      description: "Don't guess your size. Use a measuring tape for accurate measurements."
    },
    {
      icon: RefreshCw,
      title: "Compare with Existing",
      description: "Measure a t-shirt that fits you well and compare with our size chart."
    },
    {
      icon: Lightbulb,
      title: "Consider Shrinkage",
      description: "Our t-shirts are pre-shrunk, but allow for 1-2% shrinkage with washing."
    },
    {
      icon: Camera,
      title: "Check Product Photos",
      description: "Look at how the t-shirt fits on our models for visual reference."
    }
  ];

  const getSizeRecommendation = () => {
    if (!userMeasurements.chest) return;

    const chest = parseFloat(userMeasurements.chest);
    const currentChart = sizeCharts[selectedCategory];
    
    for (const size of currentChart.sizes) {
      const [min, max] = size.chest[selectedUnit].split('-').map(val => {
        // Handle range like "86-91" or single values
        return parseFloat(val.replace(/[^0-9.-]/g, ''));
      });
      
      if (chest >= min && chest <= (max || min + 5)) {
        setRecommendedSize(size.size);
        return size.size;
      }
    }
    
    // If no exact match, recommend based on closest
    if (chest < parseFloat(currentChart.sizes[0].chest[selectedUnit].split('-')[0])) {
      setRecommendedSize(currentChart.sizes[0].size);
      return currentChart.sizes[0].size;
    } else {
      setRecommendedSize(currentChart.sizes[currentChart.sizes.length - 1].size);
      return currentChart.sizes[currentChart.sizes.length - 1].size;
    }
  };

  const currentChart = sizeCharts[selectedCategory];

  return (
    <>
      <SEO
        title="Size Guide - Find Your Perfect Fit | Gen-Z Fashion"
        description="Complete size guide for men's, women's, unisex, and kids t-shirts. Interactive size calculator, measurement tips, and fit guide to help you choose the right size."
        keywords="size guide, t-shirt sizing, measurement guide, fit guide, size chart, how to measure, clothing sizes"
        canonical={`${siteUrl}/size-guide`}
        image={`${siteUrl}/og-size-guide.jpg`}
      />

      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16 mt-4">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Size Guide
              </h1>
              <p className="text-xl opacity-90 mb-8">
                Find your perfect fit with our comprehensive sizing guide and interactive size calculator.
              </p>
              <div className="flex items-center justify-center space-x-2 text-lg">
                <Ruler className="w-6 h-6" />
                <span>Measure once, fit perfectly every time</span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Selection */}
        <section className="py-8 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Unit Toggle */}
              <div className="flex justify-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                  <button
                    onClick={() => setSelectedUnit('cm')}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      selectedUnit === 'cm'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Centimeters
                  </button>
                  <button
                    onClick={() => setSelectedUnit('inches')}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${
                      selectedUnit === 'inches'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Inches
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Measure Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  How to Measure Yourself
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Follow these simple steps to get accurate measurements
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                <div className="space-y-8">
                  {measurementSteps.map((step, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {step.description}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                          <Lightbulb className="w-4 h-4" />
                          <span>{step.tip}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Measurement Illustration */}
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-8 text-center">
                  <div className="w-48 h-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                    <Shirt className="w-24 h-24 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Measurement Points
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Use a flexible measuring tape and have someone help you for the most accurate measurements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Size Calculator */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Size Calculator
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter your measurements to get a personalized size recommendation
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Chest/Bust ({selectedUnit})
                      </label>
                      <input
                        type="number"
                        value={userMeasurements.chest}
                        onChange={(e) => setUserMeasurements(prev => ({...prev, chest: e.target.value}))}
                        placeholder={`Enter chest measurement in ${selectedUnit}`}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Height ({selectedUnit})
                      </label>
                      <input
                        type="number"
                        value={userMeasurements.height}
                        onChange={(e) => setUserMeasurements(prev => ({...prev, height: e.target.value}))}
                        placeholder={`Enter height in ${selectedUnit}`}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <button
                      onClick={getSizeRecommendation}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                    >
                      <Calculator className="w-5 h-5" />
                      <span>Calculate My Size</span>
                    </button>
                  </div>

                  {/* Recommendation Result */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Size Recommendation
                    </h3>
                    
                    {recommendedSize ? (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {recommendedSize}
                          </span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400 mb-4">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Recommended Size: {recommendedSize}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          Based on your measurements, we recommend size {recommendedSize} for the best fit.
                        </p>
                        <Link
                          to={`/products?category=${selectedCategory}`}
                          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
                        >
                          <span>Shop {recommendedSize} Size</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Enter your chest measurement to get a size recommendation</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Size Chart */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentChart.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  All measurements are in {selectedUnit === 'cm' ? 'centimeters' : 'inches'}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Size</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Chest/Bust</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Length</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Shoulder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentChart.sizes.map((size, index) => (
                      <tr 
                        key={size.size}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          recommendedSize === size.size ? 'bg-blue-50 dark:bg-blue-900' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{size.size}</span>
                            {recommendedSize === size.size && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{size.chest[selectedUnit]}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{size.length[selectedUnit]}</td>
                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{size.shoulder[selectedUnit]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Size Guide Notes:</h3>
                    <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                      <li>• All measurements are taken lying flat and may vary by ±1-2 {selectedUnit === 'cm' ? 'cm' : 'inch'}</li>
                      <li>• Our t-shirts are pre-shrunk but may shrink up to 2% after washing</li>
                      <li>• For between sizes, we recommend sizing up for comfort</li>
                      <li>• Models in photos are wearing size M for reference</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fit Guide */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Fit Guide
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Choose the fit that matches your style preference
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {Object.entries(fitGuide).map(([fitType, details]) => (
                  <div key={fitType} className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg">
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Shirt className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{fitType}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{details.description}</p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      {details.characteristics.map((char, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sizing Tips */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Pro Sizing Tips
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Expert advice for finding your perfect fit
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sizingTips.map((tip, index) => {
                  const IconComponent = tip.icon;
                  return (
                    <div key={index} className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tip.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{tip.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Still Unsure Section */}
        <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white mb-4">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Still Unsure About Sizing?
              </h2>
              <p className="text-xl opacity-90 mb-8">
                Don't worry! We offer free exchanges and our support team is here to help.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                  <RefreshCw className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Free Size Exchange</h3>
                  <p className="opacity-90">Wrong size? No problem! Exchange for free within 7 days.</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-6">
                  <User className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Personal Assistance</h3>
                  <p className="opacity-90">Chat with our sizing experts for personalized recommendations.</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  Get Size Help
                  <User className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/products"
                  className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
                >
                  Start Shopping
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SizeGuide;
