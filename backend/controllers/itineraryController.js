// File: /backend/controllers/itineraryController.js

const openaiService = require('../services/openaiService');
const Itinerary = require('../models/Itinerary');

// Add your existing controller methods here...

// Add the regenerate activity method
exports.regenerateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { dayIndex, activityIndex } = req.body;
    
    // Validate input
    if (dayIndex === undefined || activityIndex === undefined) {
      return res.status(400).json({ message: 'Missing required fields: dayIndex and activityIndex' });
    }
    
    // Find the itinerary
    const itinerary = await Itinerary.findById(id);
    
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }
    
    // Check if the user owns this itinerary
    if (itinerary.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this itinerary' });
    }
    
    // Extract the activity to regenerate
    const day = itinerary.days[dayIndex];
    if (!day) {
      return res.status(400).json({ message: 'Day not found in itinerary' });
    }
    
    const activity = day.activities[activityIndex];
    if (!activity) {
      return res.status(400).json({ message: 'Activity not found for this day' });
    }
    
    // Generate a new activity with OpenAI
    const prompt = `Generate a new ${activity.time} activity for a trip to ${itinerary.destination} 
    that is different from "${activity.title}". 
    The activity should match these interests: ${itinerary.interests.join(', ')}
    and fit a ${itinerary.pace} pace.
    
    Return the response as JSON with this structure:
    {
      "title": "activity name",
      "description": "detailed description",
      "duration": "estimated duration",
      "type": "${activity.type}"
    }`;
    
    const response = await openaiService.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a travel expert that creates personalized travel activities. Respond with JSON only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });
    
    // Parse the new activity
    const newActivity = JSON.parse(response.choices[0].message.content);
    
    // Add the time field from the original activity
    newActivity.time = activity.time;
    
    // Update the itinerary with the new activity
    itinerary.days[dayIndex].activities[activityIndex] = newActivity;
    
    // Save the updated itinerary
    await itinerary.save();
    
    res.status(200).json({
      message: 'Activity regenerated successfully',
      activity: newActivity,
      itinerary
    });
  } catch (error) {
    console.error('Error regenerating activity:', error);
    res.status(500).json({ message: 'Failed to regenerate activity', error: error.message });
  }
};