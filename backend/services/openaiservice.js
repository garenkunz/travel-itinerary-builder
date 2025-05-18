// services/openaiService.js
const { differenceInDays, addDays, format } = require('date-fns');
let OpenAI;
let openai;

try {
  OpenAI = require("openai");
  
  // Hardcode the API key directly (for development only, not recommended for production)
  const API_KEY = "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";
  
  openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
  });
  
  console.log("REAL OPENAI INITIALIZED WITH HARDCODED KEY");
} catch (err) {
  console.error("Failed to initialize OpenAI:", err);
  console.log("USING MOCK OPENAI SERVICE FALLBACK");
}

/**
 * Generate a travel itinerary
 */
exports.generateItinerary = async (itineraryData) => {
  try {
    console.log('Generating itinerary for', itineraryData.destination);
    
    const {
      destination,
      startDate,
      endDate,
      budget,
      interests,
      pace
    } = itineraryData;

    // Calculate trip duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const tripDuration = differenceInDays(end, start) + 1;

    // Create a title for the itinerary
    const title = `${tripDuration}-Day ${destination} Adventure`;

    // Try to use OpenAI if available
    if (openai) {
      try {
        // Create detailed prompt for OpenAI
        const prompt = createPrompt(itineraryData, tripDuration);
        
        // Call OpenAI API
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert travel planner with vast knowledge about destinations worldwide. You create detailed, realistic travel itineraries."
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.7,
          max_tokens: 2500
        });

        // Parse the response from OpenAI
        const itineraryContent = response.choices[0].message.content;
        const days = parseItinerary(itineraryContent, start, tripDuration, destination);

        // Construct complete itinerary object
        return {
          title,
          destination,
          startDate,
          endDate,
          budget: budget || undefined,
          interests,
          pace,
          days
        };
      } catch (openaiError) {
        console.error("OpenAI API Error:", openaiError);
        console.log("Falling back to mock data due to OpenAI API error");
        // Fall back to mock data if API call fails
      }
    } 
    
    // If OpenAI is not available or API call failed, use mock data
    console.log("Using mock data for itinerary generation");
    return {
      title,
      destination,
      startDate,
      endDate,
      budget: budget || undefined,
      interests,
      pace,
      days: createMockItinerary(start, tripDuration, destination)
    };
  } catch (error) {
    console.error('Itinerary Generation Error:', error);
    throw error;
  }
};

/**
 * Create a detailed prompt for OpenAI
 */
function createPrompt(itineraryData, tripDuration) {
  const {
    destination,
    startDate,
    endDate,
    budget,
    interests,
    pace
  } = itineraryData;

  let prompt = `Create a detailed ${tripDuration}-day travel itinerary for ${destination} from ${format(new Date(startDate), 'MMMM d, yyyy')} to ${format(new Date(endDate), 'MMMM d, yyyy')}.`;
  
  // Add interests
  if (interests && interests.length > 0) {
    prompt += ` The traveler is interested in: ${interests.join(', ')}.`;
  }
  
  // Add pace preference
  prompt += ` The traveler prefers a ${pace.toLowerCase()} pace.`;
  
  // Add budget if specified
  if (budget) {
    prompt += ` The approximate budget is $${budget}.`;
  }

  // Formatting instructions
  prompt += `\n\nFor each day, please include:
1. Morning activity (include time, title, description, approximate duration, cost if applicable, and location)
2. Afternoon activity (include time, title, description, approximate duration, cost if applicable, and location)
3. Evening activity (include time, title, description, approximate duration, cost if applicable, and location)

Format your response as JSON with the following structure:
{
  "days": [
    {
      "dayNumber": 1,
      "activities": [
        {
          "category": "morning",
          "time": "9:00 AM - 11:30 AM",
          "title": "Activity Title",
          "description": "Detailed description",
          "duration": "2.5 hours",
          "cost": "$XX",
          "location": {
            "address": "Location name or address",
            "coordinates": [0, 0]
          }
        },
        // afternoon and evening activities with same structure
      ]
    },
    // repeat for each day
  ]
}`;

  return prompt;
}

/**
 * Parse the OpenAI response into a structured itinerary
 */
function parseItinerary(content, startDate, tripDuration, destination) {
  try {
    // Extract JSON object from the response
    const jsonStr = content.match(/\{[\s\S]*\}/);
    
    if (!jsonStr) {
      throw new Error('Could not parse itinerary from OpenAI response');
    }
    
    const parsedData = JSON.parse(jsonStr[0]);
    
    // Ensure each day has the correct date
    const days = parsedData.days.map((day, index) => {
      const date = addDays(new Date(startDate), index);
      
      return {
        ...day,
        date: date.toISOString(),
        dayNumber: index + 1
      };
    });
    
    return days;
  } catch (error) {
    console.error('Error parsing itinerary:', error);
    
    // If parsing fails, create a basic placeholder structure
    return createMockItinerary(startDate, tripDuration, destination);
  }
}

/**
 * Create a mock itinerary for fallback
 */
function createMockItinerary(startDate, tripDuration, destination) {
  const days = [];
  
  // Activities for different times of day
  const morningActivities = [
    {
      title: 'Breakfast at Local Café',
      description: 'Start your day with authentic local cuisine at a charming café in the heart of the city.',
      time: '9:00 AM - 10:30 AM',
      duration: '1.5 hours',
      cost: '$15-25 per person',
      location: {
        address: `Downtown ${destination} Café`,
        coordinates: [0, 0]
      }
    },
    {
      title: 'Morning Walking Tour',
      description: `Explore the historic neighborhoods of ${destination} with an expert local guide.`,
      time: '9:00 AM - 11:30 AM',
      duration: '2.5 hours',
      cost: '$30 per person',
      location: {
        address: `Historic District, ${destination}`,
        coordinates: [0, 0]
      }
    },
    {
      title: 'Visit to the Museum',
      description: `Learn about the rich cultural heritage of ${destination} at the national museum.`,
      time: '10:00 AM - 12:30 PM',
      duration: '2.5 hours',
      cost: '$22 per person',
      location: {
        address: `National Museum of ${destination}`,
        coordinates: [0, 0]
      }
    }
  ];
  
  const afternoonActivities = [
    {
      title: 'Shopping at Local Markets',
      description: `Browse through the vibrant markets of ${destination} for souvenirs and local crafts.`,
      time: '1:00 PM - 3:00 PM',
      duration: '2 hours',
      cost: 'Varies',
      location: {
        address: `Central Market, ${destination}`,
        coordinates: [0, 0]
      }
    },
    {
      title: 'Beach Relaxation',
      description: `Unwind at the beautiful beaches of ${destination} with crystal clear waters.`,
      time: '2:00 PM - 5:00 PM',
      duration: '3 hours',
      cost: 'Free',
      location: {
        address: `Main Beach, ${destination}`,
        coordinates: [0, 0]
      }
    },
    {
      title: 'Scenic Hike',
      description: `Take in the breathtaking views of ${destination} from this panoramic hiking trail.`,
      time: '2:30 PM - 5:00 PM',
      duration: '2.5 hours',
      cost: 'Free or $10 park entry',
      location: {
        address: `Nature Reserve, ${destination}`,
        coordinates: [0, 0]
      }
    }
  ];
  
  const eveningActivities = [
    {
      title: 'Dinner at Oceanfront Restaurant',
      description: `Enjoy fresh seafood with stunning views of the ${destination} coastline.`,
      time: '7:00 PM - 9:00 PM',
      duration: '2 hours',
      cost: '$40-60 per person',
      location: {
        address: `Shoreline Restaurant, ${destination}`,
        coordinates: [0, 0]
      }
    },
    {
      title: 'Cultural Show & Dinner',
      description: `Experience traditional performances while enjoying authentic ${destination} cuisine.`,
      time: '7:30 PM - 10:00 PM',
      duration: '2.5 hours',
      cost: '$55 per person',
      location: {
        address: `Cultural Center, ${destination}`,
        coordinates: [0, 0]
      }
    },
    {
      title: 'Night Walking Tour',
      description: `Discover the charm of ${destination} after dark with this guided tour.`,
      time: '8:00 PM - 10:00 PM',
      duration: '2 hours',
      cost: '$25 per person',
      location: {
        address: `City Center, ${destination}`,
        coordinates: [0, 0]
      }
    }
  ];
  
  // Create itinerary days
  for (let i = 0; i < tripDuration; i++) {
    const date = addDays(new Date(startDate), i);
    const dayNumber = i + 1;
    
    // Select activities for each time of day
    const getMorningActivity = () => {
      const index = Math.floor(Math.random() * morningActivities.length);
      return { ...morningActivities[index], category: 'morning' };
    };
    
    const getAfternoonActivity = () => {
      const index = Math.floor(Math.random() * afternoonActivities.length);
      return { ...afternoonActivities[index], category: 'afternoon' };
    };
    
    const getEveningActivity = () => {
      const index = Math.floor(Math.random() * eveningActivities.length);
      return { ...eveningActivities[index], category: 'evening' };
    };
    
    // Create day with activities
    days.push({
      date: date.toISOString(),
      dayNumber,
      activities: [
        getMorningActivity(),
        getAfternoonActivity(),
        getEveningActivity()
      ]
    });
  }
  
  return days;
}

/**
 * Regenerate a specific activity
 */
exports.regenerateActivity = async (itineraryData, dayIndex, activityIndex) => {
  try {
    const day = itineraryData.days[dayIndex];
    const existingActivity = day.activities[activityIndex];
    const { category } = existingActivity;
    
    // Try to use OpenAI if available
    if (openai) {
      try {
        // Create prompt for regenerating the activity
        const prompt = `I need a new ${category} activity for day ${day.dayNumber} of my trip to ${itineraryData.destination}.
        
My interests include: ${itineraryData.interests.join(', ')}.
I prefer a ${itineraryData.pace.toLowerCase()} pace.
${itineraryData.budget ? `My budget is approximately $${itineraryData.budget}.` : ''}

Please generate a new activity with the following JSON structure:
{
  "category": "${category}",
  "time": "Time slot (e.g., 9:00 AM - 11:30 AM)",
  "title": "Activity Title",
  "description": "Detailed description",
  "duration": "Duration (e.g., 2.5 hours)",
  "cost": "Approximate cost",
  "location": {
    "address": "Location name or address",
    "coordinates": [0, 0]
  }
}`;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert travel planner providing detailed activity suggestions."
            },
            { 
              role: "user", 
              content: prompt 
            }
          ],
          temperature: 0.8,
          max_tokens: 500
        });

        // Parse the response
        const content = response.choices[0].message.content;
        const jsonStr = content.match(/\{[\s\S]*\}/);
        
        if (!jsonStr) {
          throw new Error('Could not parse activity from OpenAI response');
        }
        
        return JSON.parse(jsonStr[0]);
      } catch (openaiError) {
        console.error("OpenAI API Error (regenerate activity):", openaiError);
        console.log("Falling back to mock data for activity regeneration");
      }
    }
    
    // If OpenAI is not available or API call failed, use mock data
    console.log("Using mock data for activity regeneration");
      
    // Mock activity data
    const mockActivities = {
      morning: [
        {
          category: 'morning',
          title: 'Sunrise Yoga',
          description: `Start your day with an energizing yoga session overlooking ${itineraryData.destination}.`,
          time: '7:00 AM - 8:30 AM',
          duration: '1.5 hours',
          cost: '$20 per person',
          location: {
            address: `Beach Front, ${itineraryData.destination}`,
            coordinates: [0, 0]
          }
        },
        {
          category: 'morning',
          title: 'Local Food Tour',
          description: `Sample the best breakfast foods ${itineraryData.destination} has to offer on this guided culinary tour.`,
          time: '9:00 AM - 11:30 AM',
          duration: '2.5 hours',
          cost: '$45 per person',
          location: {
            address: `Food District, ${itineraryData.destination}`,
            coordinates: [0, 0]
          }
        }
      ],
      afternoon: [
        {
          category: 'afternoon',
          title: 'Bike Tour',
          description: `Explore ${itineraryData.destination} on two wheels with this guided bike tour.`,
          time: '1:00 PM - 3:30 PM',
          duration: '2.5 hours',
          cost: '$35 per person including bike rental',
          location: {
            address: `City Center, ${itineraryData.destination}`,
            coordinates: [0, 0]
          }
        },
        {
          category: 'afternoon',
          title: 'Cooking Class',
          description: `Learn to prepare traditional ${itineraryData.destination} dishes from a local chef.`,
          time: '2:00 PM - 4:30 PM',
          duration: '2.5 hours',
          cost: '$65 per person',
          location: {
            address: `Culinary School, ${itineraryData.destination}`,
            coordinates: [0, 0]
          }
        }
      ],
      evening: [
        {
          category: 'evening',
          title: 'Sunset Cruise',
          description: `Enjoy the stunning ${itineraryData.destination} sunset from the water on this relaxing cruise.`,
          time: '6:00 PM - 8:00 PM',
          duration: '2 hours',
          cost: '$55 per person',
          location: {
            address: `Marina, ${itineraryData.destination}`,
            coordinates: [0, 0]
          }
        },
        {
          category: 'evening',
          title: 'Live Music Experience',
          description: `Experience the vibrant music scene of ${itineraryData.destination} at this popular venue.`,
          time: '8:00 PM - 10:30 PM',
          duration: '2.5 hours',
          cost: '$30 per person',
          location: {
            address: `Music Venue, ${itineraryData.destination}`,
            coordinates: [0, 0]
          }
        }
      ]
    };
    
    // Select a random new activity for the category
    const activities = mockActivities[category];
    const randomIndex = Math.floor(Math.random() * activities.length);
    
    return activities[randomIndex];
  } catch (error) {
    console.error('Regenerate Activity Error:', error);
    throw error;
  }
};