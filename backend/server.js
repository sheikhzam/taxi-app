require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { signup, login } = require('./controllers/authController');
const jwt = require('jsonwebtoken');
const { createRide, getActiveRides, acceptRide, rejectRide } = require('./controllers/rideController');
const configureWebSocket = require('./websocket');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);

// Authentication Middleware
app.use('/api/rides', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
});

// Ride Routes
const rideRoutes = require('./routes/rideRoutes');
app.use('/api/rides', rideRoutes);


// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB with URI:', MONGODB_URI.replace(/\/\/.+@/, '//<credentials>@'));
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  connectTimeoutMS: 30000,
  heartbeatFrequencyMS: 2000,
};

const connectWithRetry = async (retryCount = 0, maxRetries = 5) => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(`MongoDB connection attempt ${retryCount + 1} failed:`, error.message);
    if (error.name === 'MongoNetworkError') {
      console.error('Network error details:', {
        errorName: error.name,
        errorCode: error.code,
        syscall: error.syscall,
        address: error.address,
        port: error.port
      });
    }
    
    if (retryCount < maxRetries) {
      console.log(`Retrying connection in 5 seconds... (${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectWithRetry(retryCount + 1, maxRetries);
    } else {
      console.error('Max retry attempts reached. Exiting...');
      process.exit(1);
    }
  }
};

connectWithRetry();

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Taxi App API' });
});

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId, userType: decoded.userType };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};



// Error handling middleware
// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const startServer = async (retryCount = 0) => {
  const PORT = process.env.PORT || 5000;

  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(PORT)
        .once('listening', () => {
          console.log(`Server is running on port ${PORT}`);
          const wss = configureWebSocket(server);
          app.set('wss', wss);
          resolve();
        })
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE' && retryCount < 3) {
            console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
            server.close();
            startServer(retryCount + 1);
          } else {
            console.error('Server failed to start:', err);
            process.exit(1);
          }
        });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();