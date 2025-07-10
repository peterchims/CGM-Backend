const express = require('express');
const router = express.Router();
const multer = require('multer');
const NigerianBankTransfer = require('../models/NigerianBankTransfer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/validate', upload.single('slipFile'), async (req, res) => {
  try {
    const { reference, senderName, amount, currency } = req.body;
    const slipFile = req.file;

    // Validation
    if (!reference || !senderName || !amount || !currency) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (reference.length !== 10) {
      return res.status(400).json({ error: 'Reference must be exactly 10 characters' });
    }
    
    if (!slipFile) {
      return res.status(400).json({ error: 'Payment slip is required' });
    }
    
    if (slipFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Check for duplicate reference
    const existingTransfer = await NigerianBankTransfer.findOne({ reference });
    if (existingTransfer) {
      return res.status(409).json({ error: 'Duplicate transaction reference' });
    }

    // Create new record
    const newTransfer = new NigerianBankTransfer({
      reference,
      senderName,
      amount: parseFloat(amount),
      currency,
      slipFile: {
        data: slipFile.buffer,
        contentType: slipFile.mimetype
      },
      status: 'pending'
    });

    await newTransfer.save();

    res.status(200).json({ message: 'Payment validation successful' });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Server error during validation' });
  }
});

module.exports = router;