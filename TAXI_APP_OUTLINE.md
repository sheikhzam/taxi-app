# MERN Taxi Ordering System - Project Outline

## Overview
A demo taxi ordering system built with the MERN stack (MongoDB, Express.js, React, Node.js). The app will have two main user types: Taxi drivers (with taxi profiles) and Riders (with user profiles). The system will allow users to order taxis, and drivers to accept rides.

## Features
- User authentication (signup/login for both riders and taxi drivers)
- User profile (for riders)
- Taxi profile (for drivers, including car info, status, etc.)
- Request a ride (rider)
- Accept a ride (driver)
- Ride status tracking
- Basic ride history for users and drivers
- Demo UI (React)

## Architecture
- **Frontend:** React (with hooks, context for auth/state)
- **Backend:** Node.js + Express.js REST API
- **Database:** MongoDB (Mongoose ODM)

## Step-by-Step Plan

### 1. Project Setup
- Initialize backend (Node.js/Express)
- Initialize frontend (React)
- Set up MongoDB connection

### 2. Authentication
- Implement JWT-based authentication
- Separate login/signup for riders and drivers

### 3. Profiles
- User profile: name, email, ride history
- Taxi profile: driver name, car info, status, ride history

### 4. Ride Ordering
- Riders can request a ride
- Drivers can view available ride requests and accept
- Ride status updates (requested, accepted, completed)

### 5. UI Implementation
- React pages for login/signup, dashboard, ride request, ride management
- Profile pages for user and taxi

### 6. Demo Data and Testing
- Seed database with demo users and taxis
- Test full flow: signup, order, accept, complete ride

### 7. (Optional) Enhancements
- Map integration for pickup/dropoff
- Ratings/reviews
- Real-time updates (Socket.io)

---

## Next Steps
Proceed with Step 1: Project Setup. Each step will include code and explanations.
