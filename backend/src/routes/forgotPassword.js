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
      return res.send(`
        <script>
          alert('User not found');
          window.location.href = '/forgot-password';
        </script>
      `);
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
        return res.send(`
          <script>
            alert('Error sending email');
            window.location.href = '/forgot-password';
          </script>
        `);
      }

      res.send(`
        <script>
          alert('Password reset link sent to your email');
        </script>
        
      `);
    });
  } catch (error) {
    res.send(`
      <script>
        alert('Error processing request');
        window.location.href = '/forgot-password';
      </script>
    `);
  }
});

app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reset Password</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@coreui/coreui@3.4.0/dist/css/coreui.min.css" integrity="sha384-gNJdGJtQY8MdGqZ9zwspRtXDB5FY6VV8f3p6EdLtqZ5mW9lKSBkB6a6f35nWPXaM" crossorigin="anonymous">
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f8f9fa;
          }
          .reset-container {
            max-width: 400px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
        </style>
      </head>
      <body>
        <div class="reset-container">
          <h1 class="text-center">Reset Password</h1>
          <form action="/reset-password/${token}" method="POST">
            <input type="hidden" name="token" value="${token}" />
            <div class="form-group">
              <label for="password">New Password:</label>
              <input type="password" name="password" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm Password:</label>
              <input type="password" name="confirmPassword" class="form-control" required />
            </div>
            <button type="submit" class="btn btn-primary btn-block">Reset Password</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.send(`
      <script>
        alert('Passwords do not match');
        window.location.href = '/reset-password/${token}';
      </script>
    `);
  }

  try {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.send(`
        <script>
          alert('Password reset token is invalid or has expired');
          window.location.href = '/forgot-password';
        </script>
      `);
    }

    // Check if the new password is the same as the current password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.send(`
        <script>
          alert('New password cannot be the same as the current password');
          window.location.href = '/reset-password/${token}';
        </script>
      `);
    }

    user.password = await bcrypt.hash(password, 10); // Hash the new password
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.send(`
      <script>
        alert('Password has been reset successfully');
        window.location.href = '/login';
      </script>
    `);
  } catch (error) {
    res.send(`
      <script>
        alert('Error resetting password');
        window.location.href = '/reset-password/${token}';
      </script>
    `);
  }
});

export default app;
