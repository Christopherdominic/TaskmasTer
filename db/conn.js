const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'taskmaster', // Explicitly specify the database name
            useNewUrlParser: true,
            useUnifiedTopology: true,
	    serverSelectionTimeoutMS: 30000,		
        });
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        console.error('Connection String:', process.env.MONGO_URI);
        process.exit(1); // Exit the process on failure
    }
};

module.exports = connectDB;

