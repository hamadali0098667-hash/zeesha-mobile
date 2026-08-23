const asyncHandler = require('express-async-handler');
const Repair = require('../models/Repair');

const getRepairs = asyncHandler(async (req, res) => {
  const repairs = await Repair.find({}).populate('customer', 'name phone');
  res.json(repairs);
});

const createRepair = asyncHandler(async (req, res) => {
  const repair = new Repair(req.body);
  const createdRepair = await repair.save();
  res.status(201).json(createdRepair);
});

const updateRepairStatus = asyncHandler(async (req, res) => {
  const repair = await Repair.findById(req.params.id);
  if (repair) {
    repair.status = req.body.status || repair.status;
    repair.finalCost = req.body.finalCost || repair.finalCost;
    repair.technicianNotes = req.body.technicianNotes || repair.technicianNotes;
    res.json(await repair.save());
  } else {
    res.status(404); throw new Error('Repair job not found');
  }
});

module.exports = { getRepairs, createRepair, updateRepairStatus };