const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
            maxPoolSize: 20,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            ssl: true,
            sslValidate: true,
            sslCA: process.env.DB_CA_CERT,
            sslCert: process.env.DB_CLIENT_CERT,
            sslKey: process.env.DB_CLIENT_KEY
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB'.cyan);
});

mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`.red);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected'.yellow);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination'.cyan);
    process.exit(0);
});

// Connection tracking
let activeConnections = 0;
const MAX_CONNECTIONS = 25;

mongoose.connection.on('connected', () => {
    if(++activeConnections > MAX_CONNECTIONS) {
        throw new Error('Database connection limit exceeded');
    }
});

mongoose.connection.on('disconnected', () => activeConnections--);

module.exports = connectDB;