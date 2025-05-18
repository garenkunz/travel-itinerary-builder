// 1. First, install the required packages
// Run this command in your terminal:
// npm install @react-google-maps/api

// 2. Create a Map component

// File: /components/Map.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060 // New York as default
};

function Map({ activities, destination }) {
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  
  // Load the Google Maps JS API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });
  
  // Function to geocode destination and activities
  const geocodeLocations = useCallback(async () => {
    if (!window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    
    // Geocode the destination to center the map
    if (destination) {
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const { lat, lng } = results[0].geometry.location;
          setMapCenter({ lat: lat(), lng: lng() });
        }
      });
    }
    
    // Geocode each activity location
    if (activities && activities.length > 0) {
      const newMarkers = [];
      
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const searchTerm = `${activity.title}, ${destination}`;
        
        // Use a timeout to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
        geocoder.geocode({ address: searchTerm }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const { lat, lng } = results[0].geometry.location;
            newMarkers.push({
              id: i,
              position: { lat: lat(), lng: lng() },
              title: activity.title,
              description: activity.description,
              time: activity.time
            });
            
            // Update state after processing all activities
            if (i === activities.length - 1 || newMarkers.length === activities.length) {
              setMarkers(newMarkers);
            }
          }
        });
      }
    }
  }, [destination, activities]);
  
  // Set up markers when map is loaded and activities change
  useEffect(() => {
    if (isLoaded && activities && activities.length > 0) {
      geocodeLocations();
    }
  }, [isLoaded, activities, geocodeLocations]);
  
  // Handle click on marker
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };
  
  // Close info window when clicking on map
  const handleMapClick = () => {
    setSelectedMarker(null);
  };
  
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;
  
  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
        onClick={handleMapClick}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            title={marker.title}
            onClick={() => handleMarkerClick(marker)}
          />
        ))}
        
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="info-window">
              <h3 className="text-lg font-bold">{selectedMarker.title}</h3>
              <p className="text-sm text-gray-600">{selectedMarker.time}</p>
              <p className="text-sm mt-1">{selectedMarker.description}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default Map;

import Map from '@/components/Map';
// ...other imports

export default function ItineraryView({ params }) {
  const [itinerary, setItinerary] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  // ...other state and hooks

  // Filter activities for the current day only
  const currentActivities = itinerary?.days[currentDay]?.activities || [];

  return (
    <div className="itinerary-container">
      {/* Other itinerary content */}
      
      {/* Add the map component */}
      <div className="map-section mt-8">
        <h3 className="text-xl font-semibold mb-4">Map View</h3>
        <Map 
          activities={currentActivities} 
          destination={itinerary?.destination} 
        />
      </div>
      
      {/* Rest of your itinerary view */}
    </div>
  );
}