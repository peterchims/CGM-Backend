require('dotenv').config();
const express = require('express');
const router = express.Router();
const Volunteer = require('../models/Volunteer');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // Your Gmail
    pass: process.env.GMAIL_PASS   // Gmail App Password
  }
});
const sendAdminNotification = async (volunteer) => {
  const mailOptions = {
    from: `"Volunteer Portal" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // Admin receives this
    subject: `🙋‍♂️ New Volunteer: ${volunteer.firstName} ${volunteer.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Volunteer Registration</h2>
        <p><strong>Name:</strong> ${volunteer.firstName} ${volunteer.lastName}</p>
        <p><strong>Email:</strong> <a href="mailto:${volunteer.email}">${volunteer.email}</a></p>
        <p><strong>Role Applied For:</strong> ${volunteer.role}</p>
        <p><strong>Why they want to volunteer:</strong></p>
        <blockquote>${volunteer.reason}</blockquote>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
const sendVolunteerConfirmation = async (volunteer) => {
  const mailOptions = {
    from: `"Support Team" <${process.env.GMAIL_USER}>`,
    to: volunteer.email,
    subject: `✅ Thank you for signing up to volunteer, ${volunteer.firstName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2c3e50;">Hi ${volunteer.firstName},</h2>
        <p>Thank you for signing up to volunteer with us! 🙌</p>
        <p>We appreciate your interest in the role of <strong>${volunteer.role}</strong> and are currently reviewing your submission.</p>
        <p>If we need any more information, our team will reach out soon.</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>The Volunteer Coordination Team</strong><br/>ClaudyGod Music & Ministries </p>
        <hr style="margin-top: 30px;" />
        <p style="font-size: 0.9em; color: #666;">
            ClaudyGod Music & Ministries<br/>
            <a href="https://www.claudygod.org" style="color: #1a73e8;">www.claudygod.org</a><br />
            Follow us on <a href="https://www.facebook.com/claudygod" style="color: #1a73e8;">Facebook</a>, <a href="https://www.instagram.com/claudygod" style="color: #1a73e8;">Instagram</a> & <a href="https://twitter.com/claudygod" style="color: #1a73e8;">Twitter</a>
          </p>
        <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply directly to this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, role, reason } = req.body;

    if (!firstName || !lastName || !email || !role || !reason) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newVolunteer = new Volunteer({ firstName, lastName, email, role, reason });
    const savedVolunteer = await newVolunteer.save();
    await Promise.all([
      sendAdminNotification(savedVolunteer),
      sendVolunteerConfirmation(savedVolunteer)
    ]);
    return res.status(201).json(savedVolunteer);
  } catch (error) {
    console.error('Error creating volunteer:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
