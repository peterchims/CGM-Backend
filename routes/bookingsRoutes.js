const express = require('express');
const createHttpError = require('http-errors');
const Booking = require('../models/Booking');

const router = express.Router();

// Create a booking
router.post('/', async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw createHttpError(400, 'Request body is empty');
    }

    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json({
      status: 'success',
      message: 'Booking submitted successfully!',
      booking: savedBooking
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.entries(error.errors).forEach(([field, err]) => {
        errors[field] = err.message;
      });

      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        status: 'fail',
        message: `${field} already exists`,
        errors: { [field]: `${field} must be unique` }
      });
    }

    next(error);
  }
});

module.exports = router;