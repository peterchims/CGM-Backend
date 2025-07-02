// server/routes/volunteerRoutes.js
const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');

// @route   POST /api/volunteers
// @desc    Create a new volunteer entry
// @access  Public (you can add auth middleware later if you want)
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, role, reason } = req.body;

    // Basic server-side validation (optional but recommended)
    if (!firstName || !lastName || !email || !role || !reason) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create the new Volunteer document
    const newVolunteer = new Volunteer({
      firstName,
      lastName,
      email,
      role,
      reason,
    });

    const savedVolunteer = await newVolunteer.save();
    return res.status(201).json(savedVolunteer);
  } catch (error) {
    console.error('Error creating volunteer:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
