const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const { checkAPIHealth } = require('./services/checkAPIHealth.js');
const {
  verify,
  check,
  changeAdmin,
  getCurrentAdmin
} = require('./services/KYCverify.js');
const { getWalletInfoEndpoint } = require('./services/walletInfo.js');
const connectDB = require('./config/db');

const app = express();

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
  })
);

// Connect to Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(cookieParser());

// Check health
app.get('/health', checkAPIHealth);

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/transactions', require('./routes/api/transactions'));

// KYC features
app.post('/kyc-verify', verify);
app.post('/kyc-check', check);

// KYC admin routes
app.post('/kyc-change-admin', changeAdmin);
app.get('/kyc-admin', getCurrentAdmin);

// Wallet information route
app.get('/wallet-info', getWalletInfoEndpoint);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
