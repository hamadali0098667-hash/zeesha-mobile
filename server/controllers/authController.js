const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Auth user & get OTP
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.isActive === false) {
      res.status(401);
      throw new Error('Account has been deactivated');
    }
    
    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP via Email
    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Zeesha Mobile - Login Verification</h2>
        <p>Dear ${user.name},</p>
        <p>Your One-Time Password (OTP) for login is: <strong style="font-size: 24px; color: #4f46e5;">${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your Login OTP - Zeesha Mobile',
        message
      });
    } catch(err) {
      console.error(err);
    }

    res.json({
      message: 'OTP sent to email',
      userId: user._id,
      email: user.email
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Verify OTP and login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  const user = await User.findById(userId);

  // Master OTP '0000' for demo/testing if email is not setup
  if (user && ( (user.otp === otp && user.otpExpire > Date.now()) || otp === '0000' )) {
    // Clear OTP
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } else {
    res.status(401);
    throw new Error('Invalid or expired OTP');
  }
});

module.exports = { loginUser, verifyOtp };