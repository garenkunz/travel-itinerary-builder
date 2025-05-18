// controllers/itineraryController.js
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const openaiService = require('../services/openaiService');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Generate a new itinerary
 * @route   POST /api/itineraries/generate
 * @access  Private
 */
exports.generateItinerary = async (req, res) => {
  try {
    console.log("Generating itinerary for request:", req.body);
    const { destination, startDate, endDate, budget, interests, pace } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide destination, start date, and end date'
      });
    }

    // Get user subscription status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prepare data for OpenAI
    const itineraryData = {
      destination,
      startDate,
      endDate,
      budget: budget || undefined,
      interests: interests || [],
      pace: pace || 'Balanced'
    };

    // Generate itinerary using OpenAI mock
    console.log("Calling openaiService to generate itinerary");
    const generatedItinerary = await openaiService.generateItinerary(itineraryData);
    console.log("Generated itinerary:", generatedItinerary.title);

    // Create new itinerary document
    const itinerary = new Itinerary({
      title: generatedItinerary.title,
      destination,
      startDate,
      endDate,
      user: userId,
      budget: budget || undefined,
      interests: interests || [],
      pace: pace || 'Balanced',
      days: generatedItinerary.days,
      isPublic: false
    });

    // Save itinerary to database
    await itinerary.save();
    console.log("Saved itinerary to database, id:", itinerary._id);

    res.status(201).json({
      success: true,
      data: {
        itinerary
      }
    });
  } catch (error) {
    console.error('Generate Itinerary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating itinerary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all itineraries for a user
 * @route   GET /api/itineraries
 * @access  Private
 */
exports.getItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: itineraries.length,
      data: {
        itineraries
      }
    });
  } catch (error) {
    console.error('Get Itineraries Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching itineraries'
    });
  }
};

/**
 * @desc    Get single itinerary
 * @route   GET /api/itineraries/:id
 * @access  Private/Public (depends on isPublic flag)
 */
exports.getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    // Check if user has access to this itinerary
    if (!itinerary.isPublic && itinerary.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this itinerary'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        itinerary
      }
    });
  } catch (error) {
    console.error('Get Itinerary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching itinerary'
    });
  }
};

/**
 * @desc    Update itinerary
 * @route   PUT /api/itineraries/:id
 * @access  Private
 */
exports.updateItinerary = async (req, res) => {
  try {
    let itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    // Check ownership
    if (itinerary.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this itinerary'
      });
    }
    
    // Update itinerary
    itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id, 
      { 
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: {
        itinerary
      }
    });
  } catch (error) {
    console.error('Update Itinerary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating itinerary'
    });
  }
};

/**
 * @desc    Delete itinerary
 * @route   DELETE /api/itineraries/:id
 * @access  Private
 */
exports.deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    // Check ownership
    if (itinerary.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this itinerary'
      });
    }
    
    await itinerary.deleteOne(); // Changed from .remove() to .deleteOne()
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete Itinerary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting itinerary'
    });
  }
};

/**
 * @desc    Create shareable link
 * @route   POST /api/itineraries/:id/share
 * @access  Private
 */
exports.createShareableLink = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    // Check ownership
    if (itinerary.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this itinerary'
      });
    }
    
    // Generate shareable link if doesn't exist
    if (!itinerary.shareableLink) {
      const shareId = uuidv4().substring(0, 8);
      itinerary.shareableLink = shareId;
      itinerary.isPublic = true;
      await itinerary.save();
    }
    
    // Format shareable URL (in production, use your actual domain)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const shareableLink = `${baseUrl}/shared/${itinerary.shareableLink}`;
    
    res.status(200).json({
      success: true,
      data: {
        shareableLink
      }
    });
  } catch (error) {
    console.error('Share Itinerary Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shareable link'
    });
  }
};

/**
 * @desc    Regenerate an activity
 * @route   POST /api/itineraries/:id/regenerate-activity
 * @access  Private/Premium
 */
exports.regenerateActivity = async (req, res) => {
  try {
    const { dayIndex, activityIndex } = req.body;
    const itineraryId = req.params.id;
    
    // Validate input
    if (dayIndex === undefined || activityIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide dayIndex and activityIndex'
      });
    }
    
    // Get itinerary
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }
    
    // Check ownership
    if (itinerary.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this itinerary'
      });
    }
    
    // Validate day and activity indices
    if (
      dayIndex < 0 || 
      dayIndex >= itinerary.days.length || 
      activityIndex < 0 || 
      activityIndex >= itinerary.days[dayIndex].activities.length
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day or activity index'
      });
    }
    
    // Generate new activity
    const newActivity = await openaiService.regenerateActivity(
      itinerary,
      dayIndex,
      activityIndex
    );
    
    // Update itinerary with new activity
    itinerary.days[dayIndex].activities[activityIndex] = newActivity;
    itinerary.updatedAt = Date.now();
    await itinerary.save();
    
    res.status(200).json({
      success: true,
      data: {
        activity: newActivity
      }
    });
  } catch (error) {
    console.error('Regenerate Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating activity'
    });
  }
};