# Zeesha Mobile - Mobile Shop Management System

?? **Live Application URL:** [https://zeesha-mobile-1.vercel.app](https://zeesha-mobile-1.vercel.app)

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing a mobile phone shop's operations.

## Features
- **Inventory Management**: Track mobile phones, accessories, stock levels, and low-stock alerts.
- **POS / Sales**: Complete sales process, stock auto-deduction, cart management.
- **Supplier & Purchase Management**: Restock inventory from suppliers.
- **Customer Directory**: Track customers and their purchases.
- **Repair / Service Tracking**: Manage incoming repairs, status updates, and costs.
- **Dashboard & Reports**: Sales summary, stock value, and key metrics.
- **Role-based Access Control**: 
  - **Admin**: Full access, staff management, and settings.
  - **Manager**: Inventory, purchases, and reports access.
  - **Cashier**: POS, sales, customers, and repairs access.

## Tech Stack
- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth.

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
4. Seed the database with the default Admin account:
   \`\`\`bash
   npm run data:import
   \`\`\`
5. Start the backend server:
   \`\`\`bash
   npm run dev
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

## Default Admin Credentials
- **Email**: admin@zeeshamobile.com
- **Password**: password123

