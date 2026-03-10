require("dotenv").config();

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// Email Transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASS
//   }
// });
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});


// Reservation API
app.post("/api/reserve", async (req, res) => {

  const { name, email, phone, guests, date, time, requests } = req.body;

  if (!name || !email || !phone || !guests || !date || !time) {
    return res.status(400).json({ error: "All fields required" });
  }

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  try {

    // OWNER EMAIL
    await transporter.sendMail({
      from: `"The Signature Brew Cafe" <${process.env.EMAIL}>`,
      to: process.env.OWNER_EMAIL,
      subject: "☕ New Cafe Reservation",
      html: `

<div style="background:#f4f4f4;padding:30px;font-family:Arial">

<div style="max-width:600px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.15)">

<div style="background:#6b3e26;color:white;padding:25px;text-align:center">
<h2>☕ New Reservation</h2>
<p>The Signature Brew Cafe</p>
</div>

<div style="padding:25px">

<h3 style="margin-bottom:20px;color:#333">Reservation Details</h3>

<table style="width:100%;border-collapse:collapse;font-size:15px">

<tr>
<td style="padding:10px;border-bottom:1px solid #ddd"><b>Name</b></td>
<td style="padding:10px;border-bottom:1px solid #ddd">${name}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #ddd"><b>Email</b></td>
<td style="padding:10px;border-bottom:1px solid #ddd">${email}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #ddd"><b>Phone</b></td>
<td style="padding:10px;border-bottom:1px solid #ddd">${phone}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #ddd"><b>Guests</b></td>
<td style="padding:10px;border-bottom:1px solid #ddd">${guests}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #ddd"><b>Date</b></td>
<td style="padding:10px;border-bottom:1px solid #ddd">${formattedDate}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #ddd"><b>Time</b></td>
<td style="padding:10px;border-bottom:1px solid #ddd">${time}</td>
</tr>

<tr>
<td style="padding:10px"><b>Special Request</b></td>
<td style="padding:10px">${requests || "None"}</td>
</tr>

</table>

</div>

<div style="background:#fafafa;padding:15px;text-align:center;font-size:12px;color:#777">
The Signature Brew Cafe Reservation System
</div>

</div>
</div>

`
    });


    // CUSTOMER EMAIL
    await transporter.sendMail({
      from: `"The Signature Brew Cafe" <${process.env.EMAIL}>`,
      to: email,
      subject: "✅ Reservation Confirmed",
      html: `

<div style="background:#f4f4f4;padding:30px;font-family:Arial">

<div style="max-width:600px;margin:auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.15)">

<div style="background:#4CAF50;color:white;padding:25px;text-align:center">
<h2>Reservation Confirmed</h2>
<p>We look forward to serving you ☕</p>
</div>

<div style="padding:25px">

<p>Hello <b>${name}</b>,</p>

<p>Your table reservation at <b>The Signature Brew Cafe</b> has been successfully confirmed.</p>

<h3 style="margin-top:25px;color:#333">Booking Details</h3>

<table style="width:100%;border-collapse:collapse;font-size:15px;margin-top:10px">

<tr>
<td style="padding:10px;border-bottom:1px solid #ddd"><b>Date</b></td>
<td style="padding:10px;border-bottom:1px solid #ddd">${formattedDate}</td>
</tr>

<tr>
<td style="padding:10px;border-bottom:1px solid #ddd"><b>Time</b></td>
<td style="padding:10px;border-bottom:1px solid #ddd">${time}</td>
</tr>

<tr>
<td style="padding:10px"><b>Guests</b></td>
<td style="padding:10px">${guests}</td>
</tr>

</table>

<p style="margin-top:25px">
If you need to modify your reservation please contact us.
</p>

</div>

<div style="background:#fafafa;padding:15px;text-align:center;font-size:12px;color:#777">
Thank you for choosing The Signature Brew Cafe
</div>

</div>
</div>

`
    });

    res.json({ success: true });

  } catch (error) {

    console.log(error);
    res.status(500).json({ error: "Email failed" });

  }

});


// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
