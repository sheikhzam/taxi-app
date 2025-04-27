const Ride = require('../models/Ride');
// const {  validateCoordinates } = require('../utils/geolocation');

const getRides = async (req, res) => {
  try {
    const rides = await Ride.find().populate('rider driver');
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requestRide = async (req, res) => {
  try {
    console.log(req.body.pickupLocation)
    const newRide = await Ride.create({
        pickupLocation: req.body.pickupLocation,
        dropoffLocation: req.body.dropoffLocation,
        fare: req.body.fare,
        rider: req.user.userId
    });
    res.status(201).json({ success: true, ride: newRide });
} catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ rider: req.user.userId });
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveRides = async (req, res) => {
  try {
    const rides = await Ride.find({ 
      status: 'requested',
    }).populate('rider', 'name');

    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    if (ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride cannot be accepted' });
    }

    ride.driver = req.user.userId;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();
    await ride.save();

    // Notify rider via WebSocket
    const wss = req.app.get('wss');
    if (!wss?.clients) {
      console.error('WebSocket clients not initialized');
      return res.status(500).json({ message: 'Server error' });
    }
    wss.clients.forEach(client => {
      if (client.userId === ride.rider.toString()) {
        client.send(JSON.stringify({
          type: 'ride_accepted',
          rideId: ride._id,
          driverId: ride.driver
        }));
      }
    });

    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    
    if (ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride cannot be rejected' });
    }

    ride.status = 'canceled';
    await ride.save();

    res.json({ success: true, ride });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRide = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, fare } = req.body;

       const ride = new Ride({
      rider: req.user.userId,
      pickupLocation: pickupLocation,
      dropoffLocation: dropoffLocation,
      proposedPrice: fare,
      status: 'requested'
    });

    await ride.save();

    // Broadcast new ride to all connected drivers
    const wss = req.app.get('wss');
    if (!wss?.clients) {
      console.error('WebSocket clients not initialized');
      return res.status(500).json({ message: 'Server error' });
    }
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.userType === 'driver') {
        client.send(JSON.stringify({
          type: 'new_ride_request',
          ride: {
            _id: ride._id,
            pickupLocation: ride.pickupLocation,
            dropoffLocation: ride.dropoffLocation,
            estimatedFare: ride.fare,
            status: ride.status,
            createdAt: ride.createdAt
            // distance: calculateDistance(pickupLocation.lat, pickupLocation.lng, client.location.lat, client.location.lng)
          }
        }));
      }
    });

    res.status(201).json({ success: true, ride });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getRidesByRider = async (req, res) => {
  try {
    const rides = await Ride.find({ rider: req.user.userId }).sort('-requestedAt');
    res.json({ success: true, rides });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRides,
  requestRide,
  getUserRides,
  getActiveRides,
  acceptRide,
  rejectRide,
  createRide
};