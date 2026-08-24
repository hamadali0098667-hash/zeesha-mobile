# Zeesha Mobile - Mobile Shop Management System

🚀 **Live Application Links**
- **Frontend (UI):** [https://zeesha-mobile-1.vercel.app](https://zeesha-mobile-1.vercel.app)
- **Backend (API):** [https://zeesha-mobile.vercel.app](https://zeesha-mobile.vercel.app)

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing a mobile phone shop's operations.

## Features
- **Inventory Management**: Track mobile phones, accessories, stock levels, and low-stock alerts.
- **POS / Sales**: Complete sales process, stock auto-deduction, cart management, and PDF Invoice generation.
- **Supplier & Purchase Management**: Restock inventory from suppliers and adjust stock automatically.
- **Customer Directory**: Track customers and their purchases.
- **Repair / Service Tracking**: Manage incoming repairs, status updates, and costs.
- **Dashboard & Reports**: Sales summary, stock value, dynamic charts, and PDF Business Reports.
- **Role-based Access Control**: 
  - **Admin**: Full access, staff management, and system settings.
  - **Manager**: Inventory, purchases, and reports access.
  - **Cashier**: POS, sales, customers, and repairs access.
- **Customization**: Dark/Light mode, custom branding (logo, shop name, currency, sidebar preferences).

## Tech Stack
- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios, jsPDF (for reporting).
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth.

## Default Test Credentials
Use the quick login feature on the login screen or manually enter:
- **Admin**: admin@zeeshamobile.com / password123
- **Manager**: ahmed@123 / 123
- **Cashier**: ali@123 / 123

## Setup Instructions

### 1. Backend Setup
1. Open terminal and navigate to \`server\` directory:
   \`\`\`bash
   cd server
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file in the \`server\` directory with your **MongoDB Atlas URI** (see \`.env.example\`):
   \`\`\`env
   PORT=5000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/zeesha
   JWT_SECRET=supersecret123
   \`\`\`
4. Start the backend server:
   \`\`\`bash
   npm start
   \`\`\`

### 2. Frontend Setup
1. Open a new terminal and navigate to \`client\` directory:
   \`\`\`bash
   cd client
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the frontend development server:
   \`\`\`bash
   npm run dev
   \`\`\`
