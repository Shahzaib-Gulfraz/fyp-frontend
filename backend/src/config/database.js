const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {//wo kdr ha jaha api address ad krty ha
            // These options are no longer needed in Mongoose 6+
            // but included for compatibility
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // FIX: Drop problematic indexes that cause creation failures
        try {
            const collections = await mongoose.connection.db.listCollections({ name: 'shops' }).toArray();
            if (collections.length > 0) {
                const indexExists = await mongoose.connection.collection('shops').indexExists('shop_id_1');
                if (indexExists) {
                    await mongoose.connection.collection('shops').dropIndex('shop_id_1');
                    console.log('✨ FIXED: Dropped orphaned "shop_id_1" index from shops collection');
                }
            }
        } catch (err) {
            // Index might not exist, which is fine
            console.log('Index check skipped:', err.message);
        }

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB connection error: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
