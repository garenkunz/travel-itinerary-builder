import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// This service handles the interaction with the OpenAI API for itinerary generation
// It should be placed in a services folder in your project

export const useItineraryGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const generateItinerary = async (formData) => {
    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return null;
      }

      // Format payload for the backend
      const payload = {
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? parseInt(formData.budget, 10) : undefined,
        interests: formData.interests,
        pace: formData.pace
      };

      // Call the backend API to generate itinerary
      const response = await axios.post('/api/itineraries/generate', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setIsGenerating(false);
      return response.data.data.itinerary;
    } catch (error) {
      setIsGenerating(false);
      
      const errorMessage = error.response?.data?.message || 'Failed to generate itinerary';
      setError(errorMessage);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate('/login');
      }
      
      return null;
    }
  };

  const regenerateActivity = async (itineraryId, dayIndex, activityIndex) => {
    setIsGenerating(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return null;
      }

      const response = await axios.post(`/api/itineraries/${itineraryId}/regenerate-activity`, {
        dayIndex,
        activityIndex
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setIsGenerating(false);
      return response.data.data.activity;
    } catch (error) {
      setIsGenerating(false);
      
      const errorMessage = error.response?.data?.message || 'Failed to regenerate activity';
      setError(errorMessage);
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
      
      return null;
    }
  };

  return {
    isGenerating,
    error,
    generateItinerary,
    regenerateActivity
  };
};

export default useItineraryGenerator;