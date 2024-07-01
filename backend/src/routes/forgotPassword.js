import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import UserModel from "../models/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configure the email transport using the default SMTP transport and a GMail account.
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Forgot password route
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set reset token and expiry time on the user object
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    await user.save();

    const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'Error sending email' });
      }

      console.log('Password reset link sent:', resetUrl);
      res.status(200).json({ message: 'Password reset link sent to your email' });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;

  console.log('Serving reset password form for token:', token);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reset Password</title>
      </head>
      <body>
        <h1>Reset Password</h1>
        <form action="/reset-password/${token}" method="POST">
          <input type="hidden" name="token" value="${token}" />
          <label for="password">New Password:</label>
          <input type="password" name="password" required />
          <br>
          <label for="confirmPassword">Confirm Password:</label>
          <input type="password" name="confirmPassword" required />
          <br>
          <button type="submit">Reset Password</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    console.log('Passwords do not match');
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log('Password reset token is invalid or has expired');
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    user.password = await bcrypt.hash(password, 10); // Hash the new password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    console.log('Password has been reset successfully');
    // Redirect to the login page after successful password reset
    res.status(200).json({ message: 'Password has been reset successfully', redirectUrl: '/login' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
