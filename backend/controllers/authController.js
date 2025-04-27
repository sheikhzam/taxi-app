// backend/controllers/authController.js
require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

// helper to load and validate env vars
function getEnv(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var ${key}`);
  return val;
}
const JWT_SECRET    = getEnv('JWT_SECRET');
const JWT_EXPIRES_IN = parseInt(getEnv('JWT_EXPIRES_IN'), 10);

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // retrieve hashed password explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials yasta' });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials omg' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.userType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      token,
      role: user.userType
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: err.message
    });
  }
};

const signup = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: 'Name, email, password and userType are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password,
      userType
    });

    const token = jwt.sign(
      { userId: user._id, role: user.userType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      token,
      role: user.userType
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({
      success: false,
      message: 'Signup failed',
      error: err.message
    });
  }
};

module.exports = { login, signup };
