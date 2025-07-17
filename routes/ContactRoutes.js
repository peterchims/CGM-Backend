require('dotenv').config();
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  
    pass: process.env.GMAIL_PASS   
  }
});

const sendAdminNotification = async ({ name, email, message }) => {
  const mailOptions = {
    from: `"Contact Form" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,  // Admin receives the message
    subject: `📩 New Contact Message from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <blockquote style="background:#f9f9f9;border-left:5px solid #ccc;padding:10px;">
          ${message}
        </blockquote>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

const sendUserConfirmation = async ({ name, email }) => {
  const mailOptions = {
    from: `"ClaudyGod Music & Minitries - Support Team" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `✅ Your message has been received – Thank you, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Hello ${name},</h2>
        
        <p>Thank you for getting in touch with us!</p>

        <p>We have received your message and our team is currently 
        reviewing it. You can expect to hear back from us within 24–48 hours.</p>

        <p>If your inquiry is urgent, feel free to reply to this email or reach us directly at <a href="mailto:support@example.com" style="color: #3498db;">support@example.com</a>.</p>

        <p>We truly appreciate your interest and will do our best to assist you promptly.</p>

        <br/>

        <p>Warm regards,</p>
        <p style="font-weight: bold;">The Support Team</p>
 <p style="font-size: 0.9em; color: #666;">
            ClaudyGod Music & Ministries<br/>
            <a href="https://www.claudygod.org" style="color: #1a73e8;">www.claudygod.org</a><br />
            Follow us on <a href="https://www.facebook.com/claudygod" style="color: #1a73e8;">Facebook</a>, <a href="https://www.instagram.com/claudygod" style="color: #1a73e8;">Instagram</a> & <a href="https://twitter.com/claudygod" style="color: #1a73e8;">Twitter</a>
          </p>
        <p style="font-size: 12px; color: #aaa;">This is an automated message – please do not reply directly to this email.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    await Promise.all([
      sendAdminNotification({ name, email, message }),
      sendUserConfirmation({ name, email })
    ]);

    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error in contact route:', error);
    res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

module.exports = router;
