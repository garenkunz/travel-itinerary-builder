"use client";

import React, { useState } from 'react';
import { MapPin, Calendar, DollarSign, Activity, Share2, Download } from 'lucide-react';
import Link from 'next/link';

export default function Page(): React.ReactNode {
  const [activeSection, setActiveSection] = useState('hero');
  
  // Form data state
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    interests: [],
    pace: 'Balanced'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleInterestChange = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(item => item !== interest)
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowItinerary(true);
      setActiveSection('itinerary');
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#4d7b93] to-[#8351a8] text-transparent bg-clip-text">WanderPlan</span>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li><Link href="#how-it-works" className="text-gray-800 hover:text-[#4d7b93] transition">How It Works</Link></li>
              <li><Link href="#pricing" className="text-gray-800 hover:text-[#4d7b93] transition">Pricing</Link></li>
              <li><Link href="/login" className="text-gray-800 hover:text-[#4d7b93] transition">Sign In</Link></li>
              <li><Link href="/register" className="bg-[#4d7b93] text-white px-4 py-2 rounded-md hover:bg-[#3c6175] transition">Sign Up</Link></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="pt-20">
        {/* Hero Section */}
        {activeSection === 'hero' && (
          <section className="bg-gradient-to-br from-white to-[#f5f5f5] py-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-10 md:mb-0">
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">Plan Your Dream Trip in Minutes</h1>
                  <p className="text-lg text-gray-800 mb-8">Create personalized travel itineraries with AI. Simple, beautiful, and tailored to your interests.</p>
                  <button 
                    onClick={() => setActiveSection('form')}
                    className="bg-[#8351a8] text-white px-6 py-3 rounded-md hover:bg-[#6f3d91] transition text-lg font-medium"
                  >
                    Create Your Itinerary
                  </button>
                </div>
                <div className="md:w-1/2">
                  <div className="relative rounded-lg overflow-hidden shadow-xl">
                    {/* Replace the image with a placeholder div */}
                    <div className="w-full h-64 bg-gray-200 rounded-lg">
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-gray-700">Destination Image</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <h3 className="text-2xl font-bold">Discover amazing destinations</h3>
                        <p>Get personalized recommendations based on your interests</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Form Section */}
        {activeSection === 'form' && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-3xl font-bold mb-6 text-center">Create Your Perfect Itinerary</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">Destination</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        placeholder="Where are you going?"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4d7b93]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Start Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4d7b93]"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">End Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4d7b93]"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">Budget (Optional)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="Your approximate budget"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4d7b93]"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">Interests</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Food', 'History', 'Outdoors', 'Nightlife', 'Culture', 'Family-friendly', 'Relaxation'].map((interest) => (
                        <div 
                          key={interest}
                          onClick={() => handleInterestChange(interest)}
                          className={`cursor-pointer border rounded-md px-4 py-2 text-center transition ${
                            formData.interests.includes(interest) 
                              ? 'bg-[#4d7b93] text-white border-[#4d7b93]' 
                              : 'border-gray-300 hover:border-[#4d7b93]'
                          }`}
                        >
                          {interest}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <label className="block text-gray-700 mb-2 font-medium">Preferred Pace</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Relaxed', 'Balanced', 'Ambitious'].map((pace) => (
                        <div 
                          key={pace}
                          onClick={() => setFormData({...formData, pace})}
                          className={`cursor-pointer border rounded-md px-4 py-2 text-center transition ${
                            formData.pace === pace 
                              ? 'bg-[#8351a8] text-white border-[#8351a8]' 
                              : 'border-gray-300 hover:border-[#8351a8]'
                          }`}
                        >
                          {pace}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-[#b45dbb] text-white py-3 rounded-md hover:bg-[#9c4ea0] transition font-medium text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating your perfect itinerary...' : 'Create Itinerary'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
        
        {/* Itinerary View Section */}
        {showItinerary && activeSection === 'itinerary' && (
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{formData.destination} Itinerary</h2>
                  <div className="flex space-x-2">
                    <button className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition">
                      <Share2 size={18} className="mr-2" />
                      Share
                    </button>
                    <button className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition">
                      <Download size={18} className="mr-2" />
                      Download PDF
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2">
                    {/* Day 1 */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4 text-[#4d7b93]">Day 1</h3>
                      
                      <div className="mb-6">
                        <div className="flex items-start">
                          <div className="bg-[#f5f5f5] rounded-full p-2 mr-4">
                            <span className="text-[#4d7b93] font-bold">AM</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">Breakfast at Local Café</h4>
                            <p className="text-gray-800 mb-2">Start your day with authentic local cuisine at this charming café</p>
                            <p className="text-sm text-gray-700">9:00 AM - 10:30 AM • $15-25 per person</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex items-start">
                          <div className="bg-[#f5f5f5] rounded-full p-2 mr-4">
                            <span className="text-[#8351a8] font-bold">PM</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">Historical Walking Tour</h4>
                            <p className="text-gray-800 mb-2">Explore the city's rich history with an expert local guide</p>
                            <p className="text-sm text-gray-700">1:00 PM - 3:30 PM • $30 per person</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex items-start">
                          <div className="bg-[#f5f5f5] rounded-full p-2 mr-4">
                            <span className="text-[#b45dbb] font-bold">EVE</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">Dinner at Oceanfront Restaurant</h4>
                            <p className="text-gray-800 mb-2">Enjoy fresh seafood with stunning views of the sunset</p>
                            <p className="text-sm text-gray-700">7:00 PM - 9:00 PM • $40-60 per person</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Day 2 */}
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-[#4d7b93]">Day 2</h3>
                      
                      <div className="mb-6">
                        <div className="flex items-start">
                          <div className="bg-[#f5f5f5] rounded-full p-2 mr-4">
                            <span className="text-[#4d7b93] font-bold">AM</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">Museum Visit</h4>
                            <p className="text-gray-800 mb-2">Immerse yourself in culture at this world-class museum</p>
                            <p className="text-sm text-gray-700">10:00 AM - 12:30 PM • $22 per person</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <div className="flex items-start">
                          <div className="bg-[#f5f5f5] rounded-full p-2 mr-4">
                            <span className="text-[#8351a8] font-bold">PM</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">Beach Relaxation</h4>
                            <p className="text-gray-800 mb-2">Unwind at the beautiful sandy beaches with crystal clear waters</p>
                            <p className="text-sm text-gray-700">2:00 PM - 5:00 PM • Free</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-start">
                          <div className="bg-[#f5f5f5] rounded-full p-2 mr-4">
                            <span className="text-[#b45dbb] font-bold">EVE</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">Cultural Show & Dinner</h4>
                            <p className="text-gray-800 mb-2">Experience traditional performances while enjoying local cuisine</p>
                            <p className="text-sm text-gray-700">7:30 PM - 10:00 PM • $55 per person</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:w-1/2 bg-gray-100 rounded-lg p-4 h-96">
                    {/* Map placeholder */}
                    <div className="h-full w-full flex items-center justify-center bg-gray-200 rounded-lg">
                      <p className="text-gray-700">Interactive Map would appear here</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="mb-4 text-gray-800">Not quite what you're looking for?</p>
                  <button className="bg-[#4d7b93] text-white px-6 py-2 rounded-md hover:bg-[#3c6175] transition mr-4">
                    Regenerate Itinerary
                  </button>
                  <button 
                    onClick={() => setActiveSection('form')}
                    className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition"
                  >
                    Edit Preferences
                  </button>
                </div>
              </div>
              
              <div className="bg-[#f5f5f5] rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold mb-3">Unlock Premium Features</h3>
                <p className="text-gray-800 mb-4">Get unlimited itineraries, exclusive recommendations, and more!</p>
                <button className="bg-[#8351a8] text-white px-6 py-2 rounded-md hover:bg-[#6f3d91] transition">
                  Upgrade to Premium ($30/month)
                </button>
              </div>
            </div>
          </section>
        )}
        
        {/* Features Section */}
        <section id="how-it-works" className="py-16 bg-[#f5f5f5]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-[#4d7b93]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="text-[#4d7b93]" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Tell Us Your Preferences</h3>
                <p className="text-gray-800">Share your destination, dates, and interests to get personalized recommendations.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-[#8351a8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="text-[#8351a8]" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Creates Your Itinerary</h3>
                <p className="text-gray-800">Our AI generates a tailored day-by-day plan based on your unique preferences.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-[#b45dbb]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="text-[#b45dbb]" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Customize & Share</h3>
                <p className="text-gray-800">Easily modify your itinerary, add personal notes, and share with your travel companions.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Simple Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="border border-gray-200 rounded-lg p-8">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <p className="text-gray-800 mb-6">Perfect for occasional travelers</p>
                <p className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-700 font-normal">/month</span></p>
                
                <ul className="mb-8 space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    3 itineraries per month
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Basic customization
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    PDF download
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    Premium recommendations
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    Exclusive deals
                  </li>
                </ul>
                
                <button className="w-full border border-[#4d7b93] text-[#4d7b93] py-2 rounded-md hover:bg-[#4d7b93]/5 transition">
                  Get Started
                </button>
              </div>
              
              <div className="border-2 border-[#8351a8] rounded-lg p-8 relative">
                <div className="absolute top-0 right-0 bg-[#8351a8] text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                  POPULAR
                </div>
                
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <p className="text-gray-800 mb-6">For serious travelers</p>
                <p className="text-4xl font-bold mb-6">$30<span className="text-lg text-gray-700 font-normal">/month</span></p>
                
                <ul className="mb-8 space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <strong>Unlimited</strong> itineraries
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Full customization options
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    PDF & interactive downloads
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Premium recommendations
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Exclusive deals & discounts
                  </li>
                </ul>
                <button className="w-full bg-[#8351a8] text-white py-2 rounded-md hover:bg-[#6f3d91] transition">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer Section */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">WanderPlan</h3>
                <p className="text-gray-400">Create personalized travel itineraries with AI in minutes.</p>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Careers</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Press</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
                  <li><Link href="#" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Connect</h4>
                <div className="flex space-x-4">
                  <Link href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </Link>
                  <Link href="#" className="text-gray-400 hover:text-white transition">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>© 2025 WanderPlan. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}