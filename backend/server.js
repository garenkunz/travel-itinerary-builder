// server.js - Main server entry point
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const itineraryRoutes = require('./routes/itineraries');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const paymentController = require('./controllers/paymentController');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Detailed startup logging
console.log('==== Server Initialization ====');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${PORT}`);
console.log(`MongoDB URI available: ${process.env.MONGODB_URI ? 'Yes' : 'No'}`);

// Middleware with more logging
app.use(cors());
console.log('CORS middleware enabled');

// Raw body parsing for Stripe webhooks
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Regular JSON parsing for other routes
app.use(express.json({ limit: '1mb' }));
console.log('JSON parsing middleware enabled');

app.use(express.urlencoded({ extended: true }));
console.log('URL-encoded parsing middleware enabled');

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB with detailed error handling
console.log('Attempting MongoDB connection...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch(err => {
  console.error('❌ MongoDB connection error:');
  console.error(err);
  if (err.code === 'ENOTFOUND') {
    console.error('Host not found. Check your network connection and MongoDB URI');
  } else if (err.code === 'ETIMEDOUT') {
    console.error('Connection timed out. Check firewall settings or MongoDB Atlas network access');
  } else if (err.name === 'MongoServerSelectionError') {
    console.error('Server selection failed. Check IP whitelist in MongoDB Atlas');
  }
});

// Simple health check route
app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.status(200).send('Server is up and running!');
});

// Test route with more details
app.get('/api/test', (req, res) => {
  console.log('API test route accessed');
  res.status(200).json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date(),
    env: process.env.NODE_ENV
  });
});

// Test DB connection
const Test = mongoose.model('Test', new mongoose.Schema({ 
  name: String, 
  createdAt: { type: Date, default: Date.now }
}), 'tests');

app.get('/api/test-db', async (req, res) => {
  console.log('Database test route accessed');
  try {
    const newTest = new Test({ name: 'Test Document' });
    const savedDoc = await newTest.save();
    console.log('Test document saved:', savedDoc);
    res.status(200).json({ 
      success: true, 
      message: 'Database connection working correctly',
      document: savedDoc
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database test failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Mount route modules
console.log('Setting up API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
console.log('All routes mounted');

// Catch-all route for undefined routes (better implementation)
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
// Handle route errors
app.use((err, req, res, next) => {
  console.error('Route error:', err);
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON' });
  }
  return res.status(500).json({ success: false, message: 'Something went wrong' });
});

// Start server with better error handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}/`);
  console.log('Try these test endpoints:');
  console.log(`  - Basic health: curl http://localhost:${PORT}/`);
  console.log(`  - API test: curl http://localhost:${PORT}/api/test`);
  console.log(`  - DB test: curl http://localhost:${PORT}/api/test-db`);
})
.on('error', (err) => {
  console.error('❌ Server failed to start:');
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

// Add proper shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});