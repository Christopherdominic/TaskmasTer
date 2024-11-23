const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'taskmaster', // Explicitly specify the database name
            serverSelectionTimeoutMS: 30000, // Set timeout for server selection
        });
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to the database.');
        process.exit(1); // Exit the process on failure
    }
};

module.exports = connectDB;

