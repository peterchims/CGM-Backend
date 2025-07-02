const express = require('express');
const router = express.Router();
const ZellePayment = require('../models/ZellePayment');

router.post('/validate', async (req, res) => {
  try {
    const { 
      zelleSenderEmail, 
      zelleConfirmation,
      amount,
      currency
    } = req.body;

    // Validation
    if (!zelleSenderEmail || !zelleConfirmation || !amount || !currency) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate transaction ID format
    const idRegex = /^[A-Z0-9]{9}$/;
    if (!idRegex.test(zelleConfirmation)) {
      return res.status(400).json({ error: 'Transaction ID must be 9 uppercase alphanumeric characters' });
    }
    
    // Check for duplicate transaction ID
    const existingPayment = await ZellePayment.findOne({ 
      transactionId: zelleConfirmation.toUpperCase() 
    });
    
    if (existingPayment) {
      return res.status(409).json({ error: 'This transaction ID has already been used' });
    }

    // Create new record
    const newPayment = new ZellePayment({
      senderEmail: zelleSenderEmail.toLowerCase(),
      transactionId: zelleConfirmation.toUpperCase(),
      amount: parseFloat(amount),
      currency
    });

    await newPayment.save();

    res.status(200).json({ message: 'Zelle payment validated successfully' });
  } catch (error) {
    console.error('Zelle validation error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Duplicate transaction ID detected' });
    }
    
    res.status(500).json({ error: 'Server error during validation' });
  }
});

module.exports = router;