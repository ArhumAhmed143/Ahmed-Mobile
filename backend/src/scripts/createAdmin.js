const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const { connectDatabase } = require('../config/db');
const { Admin } = require('../models');

async function createAdminUser() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  try {
    await connectDatabase();
    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.findOneAndUpdate(
      { username },
      { $set: { username, password_hash: passwordHash } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Admin user "${username}" created or updated in MongoDB.`);
    console.log('Set ADMIN_USERNAME and ADMIN_PASSWORD before running this script in production.');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) createAdminUser();

module.exports = { createAdminUser };