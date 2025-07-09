
const express        = require('express');
const createHttpError= require('http-errors');
const Booking        = require('../models/Booking');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    if (!req.body || !Object.keys(req.body).length) {
      throw createHttpError(400, 'Request body is empty');
    }
    const newBooking = new Booking(req.body);
    const saved      = await newBooking.save();
    res.status(201).json({
      status: 'success',
      message:'Booking submitted successfully!',
      booking: saved
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.entries(err.errors).forEach(([f,e])=>errors[f]=e.message);
      return res.status(400).json({ status:'fail', message:'Validation failed', errors });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        status:'fail',
        message:`${field} must be unique`,
        errors:{ [field]: `${field} already exists` }
      });
    }
    next(err);
  }
});

module.exports = router;
