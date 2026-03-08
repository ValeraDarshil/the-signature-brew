// =====================================================
// -The Signature Brew Reservation Email Backend
// =====================================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- EMAIL TRANSPORTER (Gmail + IPv4 force — works on Render!) ----
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Reservation endpoint
app.post('/api/reserve', async (req, res) => {
    const { name, email, phone, guests, date, time, requests } = req.body;

    // Validate
    if (!name || !email || !phone || !guests || !date || !time) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Format date
    const formattedDate = new Date(date).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // Email to café owner
    const ownerMailOptions = {
        from: '"The Signature Brew" <manavvalera05@gmail.com>',
        to: 'manavvalera05@gmail.com',
        subject: `🍽️ New Table Reservation – The Signature Brew`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1412;color:#f5e6d3;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#c8a97e,#8a6d3b);padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#0a0908;font-size:24px;">☕ New Reservation</h1>
                    <p style="margin:5px 0 0;color:#0a0908;opacity:0.8;">The Signature Brew — Table Booking</p>
                </div>
                <div style="padding:30px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#c8a97e;width:140px;">👤 Name</td>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#f5e6d3;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#c8a97e;">📧 Email</td>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#f5e6d3;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#c8a97e;">📱 Phone</td>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#f5e6d3;">${phone}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#c8a97e;">👥 Guests</td>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#f5e6d3;">${guests}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#c8a97e;">📅 Date</td>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#f5e6d3;">${formattedDate}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#c8a97e;">🕐 Time</td>
                            <td style="padding:12px 0;border-bottom:1px solid rgba(200,169,126,0.2);color:#f5e6d3;">${time}</td>
                        </tr>
                        <tr>
                            <td style="padding:12px 0;color:#c8a97e;">📝 Special Requests</td>
                            <td style="padding:12px 0;color:#f5e6d3;">${requests || 'None'}</td>
                        </tr>
                    </table>
                </div>
                <div style="padding:20px 30px;background:rgba(200,169,126,0.1);text-align:center;font-size:12px;color:rgba(245,230,211,0.5);">
                    Sent from The Signature Brew Website Reservation System
                </div>
            </div>
        `
    };

    // Confirmation email to customer
    const customerMailOptions = {
        from: '"The Signature Brew" <manavvalera05@gmail.com>',
        to: email,
        subject: `Your Reservation at The Signature Brew is Confirmed! ☕`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1412;color:#f5e6d3;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#c8a97e,#8a6d3b);padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#0a0908;font-size:24px;">☕ Reservation Confirmed!</h1>
                </div>
                <div style="padding:30px;">
                    <p style="font-size:16px;">Hello <strong>${name}</strong>,</p>
                    <p>Thank you for reserving a table at <strong>The Signature Brew</strong>! Here are your booking details:</p>
                    <div style="background:rgba(200,169,126,0.1);border:1px solid rgba(200,169,126,0.2);border-radius:12px;padding:20px;margin:20px 0;">
                        <p>📅 <strong>Date:</strong> ${formattedDate}</p>
                        <p>🕐 <strong>Time:</strong> ${time}</p>
                        <p>👥 <strong>Guests:</strong> ${guests}</p>
                    </div>
                    <p>We look forward to welcoming you! If you need to modify your reservation, please call us at <strong>+91 98765 43210</strong>.</p>
                    <p style="color:#c8a97e;">With love,<br>Team The Signature Brew ☕</p>
                </div>
                <div style="padding:20px;background:rgba(200,169,126,0.1);text-align:center;font-size:12px;color:rgba(245,230,211,0.5);">
                    83 /A हाई विद्यालय, Alkapuri, Vadodara, Gujarat 390007 | +91 81412 87148
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(ownerMailOptions);
        await transporter.sendMail(customerMailOptions);
        console.log(`✅ Reservation confirmed: ${name} - ${formattedDate} at ${time}`);
        res.json({ success: true, message: 'Reservation confirmed! Emails sent.' });
    } catch (error) {
        console.error('❌ Email error:', error);
        res.status(500).json({ error: 'Failed to send confirmation email.' });
    }
});

// Serve the website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n☕  server running at http://localhost:${PORT}\n`);
});