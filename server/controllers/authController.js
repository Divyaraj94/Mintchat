import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import validateEmail from 'deep-email-validator';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'PLACEHOLDER');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// Ethereal email for dev testing
const getTransporter = async () => {
  let testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check if username is taken
    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // 2. Check if email is registered
    const emailTaken = await User.findOne({ email });
    if (emailTaken) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // 3. Validate email deeply
    try {
      const emailValidation = await validateEmail(email);
      // We only block if the format is invalid or if it's a known disposable/spam email.
      // We skip the strict 'mx' check because it often fails on certain networks even for real emails.
      if (!emailValidation.validators.regex.valid) {
        return res.status(400).json({ message: 'Please provide a valid email address format.' });
      }
      if (emailValidation.validators.disposable && !emailValidation.validators.disposable.valid) {
        return res.status(400).json({ message: 'Disposable email addresses are not allowed.' });
      }
    } catch (valErr) {
      console.warn("Email validation warning:", valErr.message);
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else if (user && !user.password) {
      res.status(401).json({ message: 'Please login with Google for this account' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    let email, name, googleId, picture;

    if (credential) {
      // Verify the Google ID Token (Standard component)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) return res.status(400).json({ message: 'Invalid Google Token' });
      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
      picture = payload.picture;
    } else if (accessToken) {
      // Verify via access token (Custom button)
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      const data = await response.json();
      if (!data.email) return res.status(400).json({ message: 'Invalid Google Access Token' });
      email = data.email;
      name = data.name;
      googleId = data.sub;
      picture = data.picture;
    } else {
      return res.status(400).json({ message: 'No Google credentials provided' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).slice(2, 6),
        name,
        email,
        googleId,
        picture,
      });
    } else {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (picture && user.picture !== picture) {
        user.picture = picture;
        updated = true;
      }
      if (name && user.name !== name) {
        user.name = name;
        updated = true;
      }
      if (updated) await user.save();
    }

    res.json({
      _id: user._id,
      username: user.username,
      name: user.name || user.username,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email address.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save({ validateBeforeSave: false });

    // Assuming client runs on 5173
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    try {
      const transporter = await getTransporter();
      const info = await transporter.sendMail({
        from: '"MindChat Support" <noreply@mindchat.ai>',
        to: user.email,
        subject: 'MindChat Password Reset',
        text: `You requested a password reset. Please click on the link to reset your password: ${resetUrl}`,
      });
      
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      
      res.status(200).json({ 
        message: 'Email sent successfully. Check server console for Ethereal test link.',
        previewUrl: nodemailer.getTestMessageUrl(info)
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
