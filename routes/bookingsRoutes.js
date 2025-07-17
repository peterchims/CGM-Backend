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
    subject: `📝 New Booking from ${booking.organization}`,
    html: `
  <div style="font-family: Arial, sans-serif;">
    <h2 style="color:#2c3e50;">New Booking Received</h2>

    <p><strong>Full Name:</strong> ${booking.firstName} ${booking.lastName}</p>
    <p><strong>Email:</strong> <a href="mailto:${booking.email}">${booking.email}</a></p>
    <p><strong>Phone:</strong> ${booking.phone}</p>
    <p><strong>Country Code:</strong> ${booking.countryCode}</p>

    <p><strong>Organization:</strong> ${booking.organization}</p>
    <p><strong>Organization Type:</strong> ${booking.orgType}</p>

    <p><strong>Event Type:</strong> ${booking.eventType}</p>
    <p><strong>Event Date:</strong> ${booking.eventDate}</p>

    <p><strong>Event Details:</strong></p>
    <blockquote style="background: #f4f4f4; padding: 10px;">${booking.eventDetails}</blockquote>

    <p><strong>Event Location:</strong></p>
    <ul style="margin-left: 20px;">
      <li><strong>Address 1:</strong> ${booking.address.address1}</li>
      ${booking.address.address2 ? `<li><strong>Address 2:</strong> ${booking.address.address2}</li>` : ''}
      <li><strong>City:</strong> ${booking.address.city}</li>
      <li><strong>State:</strong> ${booking.address.state}</li>
      <li><strong>Zip Code:</strong> ${booking.address.zipCode}</li>
      <li><strong>Country:</strong> ${booking.address.country}</li>
    </ul>

    <p><strong>Agreed to Terms:</strong> ${booking.agreeTerms ? 'Yes' : 'No'}</p>

    <hr style="margin-top: 30px;"/>
    <p style="font-size: 12px; color: #999;">Booking submitted on ${new Date(booking.createdAt).toLocaleString()}</p>
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
    <h2 style="color: #2c3e50;">Hi ${booking.firstName},</h2>

    <p>Thank you for booking with us!</p>

    <p>We've received your request for a <strong>${booking.eventType}</strong> scheduled on <strong>${booking.eventDate}</strong>.</p>

    <p>Your organization, <strong>${booking.organization}</strong>, has been noted. Our team is reviewing your request and will follow up shortly if more details are needed.</p>

    <p>For urgent matters, feel free to reach out to us at <a href="mailto:claudygodmusic@gmail.com">claudygodmusic@gmail.com</a>.</p>

    <br/>
    <p>Warm regards,</p>
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
