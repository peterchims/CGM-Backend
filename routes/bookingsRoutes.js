require('dotenv').config();
const express = require('express');
const createHttpError = require('http-errors');
const Booking = require('../models/Booking');
const nodemailer = require('nodemailer');

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  
    pass: process.env.GMAIL_PASS   
  }
});

const sendAdminNotification = async (booking) => {
  const mailOptions = {
    from: `"ClaudyGod Music Ministry - Support Team" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // Send to yourself/admin
    subject: `📝 New Booking from ${booking.name}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Booking Received</h2>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone}</p>
        <p><strong>Date:</strong> ${booking.date}</p>
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Additional Info:</strong></p>
        <blockquote>${booking.message || 'No message provided'}</blockquote>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};


const sendUserConfirmation = async (booking) => {
  const mailOptions = {
    from: `"Support Team" <${process.env.GMAIL_USER}>`,
    to: booking.email,
    subject: `✅ Booking Received – Thank You, ${booking.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Hi ${booking.name},</h2>

        <p>Thank you for booking with us!</p>
        <p>We've received your booking for <strong>${booking.service}</strong> on <strong>${booking.date}</strong>.</p>

        <p>If we need more details, someone from our team will contact you shortly. You’ll receive a final confirmation once everything is set.</p>

        <p>For urgent requests, please reach out to us at <a href="mailto:claudygodmusic@gmail.com">claudygodmusic@gmail.com</a>.</p>

        <br/>
        <p>Best regards,</p>
           <p style="font-size: 0.9em; color: #666;">
            ClaudyGod Music & Ministries<br/>
            <a href="https://www.claudygod.org" style="color: #1a73e8;">www.claudygod.org</a><br />
            Follow us on <a href="https://www.facebook.com/claudygod" style="color: #1a73e8;">Facebook</a>, <a href="https://www.instagram.com/claudygod" style="color: #1a73e8;">Instagram</a> & <a href="https://twitter.com/claudygod" style="color: #1a73e8;">Twitter</a>
          </p>
        <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

router.post('/', async (req, res, next) => {
  try {
    if (!req.body || !Object.keys(req.body).length) {
      throw createHttpError(400, 'Request body is empty');
    }

    const newBooking = new Booking(req.body);
    const saved = await newBooking.save();

    // Send emails
    await Promise.all([
      sendAdminNotification(saved),
      sendUserConfirmation(saved)
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Booking submitted successfully!',
      booking: saved
    });

  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = {};
      Object.entries(err.errors).forEach(([field, e]) => errors[field] = e.message);
      return res.status(400).json({ status: 'fail', message: 'Validation failed', errors });
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        status: 'fail',
        message: `${field} must be unique`,
        errors: { [field]: `${field} already exists` }
      });
    }

    next(err);
  }
});

module.exports = router;
