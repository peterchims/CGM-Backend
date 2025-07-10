const express = require('express');
const router = express.Router();
const ZellePayment = require('../models/ZellePayment');

router.post('/validate', async (req, res) => {
  try {
    const { 
      zelleSenderEmail, 
      zelleSenderPhone, 
      zelleConfirmation,
      amount,
      currency
    } = req.body;

    // Validation - ensure at least one identifier is provided
    if ((!zelleSenderEmail && !zelleSenderPhone) || !zelleConfirmation || !amount || !currency) {
      return res.status(400).json({ error: 'All required fields must be provided' });
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

    // Prepare payment data
    const paymentData = {
      senderEmail: zelleSenderEmail ? zelleSenderEmail.toLowerCase() : undefined,
      senderPhone: zelleSenderPhone ? zelleSenderPhone.replace(/\D/g, '') : undefined,
      transactionId: zelleConfirmation.toUpperCase(),
      amount: parseFloat(amount),
      currency
    };

    // Create new record
    const newPayment = new ZellePayment(paymentData);
    await newPayment.save();

    res.status(200).json({ message: 'Zelle payment validated successfully' });
  } catch (error) {
    console.error('Zelle validation error:', error);
    
    if (error.name === 'ValidationError') {
      // Handle Mongoose validation errors
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    if (error.code === 11000) {
      // Handle duplicate key error (transactionId)
      return res.status(409).json({ error: 'Duplicate transaction ID detected' });
    }
    
    // Handle custom validation errors from pre-save hooks
    if (error.message === 'Either sender email or phone must be provided') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error during validation' });
  }
});

module.exports = router;