import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import UserModel from "../models/users.js";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
      // TODO: No need this if user is not found but still return 200 OK
      // const mailOptions = {
      //   to: email,
      //   from: process.env.EMAIL_USER,
      //   subject: 'Password Reset Instructions',
      //   text: `Hello,\n\nIt seems you have requested a password reset, but this email is not registered with us. If you believe this is an error, please contact support.\n`,
      // };

      // transporter.sendMail(mailOptions, (err, info) => {
      //   if (err) {
      //     console.error('Error sending email:', err.message);
      //     console.error('Error details:', err);
      //     return res.status(500).json({ message: 'Error sending email', error: err.message });
      //   }
      //   console.log('Instruction email sent:', info.response);
      // });

      return res.status(200).json({ message: 'Instructions sent to your email if it is registered with us.' });
    }

    if (user.resetPasswordToken && user.resetPasswordExpires > Date.now()) {
      return res.status(429).json({ message: 'Password reset link already sent to your email.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + (60000 * 5); // 5 minutes

    await user.save();

    const resetUrl = `http://54.71.217.98:3000/reset-password/${resetToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err.message);
        console.error('Error details:', err);
        return res.status(500).json({ message: 'Error sending email', error: err.message });
      }
      console.log('Email sent:', info.response);
      res.json({ message: 'Password reset link sent to your email' });
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

app.get('/validate-reset-token/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ valid: false });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Error validating reset token:', error);
    res.status(500).json({ message: 'Error validating reset token' });
  }
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'The reset token is invalid or has expired. Please request a new password reset.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      return res.status(400).json({ message: 'You have previously used this password. Please choose a different one.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Changed Successfully',
      text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending confirmation email:', err.message);
        console.error('Error details:', err);
      } else {
        console.log('Confirmation email sent:', info.response);
      }
    });

    res.json({ message: 'You have successfully reset your password.', redirectUrl: '/login' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

export default app;
