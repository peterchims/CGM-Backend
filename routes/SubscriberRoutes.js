const express = require('express');
const router  = express.Router();
const Subscriber = require('../models/Subscriber');

router.post('/', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email required' });
  }
  try {
    const sub = new Subscriber({ name, email });
    await sub.save();
    res.status(201).json({ success: true, message: 'Subscribed!', data: sub });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already subscribed' });
    }
    console.error('Subscription error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
