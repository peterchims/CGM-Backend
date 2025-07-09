const express = require('express');
const router = express.Router();

// PayPal route handler - defined BEFORE export
router.get('/generate-url', (req, res) => {
  try {
    const { amount, currency } = req.query;
    
    if (!amount || !currency) {
      return res.status(400).json({ 
        error: 'Missing required parameters: amount or currency' 
      });
    }

    const businessEmail = process.env.PAYPAL_BUSINESS_EMAIL;
    if (!businessEmail) {
      return res.status(500).json({ 
        error: 'PayPal business email not configured'
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://claudygod.org';
    const returnUrl = encodeURIComponent(`${baseUrl}/donation-complete`);
    
    const paypalUrl = `https://www.paypal.com/donate/?business=${businessEmail}&cmd=_donations&currency_code=${currency}&item_name=Donation+to+ClaudyGod&amount=${amount}&return=${returnUrl}`;
    
    res.status(200).json({ url: paypalUrl });
  } catch (error) {
    console.error('Error generating PayPal URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate PayPal URL',
      details: error.message 
    });
  }
});

// Export AFTER defining all routes
module.exports = router;
