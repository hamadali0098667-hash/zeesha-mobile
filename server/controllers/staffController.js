const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private/Admin
const getStaff = asyncHandler(async (req, res) => {
  const staff = await User.find({}).select('-password');
  res.json(staff);
});

// @desc    Create a staff member
// @route   POST /api/staff
// @access  Private/Admin
const createStaff = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, role });
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
const updateStaff = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.isActive !== undefined) {
        user.isActive = req.body.isActive;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const deleteStaff = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'Staff removed' });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

module.exports = { getStaff, createStaff, updateStaff, deleteStaff };