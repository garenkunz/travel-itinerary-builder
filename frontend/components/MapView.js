import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const MapView = ({ activities, destination }) => {
  const [activeMarker, setActiveMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default map container style
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem'
  };

  // Map options
  const options = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
  };

  // Use Geocoding API to get coordinates for locations without coordinates
  const geocodeAddresses = async () => {
    setIsLoading(true);
    
    try {
      // First, try to geocode the destination to set initial map center
      const destinationResponse = await geocodeAddress(destination);
      if (destinationResponse) {
        setMapCenter(destinationResponse);
      }
      
      // Geocode each activity's location if coordinates are not available
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        
        // Skip if activity already has valid coordinates
        if (activity.location?.coordinates && 
            activity.location.coordinates.length === 2 && 
            activity.location.coordinates[0] !== 0 && 
            activity.location.coordinates[1] !== 0) {
          continue;
        }
        
        // Skip if no address
        if (!activity.location?.address || activity.location.address === 'Local area' || activity.location.address === 'Various locations') {
          continue;
        }
        
        // Geocode the address
        const coordinates = await geocodeAddress(`${activity.location.address}, ${destination}`);
        
        if (coordinates) {
          // Update activity with coordinates (only in state, not modifying props)
          activities[i] = {
            ...activity,
            location: {
              ...activity.location,
              coordinates: [coordinates.lng, coordinates.lat]
            }
          };
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error geocoding addresses:', err);
      setError('Failed to load map locations');
      setIsLoading(false);
    }
  };

  // Helper function to geocode an address
  const geocodeAddress = async (address) => {
    try {
      // In a real implementation, you would use Google's Geocoding API
      // For this prototype, we'll simulate with a mock response
      // This would be replaced with actual API call:
      // const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`);
      
      // Mock a slight delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock response based on common destinations
      if (address.includes('Paris')) {
        return { lat: 48.8566, lng: 2.3522 };
      } else if (address.includes('London')) {
        return { lat: 51.5074, lng: -0.1278 };
      } else if (address.includes('New York')) {
        return { lat: 40.7128, lng: -74.0060 };
      } else if (address.includes('Tokyo')) {
        return { lat: 35.6762, lng: 139.6503 };
      } else if (address.includes('Rome')) {
        return { lat: 41.9028, lng: 12.4964 };
      } else {
        // Generate a random point near the map center if no match
        return {
          lat: mapCenter.lat + (Math.random() - 0.5) * 0.05,
          lng: mapCenter.lng + (Math.random() - 0.5) * 0.05
        };
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  // Get map centered when component mounts
  useEffect(() => {
    geocodeAddresses();
  }, [destination, activities]);

  // Handle marker click
  const handleMarkerClick = (activityId) => {
    setActiveMarker(activityId);
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4d7b93]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={13}
        options={options}
      >
        {activities.map((activity, index) => {
          // Skip activities without proper coordinates
          if (!activity.location?.coordinates || 
              activity.location.coordinates.length !== 2 || 
              (activity.location.coordinates[0] === 0 && activity.location.coordinates[1] === 0)) {
            return null;
          }
          
          // Create marker position from activity coordinates (they're stored as [lng, lat] in MongoDB)
          const position = {
            lat: activity.location.coordinates[1],
            lng: activity.location.coordinates[0]
          };
          
          // Determine marker color based on activity category
          const markerIcon = {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
            fillColor: 
              activity.category === 'morning' ? '#4d7b93' : 
              activity.category === 'afternoon' ? '#8351a8' : 
              '#b45dbb',
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 1.5,
          };
          
          return (
            <Marker
              key={index}
              position={position}
              icon={markerIcon}
              onClick={() => handleMarkerClick(index)}
            >
              {activeMarker === index && (
                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                  <div className="p-2">
                    <h3 className="font-medium text-sm">{activity.title}</h3>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          );
        })}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapView;