import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Chip, Button, List, ListItem, ListItemText } from '@mui/material';

const DriverDashboard = () => {
  const [rides, setRides] = useState([]);
const [currentRide, setCurrentRide] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/rides`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => setRides(data.rides.filter(ride => ride.status !== 'accepted')))
      .catch(error => console.error('Fetch error:', error));
  }, []);

  const handleAccept = (rideId) => {
    fetch(`http://localhost:5000/api/rides/${rideId}/accept`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(() => {
      setRides(prev => prev.filter(ride => ride._id !== rideId));
      setCurrentRide(rideId);
    });
  };

  const handleReject = (rideId) => {
    fetch(`http://localhost:5000/api/rides/${rideId}/reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(() => {
      setRides(prev => prev.filter(ride => ride._id !== rideId));
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <Card sx={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Driver Dashboard

          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{ float: 'right' }}
          >
            Logout
          </Button>
        </Typography>

        <List sx={{ mt: 2 }}>
          {rides.map(ride => (
            <ListItem 
              key={ride._id}
              secondaryAction={
                <div>
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={() => handleAccept(ride._id)}
                    sx={{ mr: 1 }}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => handleReject(ride._id)}
                  >
                    Reject
                  </Button>
                </div>
              }
            >
              <ListItemText
                primary={`Ride to ${ride.dropoffLocation}`}
                secondary={`Fare: Kes${ride.fare}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default DriverDashboard;