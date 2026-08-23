const fs = require('fs');

let controller = fs.readFileSync('server/controllers/staffController.js', 'utf-8');
controller = controller.replace(
  "module.exports = { getStaff, createStaff, updateStaff };",
  "const deleteStaff = asyncHandler(async (req, res) => {\n  const user = await User.findById(req.params.id);\n  if (user) {\n    await User.deleteOne({ _id: user._id });\n    res.json({ message: 'Staff removed' });\n  } else {\n    res.status(404); throw new Error('User not found');\n  }\n});\n\nmodule.exports = { getStaff, createStaff, updateStaff, deleteStaff };"
);
fs.writeFileSync('server/controllers/staffController.js', controller);

let routes = fs.readFileSync('server/routes/staffRoutes.js', 'utf-8');
routes = routes.replace(
  "const { getStaff, createStaff, updateStaff } = require('../controllers/staffController');",
  "const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');"
);
routes = routes.replace(
  "router.route('/:id').put(protect, isAdmin, updateStaff);",
  "router.route('/:id').put(protect, isAdmin, updateStaff).delete(protect, isAdmin, deleteStaff);"
);
fs.writeFileSync('server/routes/staffRoutes.js', routes);

console.log('Staff Backend updated!');
