require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/database');

async function seedAdmin() {
  try {
    // Connect to database
    await connectDB();
    console.log('📦 Connected to MongoDB');

    // Delete existing admin accounts
    const deletedCount = await User.deleteMany({ role: 'admin' });
    if (deletedCount.deletedCount > 0) {
      console.log('🗑️  Deleted', deletedCount.deletedCount, 'existing admin account(s)');
    }

    // Get admin password from environment variable or use default
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    
    // Create NEW admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@wearvirtually.com',
      password: adminPassword,
      fullName: 'Administrator',
      phone: '+92300000000',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    console.log('\n✅ Admin account created successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@wearvirtually.com');
    console.log('Username: admin');
    console.log('Password: Admin@123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  Change password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
