const asyncHandler = require('express-async-handler');
const Setting = require('../models/Setting');

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = await Setting.create({});
  res.json(settings);
});

const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) settings = new Setting();
  
  settings.shopName = req.body.shopName || settings.shopName;
  settings.shopLogo = req.body.shopLogo !== undefined ? req.body.shopLogo : settings.shopLogo;
  settings.currency = req.body.currency || settings.currency;
  settings.invoiceFooter = req.body.invoiceFooter || settings.invoiceFooter;
  settings.categories = req.body.categories || settings.categories;
  settings.sidebarPreference = req.body.sidebarPreference || settings.sidebarPreference;
  
  await settings.save();
  res.json(settings);
});

module.exports = { getSettings, updateSettings };
