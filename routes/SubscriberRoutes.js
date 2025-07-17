// routes/SubscriberRoutes.js
require('dotenv').config();
const express    = require('express');
const path       = require('path');
const router     = express.Router();
const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer');

// ───────────────────────────────────────────────────────────────────────────────
// 1) Configure Gmail transporter with your App Password
// ───────────────────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // your.address@gmail.com
    pass: process.env.GMAIL_PASS,  // your App Password
  },
});

transporter.verify(err => {
  if (err) console.error('🚨 Gmail SMTP error:', err);
  else      console.log('✅ Gmail transporter ready');
});

// ───────────────────────────────────────────────────────────────────────────────
// 2) POST /api/subscribers
// ───────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  // 2a) Validate
  if (!name || !email) {
    return res.status(400).json({ status: 'error', message: 'Name and email are required.' });
  }

  try {
    // 2b) Save to DB (will throw if duplicate)
    const subscriber = await Subscriber.create({ name, email });

    // 2c) Notify yourself
    await transporter.sendMail({
      from: `"ClaudyGod Music & Ministries" <${process.env.GMAIL_USER}>`,
      to:   process.env.EMAIL_TO,
      subject: `New Subscriber: ${name}`,
      text:    `New subscriber:\n\nName: ${name}\nEmail: ${email}`,
    });

    // 2d) Send confirmation to the user with professional content
    await transporter.sendMail({
      from: `"ClaudyGod Music & Ministries" <${process.env.GMAIL_USER}>`,
      to:   email,
      subject: 'Welcome to the ClaudyGod Newsletter!',
      text: `Hi ${name},

Thank you for subscribing to the ClaudyGod Music & Ministries newsletter.

You’re now part of a community that receives:
  • Inspiring devotionals and teaching updates  
  • Exclusive event invitations and early-bird access  
  • Music releases, behind‑the‑scenes content, and more  

You can expect to hear from us once or twice a month. In the meantime, feel free to reach out with any questions at support@claudygod.org.

Blessings,
The ClaudyGod Team
www.claudygod.org`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto;">
          <p>Hi <strong>${name}</strong>,</p>

          <p>Thank you for subscribing to the <strong>ClaudyGod Music & Ministries</strong> newsletter!</p>

          <p>We’re delighted to have you on board. As a subscriber, you’ll receive:</p>
          <ul>
            <li><strong>Inspiring devotionals</strong> and practical teaching updates</li>
            <li><strong>Exclusive invitations</strong> to concerts, worship nights, and community events</li>
            <li><strong>Early access</strong> to new music releases, behind‑the‑scenes stories, and more</li>
          </ul>
          <p>Once again, welcome! We look forward to growing together.</p>
          <p style="margin-top: 30px;">
            <strong>With blessings,</strong><br/>
            The <em>ClaudyGod Music & Ministries</em> Team
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

          <p style="font-size: 0.9em; color: #666;">
            ClaudyGod Music & Ministries<br/>
            <a href="https://www.claudygod.org" style="color: #1a73e8;">www.claudygod.org</a><br />
            Follow us on <a href="https://www.facebook.com/claudygod" style="color: #1a73e8;">Facebook</a>, <a href="https://www.instagram.com/claudygod" style="color: #1a73e8;">Instagram</a> & <a href="https://twitter.com/claudygod" style="color: #1a73e8;">Twitter</a>
          </p>
        </div>
      `
    });

    // 2e) Respond to client
    res.status(201).json({ status: 'success', message: 'Subscribed successfully — check your inbox!', data: subscriber });

  } catch (err) {
    console.error('❌ /api/subscribers error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'Email already subscribed.' });
    }
    res.status(500).json({ status: 'error', message: 'Could not complete subscription.' });
  }
});

module.exports = router;