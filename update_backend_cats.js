const fs = require('fs');
const path = require('path');

const root = path.join(__dirname);
const serverPath = path.join(root, 'server');
const clientPath = path.join(root, 'client', 'src');

// 1. UPDATE Setting.js Model
const settingModelFile = path.join(serverPath, 'models', 'Setting.js');
let settingModel = fs.readFileSync(settingModelFile, 'utf8');
if (!settingModel.includes('categories:')) {
  settingModel = settingModel.replace(
    "invoiceFooter: { type: String, default: 'Thank you for your business!' }",
    "invoiceFooter: { type: String, default: 'Thank you for your business!' },\n  categories: { type: [String], default: ['Smartphones', 'Feature Phones', 'Accessories', 'Spare Parts'] }"
  );
  fs.writeFileSync(settingModelFile, settingModel);
}

// 2. UPDATE settingController.js
const settingControllerFile = path.join(serverPath, 'controllers', 'settingController.js');
let settingController = fs.readFileSync(settingControllerFile, 'utf8');
if (!settingController.includes('settings.categories =')) {
  settingController = settingController.replace(
    "settings.invoiceFooter = req.body.invoiceFooter || settings.invoiceFooter;",
    "settings.invoiceFooter = req.body.invoiceFooter || settings.invoiceFooter;\n  settings.categories = req.body.categories || settings.categories;"
  );
  fs.writeFileSync(settingControllerFile, settingController);
}

console.log('Backend Settings updated for Categories.');
