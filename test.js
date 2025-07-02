// src/mockServer.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = 10000;

// Mock PayPal endpoint
app.get('/api/paypal/generate-url', (req, res) => {
  const { amount, currency } = req.query;
  
  console.log(`Received request: amount=${amount}, currency=${currency}`);
  
  if (!amount || !currency) {
    return res.status(400).json({ 
      error: 'Missing required parameters: amount or currency' 
    });
  }
  
  // Simulate real PayPal URL
  const paypalUrl = `https://www.paypal.com/donate/?business=test@example.com&amount=${amount}&currency=${currency}`;
  
  console.log(`Returning PayPal URL: ${paypalUrl}`);
  res.status(200).json({ url: paypalUrl });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});