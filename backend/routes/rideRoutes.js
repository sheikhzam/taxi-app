const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');

router.get('/', rideController.getRides);
router.post('/request', rideController.requestRide);
router.post('/:id/accept', rideController.acceptRide);
router.post('/:id/reject', rideController.rejectRide);
router.get('/my-rides', rideController.getUserRides);
router.get('/active', rideController.getActiveRides);

module.exports = router;