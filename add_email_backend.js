const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server');
const modelsPath = path.join(serverPath, 'models');
const controllersPath = path.join(serverPath, 'controllers');
const utilsPath = path.join(serverPath, 'utils');

if (!fs.existsSync(utilsPath)) {
  fs.mkdirSync(utilsPath);
}

// 1. Create sendEmail.js
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

module.exports = sendEmail;
`;
fs.writeFileSync(path.join(utilsPath, 'sendEmail.js'), sendEmailCode);

// 2. Update Customer Model
const custFile = path.join(modelsPath, 'Customer.js');
let custContent = fs.readFileSync(custFile, 'utf8');
if (!custContent.includes('email: { type: String }')) {
  custContent = custContent.replace('phone: { type: String },', 'phone: { type: String },\n  email: { type: String },');
  fs.writeFileSync(custFile, custContent);
}

// 3. Update Sale Controller
const saleCtrlFile = path.join(controllersPath, 'saleController.js');
let saleContent = fs.readFileSync(saleCtrlFile, 'utf8');
if (!saleContent.includes('const sendEmail = require')) {
  saleContent = saleContent.replace(
    "const Product = require('../models/Product');",
    "const Product = require('../models/Product');\nconst Customer = require('../models/Customer');\nconst sendEmail = require('../utils/sendEmail');"
  );
  
  const emailLogic = `
  // Decrease stock
  for (const item of items) {
    const product = await Product.findById(item.product);
    product.stockQty -= item.quantity;
    await product.save();
  }

  // Send Email Receipt if customer has email
  if (customer) {
    try {
      const custData = await Customer.findById(customer);
      if (custData && custData.email) {
        // Fetch product names for the email
        const populatedSale = await Sale.findById(createdSale._id).populate('items.product', 'name');
        
        let itemsHtml = '<table style="width:100%; border-collapse: collapse; margin-top:10px;"><tr><th style="border-bottom:1px solid #ddd; text-align:left; padding:8px;">Item</th><th style="border-bottom:1px solid #ddd; text-align:center; padding:8px;">Qty</th><th style="border-bottom:1px solid #ddd; text-align:right; padding:8px;">Price</th></tr>';
        
        populatedSale.items.forEach(i => {
          itemsHtml += \`<tr><td style="padding:8px; border-bottom:1px solid #eee;">\${i.product ? i.product.name : 'Unknown Product'}</td><td style="text-align:center; padding:8px; border-bottom:1px solid #eee;">\${i.quantity}</td><td style="text-align:right; padding:8px; border-bottom:1px solid #eee;">$\${i.price}</td></tr>\`;
        });
        
        itemsHtml += \`<tr><td colspan="2" style="text-align:right; font-weight:bold; padding:8px;">Total:</td><td style="text-align:right; font-weight:bold; padding:8px;">$\${total}</td></tr></table>\`;

        const message = \`
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Zeesha Mobile</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.8;">Thank you for your purchase!</p>
            </div>
            <div style="padding: 20px;">
              <p>Dear <strong>\${custData.name}</strong>,</p>
              <p>Here is the digital receipt for your recent purchase at Zeesha Mobile.</p>
              \${itemsHtml}
              <p style="margin-top: 30px; text-align: center; color: #777; font-size: 12px;">We hope to see you again soon!</p>
            </div>
          </div>
        \`;

        // Send asynchronously without blocking the API response
        sendEmail({
          email: custData.email,
          subject: 'Your Purchase Receipt - Zeesha Mobile',
          message
        }).catch(err => console.log('Email send failed:', err));
      }
    } catch(err) {
      console.log('Error processing email receipt:', err);
    }
  }

  res.status(201).json(createdSale);
`;

  saleContent = saleContent.replace(
    /  \/\/ Decrease stock[\s\S]*?res\.status\(201\)\.json\(createdSale\);/,
    emailLogic.trim()
  );

  fs.writeFileSync(saleCtrlFile, saleContent);
}

// 4. Update customerController.js
const custCtrlFile = path.join(controllersPath, 'customerController.js');
let custCtrlContent = fs.readFileSync(custCtrlFile, 'utf8');
if (!custCtrlContent.includes('email: req.body.email')) {
    custCtrlContent = custCtrlContent.replace(
        "const customer = new Customer({ name, phone, address });",
        "const customer = new Customer({ name, phone, email: req.body.email, address });"
    );
    custCtrlContent = custCtrlContent.replace(
        "customer.address = req.body.address || customer.address;",
        "customer.address = req.body.address || customer.address;\n    customer.email = req.body.email || customer.email;"
    );
    fs.writeFileSync(custCtrlFile, custCtrlContent);
}

console.log('Backend Email logic injected.');
