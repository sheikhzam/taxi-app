import React, { useState } from 'react';
import { Button, TextField, Grid, Typography, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const RideRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    fare: ''
  });

  const handleAddressChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!formData.pickupCoords.length || !formData.dropoffCoords.length) {
      alert('Please select valid pickup and dropoff locations');
      return;
    }

    const rideData = {
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      fare: formData.fare
    };

    try {
      const response = await fetch('/api/rides/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(rideData)
      });

      if (!response.ok) throw new Error('Request failed');
      onSuccess(await response.json());
    } catch (error) {
      console.error('Ride request error:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        New Ride Request
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Pickup Location"
              value={formData.pickupLocation}
              onChange={(e) => handleAddressChange('pickupLocation', e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Dropoff Location"
              value={formData.dropoffLocation}
              onChange={(e) => handleAddressChange('dropoffLocation', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Proposed Fare"
              type="number"
              value={formData.fare}
              onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" color="primary" type="submit">
              Request Ride
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default RideRequestForm;