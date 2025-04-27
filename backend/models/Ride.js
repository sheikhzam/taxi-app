const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  pickupLocation: {
    type: String,
    required: [true, 'Please provide pickup address']
  },
  dropoffLocation: {
    type: String,
    required: [true, 'Please provide dropoff address']
  },
  fare: {
    type: Number,
    required: [true, 'Please provide fare estimate']
  },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'ongoing', 'completed', 'canceled'],
    default: 'requested'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  completedAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


module.exports = mongoose.model('Ride', rideSchema);