// File: /components/ActivityCard.jsx

import { useState } from 'react';
import axios from 'axios';

function ActivityCard({ activity, dayIndex, activityIndex, itineraryId, onUpdate }) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to regenerate this specific activity
  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      setError(null);
      
      const response = await axios.post(
        `/api/itineraries/${itineraryId}/regenerate-activity`,
        { dayIndex, activityIndex }
      );
      
      // Call the parent component's update function with the updated itinerary
      onUpdate(response.data.itinerary);
      
      setIsRegenerating(false);
    } catch (error) {
      console.error('Error regenerating activity:', error);
      setError('Failed to regenerate activity. Please try again.');
      setIsRegenerating(false);
    }
  };
  
  return (
    <div className="activity-card p-4 border rounded-lg shadow-sm mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{activity.title}</h3>
          <span className="text-sm text-gray-600">{activity.time} • {activity.duration}</span>
          <p className="mt-2">{activity.description}</p>
        </div>
        
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className={`regenerate-btn ml-2 p-2 rounded ${
            isRegenerating ? 'bg-gray-300' : 'bg-purple-600 hover:bg-purple-700'
          } text-white text-sm`}
        >
          {isRegenerating ? (
            <span className="flex items-center">
              <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Regenerating...
            </span>
          ) : (
            'Regenerate'
          )}
        </button>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}

export default ActivityCard;