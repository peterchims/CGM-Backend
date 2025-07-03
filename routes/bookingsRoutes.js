// server/routes/bookingsRoutes.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST new booking
router.post('/', async (req, res) => {
  try {
    // const newBooking = new Booking(req.body);
    const savedBooking = await new Booking(req.body).save();
    res.status(201).json({
      message: 'Booking submitted successfully!',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Error saving booking:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;