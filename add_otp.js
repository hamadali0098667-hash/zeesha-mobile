const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const serverPath = path.join(root, 'server');
const clientPath = path.join(root, 'client', 'src');

// 1. Create sendEmail.js
const utilsPath = path.join(serverPath, 'utils');
if (!fs.existsSync(utilsPath)) fs.mkdirSync(utilsPath);
const sendEmailCode = `const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email credentials not found in .env, skipping email.');
    return;
  }
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: \`"Zeesha Mobile" <\${process.env.EMAIL_USER}>\`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;`;
fs.writeFileSync(path.join(utilsPath, 'sendEmail.js'), sendEmailCode);

// 2. Update User Model
const userFile = path.join(serverPath, 'models', 'User.js');
let userContent = fs.readFileSync(userFile, 'utf8');
if (!userContent.includes('otp: {')) {
  userContent = userContent.replace(
    'isActive: { type: Boolean, default: true }',
    'isActive: { type: Boolean, default: true },\n  otp: { type: String },\n  otpExpire: { type: Date }'
  );
  fs.writeFileSync(userFile, userContent);
}

// 3. Update authController.js
const authCtrlFile = path.join(serverPath, 'controllers', 'authController.js');
const authCtrlCode = `const asyncHandler = require('express-async-handler');
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
    const message = \`
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Zeesha Mobile - Login Verification</h2>
        <p>Dear \${user.name},</p>
        <p>Your One-Time Password (OTP) for login is: <strong style="font-size: 24px; color: #4f46e5;">\${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      </div>
    \`;

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

  if (user && user.otp === otp && user.otpExpire > Date.now()) {
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

module.exports = { loginUser, verifyOtp };`;
fs.writeFileSync(authCtrlFile, authCtrlCode);

// 4. Update authRoutes.js
const authRoutesFile = path.join(serverPath, 'routes', 'authRoutes.js');
let authRoutesContent = fs.readFileSync(authRoutesFile, 'utf8');
if (!authRoutesContent.includes('/verify-otp')) {
  authRoutesContent = authRoutesContent.replace(
    "const { loginUser } = require('../controllers/authController');",
    "const { loginUser, verifyOtp } = require('../controllers/authController');"
  );
  authRoutesContent = authRoutesContent.replace(
    "router.post('/login', loginUser);",
    "router.post('/login', loginUser);\nrouter.post('/verify-otp', verifyOtp);"
  );
  fs.writeFileSync(authRoutesFile, authRoutesContent);
}

// 5. Update Login.jsx (Frontend)
const loginFile = path.join(clientPath, 'pages', 'Login.jsx');
const loginCode = `import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState(null);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setUserId(data.userId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/verify-otp', { userId, otp });
      login(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2">Zeesha Mobile</h1>
          <p className="text-gray-500 dark:text-gray-400">{step === 1 ? 'Sign in to your account' : 'Enter 4-Digit OTP sent to your email'}</p>
        </div>
        
        {error && <div className="bg-red-50 dark:bg-red-900/30 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input type="password" required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">4-Digit OTP</label>
              <input type="text" required maxLength="4" className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-colors">
              {loading ? 'Checking...' : 'Verify & Enter'}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-indigo-600 dark:text-indigo-400 text-sm mt-2">
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;`;
fs.writeFileSync(loginFile, loginCode);

console.log('OTP logic injected.');
