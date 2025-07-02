const express = require('express');
const router = express.Router();

router.get('/generate-url', (req, res) => {
  try {
    const { amount, currency } = req.query;
    
    // Validate required parameters
    if (!amount || !currency) {
      return res.status(400).json({ 
        error: 'Missing required parameters: amount or currency' 
      });
    }

    // Get PayPal business email
    const businessEmail = process.env.PAYPAL_BUSINESS_EMAIL;
    if (!businessEmail) {
      return res.status(500).json({ 
        error: 'PayPal business email not configured'
      });
    }

    // Get base URL - fixed environment variable
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://claudygod.org';
    
    // Construct the return URL
    const returnUrl = encodeURIComponent(`${baseUrl}/donation-complete`);
    
    // Construct the PayPal URL
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

module.exports = router;