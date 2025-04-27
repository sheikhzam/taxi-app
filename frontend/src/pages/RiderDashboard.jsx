import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { Card, CardContent, Typography, Chip, Button, Grid, Paper, TextField, List, Box, Alert } from '@mui/material';

const RiderDashboard = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [formData, setFormData] = useState({ pickupLocation: '', dropoffLocation: '', fare: '' });
  const [ws, setWs] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const newWs = new W3CWebSocket(`ws://localhost:5000?token=${token}`);

    newWs.onopen = () => {
      setError('');
      fetchRides();
    };

    newWs.onerror = (err) => {
      setError('Connection error - updates may not be real-time');
    };

    newWs.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'ride_update') {
        setRides(prev => prev.map(ride => 
          ride._id === data.ride._id ? { ...ride, ...data.ride } : ride
        ));
      }
    };

    setWs(newWs);
    return () => newWs.close();
  }, []);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch('/api/rides/my-rides', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) setRides(data.rides);
      } catch (error) {
        console.error('Error fetching rides:', error);
      }
    };

    fetchRides();
  }, []); // Remove interval-based polling

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return 'bg-blue-500';
      case 'ongoing': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rides/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
      pickupLocation: formData.pickupLocation,
      dropoffLocation: formData.dropoffLocation,
      fare: formData.fare
    })
      });

      if (response.ok) {
        setFormData({ pickupLocation: '', dropoffLocation: '', fare: '' });
        fetchRides(); // Refresh ride list
      }
    } catch (error) {
      console.error('Ride request failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom>Request New Ride</Typography>
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{ float: 'right' }}
          >
            Logout
          </Button>
        </Box>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Pickup Location"
                value={formData.pickupLocation}
                onChange={(e) => setFormData({...formData, pickupLocation: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Dropoff Location"
                value={formData.dropoffLocation}
                onChange={(e) => setFormData({...formData, dropoffLocation: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
              type='number'
                fullWidth
                label="Fare (Kshs)"
                value={formData.fare}
                onChange={(e) => setFormData({...formData, fare: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit" fullWidth>
                Request Ride
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>

      <Typography variant="h5" gutterBottom>Your Ride Requests</Typography>
      <List sx={{ width: '100%' }}>
        {rides.map(ride => (
          <Card key={ride._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={ride.status}
                  color={
                    ride.status === 'accepted' ? 'primary' :
                    ride.status === 'ongoing' ? 'warning' :
                    ride.status === 'completed' ? 'success' : 'default'
                  }
                  variant="outlined"
                />
                <Typography variant="caption">
                  {new Date(ride.requestedAt).toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Pickup: {ride.pickupLocation}
              </Typography>
              <Typography variant="body1">
                Dropoff: {ride.dropoffLocation}
              </Typography>
              {ride.driver && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Driver: {ride.driver.name}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </List>
      </Paper>
    </div>
  );
};

export default RiderDashboard;