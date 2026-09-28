const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const { connectDatabase, testConnection } = require('./src/config/db');
const { authLimiter, checkoutLimiter, apiLimiter } = require('./src/middleware/rateLimitMiddleware');

const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const authRoutes = require('./src/routes/authRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const flashDealRoutes = require('./src/routes/flashDealRoutes');
const newsletterRoutes = require('./src/routes/newsletterRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security HTTP Headers Middleware (Helmet)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allows static product image access
}));

// CORS Configuration supporting local development and configured frontend origin
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy restriction'));
    }
  },
  credentials: true
}));

// Request Body Limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve Uploaded Product Images Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General API Rate Limiting
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.status(200).json({
    success: true,
    message: "Ahmed Moblie API is running safely",
    dbConnected: dbConnected
  });
});

// Mounted API Modules with Rate Limiting Controls
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', checkoutLimiter, orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/flash-deals', flashDealRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Request processing error'
    });
  }
  next();
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route not found"
  });
});

// Start accepting requests only after MongoDB is available.
connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Ahmed Moblie API server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exitCode = 1;
  });
