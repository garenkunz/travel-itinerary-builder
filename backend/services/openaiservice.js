// File: /backend/services/openaiService.js
const OpenAI = require('openai');

// Initialize with environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback to mock data if API call fails
const generateMockItinerary = require('./mockOpenaiService');

/**
 * Generate a travel itinerary using OpenAI
 * @param {Object} params - Parameters for itinerary generation
 * @param {string} params.destination - Travel destination
 * @param {string} params.startDate - Start date of trip
 * @param {string} params.endDate - End date of trip
 * @param {string[]} params.interests - User's travel interests
 * @param {string} params.pace - Preferred travel pace
 * @param {number} params.budget - Budget for the trip (optional)
 * @returns {Promise<Object>} Generated itinerary
 */
async function generateItinerary({
  destination,
  startDate,
  endDate,
  interests,
  pace,
  budget
}) {
  try {
    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Create prompt for OpenAI
    const prompt = `Create a detailed ${numberOfDays}-day travel itinerary for ${destination} from ${startDate} to ${endDate}.
    Interests: ${interests.join(', ')}
    Pace: ${pace}
    ${budget ? `Budget: $${budget}` : ''}
    
    For each day, include:
    1. Morning activity with description and duration
    2. Lunch recommendation with restaurant name and cuisine type
    3. Afternoon activity with description and duration
    4. Dinner recommendation with restaurant name and cuisine type
    5. Evening activity/entertainment (optional)
    6. Local tips/insights for each day
    
    Format the response as a JSON object with this structure:
    {
      "destination": "destination name",
      "summary": "brief overview of the trip",
      "days": [
        {
          "day": 1,
          "date": "formatted date",
          "activities": [
            {
              "time": "morning/afternoon/evening",
              "title": "activity name",
              "description": "detailed description",
              "duration": "estimated duration",
              "type": "activity/food/entertainment"
            }
          ],
          "tips": "local tips for the day"
        }
      ]
    }`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // You can use "gpt-3.5-turbo" if preferred
      messages: [
        { 
          role: "system", 
          content: "You are a travel expert that creates detailed, personalized travel itineraries. Always respond with well-structured JSON only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const itineraryData = JSON.parse(response.choices[0].message.content);
    return itineraryData;
  } catch (error) {
    console.error('Error generating itinerary with OpenAI:', error);
    
    // Fallback to mock service if OpenAI fails
    console.log('Falling back to mock data');
    return generateMockItinerary({
      destination,
      startDate,
      endDate,
      interests,
      pace,
      budget
    });
  }
}

module.exports = {
  generateItinerary
};

// 3. Update your controller to use this service
// File: /backend/controllers/itineraryController.js

const openaiService = require('../services/openaiService');
// ... other imports

exports.createItinerary = async (req, res) => {
  try {
    const { destination, startDate, endDate, interests, pace, budget, userId } = req.body;
    
    // Validate input
    if (!destination || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Generate itinerary using OpenAI
    const itineraryData = await openaiService.generateItinerary({
      destination,
      startDate,
      endDate,
      interests,
      pace,
      budget
    });
    
    // Save to database
    const itinerary = new Itinerary({
      userId,
      destination,
      startDate,
      endDate,
      interests,
      pace,
      budget,
      days: itineraryData.days,
      summary: itineraryData.summary
    });
    
    await itinerary.save();
    
    res.status(201).json({
      message: 'Itinerary created successfully',
      itinerary
    });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({ message: 'Failed to create itinerary', error: error.message });
  }
};