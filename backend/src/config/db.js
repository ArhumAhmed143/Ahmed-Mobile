const mongoose = require('mongoose');
require('dotenv').config();

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required. Add your MongoDB Atlas connection string to backend/.env.');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

async function testConnection() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDatabase, testConnection };
