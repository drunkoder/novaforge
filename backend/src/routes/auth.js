import express from "express";
import UserModel from "../models/users.js";
import { userRoles } from '../utils/enums.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password, admin } = req.body;

  try {
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    if(admin && user.role !== userRoles.ADMIN){
      return res.status(400).json({ message: 'Access Denied' });
    }

    const newUser = {
      id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      friendly_name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      nova_coin_balance: user.nova_coin_balance
    };

    console.log(process.env.JWT_SEED);
    const token = jwt.sign(newUser, process.env.JWT_SEED);

    res.json({ message: "Login successful", user: newUser, token});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default app;
