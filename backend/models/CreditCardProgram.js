

const mongoose = require('mongoose');

const CreditCardProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  transferPartners: [{
    name: {
      type: String,
      required: true
    },
    transferRatio: {
      type: Number,
      required: true,
      default: 1 // 1:1 transfer ratio
    },
    averageCentValuePerPoint: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['hotel', 'airline', 'other'],
      required: true
    }
  }],
  portalRedemptionValue: {
    type: Number,
    required: true,
    default: 1.0 // cents per point when redeemed through travel portal
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update the updatedAt field
CreditCardProgramSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CreditCardProgram', CreditCardProgramSchema);

// 2. Add a user points balance model
// File: /backend/models/UserPointsBalance.js

const mongoose = require('mongoose');

const UserPointsBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creditCardProgram: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreditCardProgram',
    required: true
  },
  pointsBalance: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update the updatedAt field
UserPointsBalanceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserPointsBalance', UserPointsBalanceSchema);

// 3. Create API routes for points management
// File: /backend/routes/pointsRoutes.js

const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const auth = require('../middleware/auth');

// Routes for credit card programs (admin only)
router.post('/programs', auth, pointsController.createCreditCardProgram);
router.get('/programs', pointsController.getAllCreditCardPrograms);

// Routes for user points management
router.post('/balance', auth, pointsController.addUserPointsBalance);
router.get('/balance', auth, pointsController.getUserPointsBalances);
router.put('/balance/:id', auth, pointsController.updateUserPointsBalance);
router.delete('/balance/:id', auth, pointsController.deleteUserPointsBalance);

// Route for points-optimized itineraries
router.post('/optimized-trips', auth, pointsController.generateOptimizedTrips);

module.exports = router;

// 4. Implement the controller
// File: /backend/controllers/pointsController.js

const CreditCardProgram = require('../models/CreditCardProgram');
const UserPointsBalance = require('../models/UserPointsBalance');
const openaiService = require('../services/openaiService');

// Admin controllers for credit card programs
exports.createCreditCardProgram = async (req, res) => {
  try {
    // Check if user is admin (implement your admin check)
    
    const program = new CreditCardProgram(req.body);
    await program.save();
    
    res.status(201).json({
      message: 'Credit card program created successfully',
      program
    });
  } catch (error) {
    console.error('Error creating credit card program:', error);
    res.status(500).json({ message: 'Failed to create program', error: error.message });
  }
};

exports.getAllCreditCardPrograms = async (req, res) => {
  try {
    const programs = await CreditCardProgram.find().sort({ name: 1 });
    res.status(200).json(programs);
  } catch (error) {
    console.error('Error getting credit card programs:', error);
    res.status(500).json({ message: 'Failed to get programs', error: error.message });
  }
};

// User points balance controllers
exports.addUserPointsBalance = async (req, res) => {
  try {
    const { creditCardProgramId, pointsBalance } = req.body;
    const userId = req.user.id;
    
    // Check if program exists
    const program = await CreditCardProgram.findById(creditCardProgramId);
    if (!program) {
      return res.status(404).json({ message: 'Credit card program not found' });
    }
    
    // Check if user already has a balance for this program
    const existingBalance = await UserPointsBalance.findOne({
      userId,
      creditCardProgram: creditCardProgramId
    });
    
    if (existingBalance) {
      return res.status(400).json({ 
        message: 'You already have a balance for this program. Please update it instead.' 
      });
    }
    
    // Create new balance
    const newBalance = new UserPointsBalance({
      userId,
      creditCardProgram: creditCardProgramId,
      pointsBalance
    });
    
    await newBalance.save();
    
    // Populate the program details
    await newBalance.populate('creditCardProgram');
    
    res.status(201).json({
      message: 'Points balance added successfully',
      balance: newBalance
    });
  } catch (error) {
    console.error('Error adding points balance:', error);
    res.status(500).json({ message: 'Failed to add points balance', error: error.message });
  }
};

exports.getUserPointsBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const balances = await UserPointsBalance.find({ userId })
      .populate('creditCardProgram')
      .sort({ updatedAt: -1 });
    
    res.status(200).json(balances);
  } catch (error) {
    console.error('Error getting user points balances:', error);
    res.status(500).json({ message: 'Failed to get points balances', error: error.message });
  }
};

exports.updateUserPointsBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { pointsBalance } = req.body;
    const userId = req.user.id;
    
    // Find the balance
    const balance = await UserPointsBalance.findById(id);
    
    // Check if balance exists and belongs to user
    if (!balance) {
      return res.status(404).json({ message: 'Points balance not found' });
    }
    
    if (balance.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this balance' });
    }
    
    // Update balance
    balance.pointsBalance = pointsBalance;
    await balance.save();
    
    // Populate program details
    await balance.populate('creditCardProgram');
    
    res.status(200).json({
      message: 'Points balance updated successfully',
      balance
    });
  } catch (error) {
    console.error('Error updating points balance:', error);
    res.status(500).json({ message: 'Failed to update points balance', error: error.message });
  }
};

exports.deleteUserPointsBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the balance
    const balance = await UserPointsBalance.findById(id);
    
    // Check if balance exists and belongs to user
    if (!balance) {
      return res.status(404).json({ message: 'Points balance not found' });
    }
    
    if (balance.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this balance' });
    }
    
    // Delete balance
    await UserPointsBalance.findByIdAndDelete(id);
    
    res.status(200).json({
      message: 'Points balance deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting points balance:', error);
    res.status(500).json({ message: 'Failed to delete points balance', error: error.message });
  }
};

// Generate points-optimized trip options
exports.generateOptimizedTrips = async (req, res) => {
  try {
    const { 
      preferences, 
      additionalBudget,
      optimizationStrategy // 'max_points', 'min_cash', or 'balanced'
    } = req.body;
    const userId = req.user.id;
    
    // Get user's points balances
    const userBalances = await UserPointsBalance.find({ userId })
      .populate('creditCardProgram');
    
    if (userBalances.length === 0) {
      return res.status(400).json({ 
        message: 'You need to add credit card points balances before generating optimized trips' 
      });
    }
    
    // Format points data for OpenAI
    const pointsData = userBalances.map(balance => ({
      program: balance.creditCardProgram.name,
      shortCode: balance.creditCardProgram.shortCode,
      balance: balance.pointsBalance,
      transferPartners: balance.creditCardProgram.transferPartners,
      portalValue: balance.creditCardProgram.portalRedemptionValue
    }));
    
    // Generate optimized trip options using OpenAI
    const prompt = `I have the following credit card points:
    ${pointsData.map(p => `- ${p.program} (${p.shortCode}): ${p.balance.toLocaleString()} points`).join('\n')}
    
    Preferences:
    - Destination type: ${preferences.destinationType || 'Flexible'}
    - Specific destination (optional): ${preferences.specificDestination || 'Not specified'}
    - Additional cash budget: $${additionalBudget || 0}
    - Optimization strategy: ${optimizationStrategy || 'balanced'}
    
    Generate 3 optimized trip options using my points balances. For each option:
    1. Identify which transfer partners offer the best value
    2. Calculate how many points to use from each program
    3. Determine any additional cash needed
    4. Provide approximate redemption value in cents per point
    
    Format the response as a detailed JSON object with this structure:
    {
      "tripOptions": [
        {
          "destination": "destination name",
          "description": "brief overview of the trip",
          "transferPartners": [
            {
              "name": "partner name",
              "programName": "credit card program name",
              "pointsUsed": 50000,
              "valuePerPoint": 2.1,
              "cashValue": 1050
            }
          ],
          "additionalCash": 350,
          "totalValue": 1400,
          "redemptionStrategy": "detailed explanation of how to book this trip"
        }
      ]
    }`;
    
    const response = await openaiService.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a credit card points expert that specializes in optimizing travel redemptions. Provide detailed, realistic recommendations for maximizing point value."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    // Parse and return the optimized trip options
    const optimizedTrips = JSON.parse(response.choices[0].message.content);
    
    res.status(200).json(optimizedTrips);
  } catch (error) {
    console.error('Error generating optimized trips:', error);
    res.status(500).json({ message: 'Failed to generate optimized trips', error: error.message });
  }
};

// 5. Front-end component for adding points balance
// File: /components/PointsBalanceForm.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

function PointsBalanceForm() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [pointsBalance, setPointsBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Fetch available credit card programs
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get('/api/points/programs');
        setPrograms(response.data);
        
        // Select first program by default if available
        if (response.data.length > 0) {
          setSelectedProgram(response.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching credit card programs:', error);
        setError('Failed to fetch credit card programs. Please try again later.');
      }
    };
    
    fetchPrograms();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProgram || !pointsBalance) {
      setError('Please select a program and enter your points balance');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await axios.post('/api/points/balance', {
        creditCardProgramId: selectedProgram,
        pointsBalance: parseInt(pointsBalance, 10)
      });
      
      // Reset form
      setPointsBalance('');
      setSuccess('Points balance added successfully!');
      
      // You can add callback here to refresh user's points balances if needed
      
    } catch (error) {
      console.error('Error adding points balance:', error);
      setError(error.response?.data?.message || 'Failed to add points balance. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="points-balance-form p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Add Credit Card Points Balance</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Card Program
          </label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading || programs.length === 0}
          >
            {programs.length === 0 && (
              <option value="">No programs available</option>
            )}
            {programs.map((program) => (
              <option key={program._id} value={program._id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points Balance
          </label>
          <input
            type="number"
            min="0"
            value={pointsBalance}
            onChange={(e) => setPointsBalance(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., 50000"
            disabled={loading}
          />
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Points Balance'}
        </button>
      </form>
    </div>
  );
}

export default PointsBalanceForm;

// 6. Create a Points Optimization Form
// File: /components/PointsOptimizationForm.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

function PointsOptimizationForm() {
  const [userBalances, setUserBalances] = useState([]);
  const [preferences, setPreferences] = useState({
    destinationType: '',
    specificDestination: ''
  });
  const [additionalBudget, setAdditionalBudget] = useState('');
  const [optimizationStrategy, setOptimizationStrategy] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tripOptions, setTripOptions] = useState(null);
  
  // Fetch user's points balances
  useEffect(() => {
    const fetchUserBalances = async () => {
      try {
        const response = await axios.get('/api/points/balance');
        setUserBalances(response.data);
      } catch (error) {
        console.error('Error fetching user points balances:', error);
        setError('Failed to fetch your points balances. Please try again later.');
      }
    };
    
    fetchUserBalances();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!preferences.destinationType) {
      setError('Please select a destination type');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setTripOptions(null);
      
      const response = await axios.post('/api/points/optimized-trips', {
        preferences,
        additionalBudget: additionalBudget ? parseInt(additionalBudget, 10) : 0,
        optimizationStrategy
      });
      
      setTripOptions(response.data.tripOptions);
    } catch (error) {
      console.error('Error generating optimized trips:', error);
      setError(error.response?.data?.message || 'Failed to generate optimized trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="points-optimization-container">
      <div className="points-balances mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Your Points Balances</h2>
        
        {userBalances.length === 0 ? (
          <p className="text-gray-600">
            You haven't added any points balances yet. Please add your credit card points balances first.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userBalances.map((balance) => (
              <div key={balance._id} className="p-3 border rounded-md">
                <h3 className="font-semibold">{balance.creditCardProgram.name}</h3>
                <p className="text-lg">{balance.pointsBalance.toLocaleString()} points</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="optimization-form p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Generate Points-Optimized Trips</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Type
            </label>
            <select
              value={preferences.destinationType}
              onChange={(e) => setPreferences({...preferences, destinationType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading || userBalances.length === 0}
            >
              <option value="">Select destination type</option>
              <option value="beach">Beach</option>
              <option value="mountain">Mountain</option>
              <option value="city">City</option>
              <option value="resort">Resort</option>
              <option value="international">International</option>
              <option value="domestic">Domestic</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Destination (Optional)
            </label>
            <input
              type="text"
              value={preferences.specificDestination}
              onChange={(e) => setPreferences({...preferences, specificDestination: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Paris, Hawaii, etc."
              disabled={loading || userBalances.length === 0}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Cash Budget (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={additionalBudget}
              onChange={(e) => setAdditionalBudget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 500"
              disabled={loading || userBalances.length === 0}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optimization Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className={`p-2 border rounded-md transition-colors ${
                  optimizationStrategy === 'max_points'
                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setOptimizationStrategy('max_points')}
                disabled={loading || userBalances.length === 0}
              >
                Max Points
              </button>
              <button
                type="button"
                className={`p-2 border rounded-md transition-colors ${
                  optimizationStrategy === 'min_cash'
                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setOptimizationStrategy('min_cash')}
                disabled={loading || userBalances.length === 0}
              >
                Min Cash
              </button>
              <button
                type="button"
                className={`p-2 border rounded-md transition-colors ${
                  optimizationStrategy === 'balanced'
                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setOptimizationStrategy('balanced')}
                disabled={loading || userBalances.length === 0}
              >
                Balanced
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading || userBalances.length === 0
                ? 'bg-gray-400'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
            disabled={loading || userBalances.length === 0}
          >
            {loading ? 'Generating Options...' : 'Generate Trip Options'}
          </button>
          
          {userBalances.length === 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Please add your credit card points balances before generating optimized trips.
            </p>
          )}
        </form>
      </div>
      
      {tripOptions && (
        <div className="trip-options mt-6">
          <h2 className="text-xl font-semibold mb-4">Optimized Trip Options</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tripOptions.map((option, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold">{option.destination}</h3>
                <p className="text-gray-600 mb-4">{option.description}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Points Used:</h4>
                  {option.transferPartners.map((partner, idx) => (
                    <div key={idx} className="flex justify-between mb-1">
                      <span>{partner.programName} → {partner.name}:</span>
                      <span className="font-medium">{partner.pointsUsed.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between">
                    <span>Additional Cash:</span>
                    <span className="font-medium">${option.additionalCash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-medium">${option.totalValue}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">How to Book:</h4>
                  <p className="text-sm">{option.redemptionStrategy}</p>
                </div>
                
                <button className="mt-4 w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md">
                  Create Itinerary
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PointsOptimizationForm;