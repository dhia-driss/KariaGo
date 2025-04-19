require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ Allow frontend connections

console.log("🔍 Initializing Booking Service...");

// ✅ REGISTER ALL MODELS GLOBALLY IN MONGOOSE
require('../user/models/user');  
require('../car/models/car');
require('./models/booking');  

console.log("🔍 Models AFTER Forced Load in app.js:", mongoose.modelNames());

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Support form data (optional)

// ✅ Load Environment Variables
const MONGO_URI = process.env.MONGO_URI_BOOKING || 'mongodb://localhost:27017/bookingdb';
const PORT = process.env.PORT_BOOKING || 6003;

console.log('🔍 Booking Service Using MongoDB URI:', MONGO_URI);

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connexion MongoDB (Booking) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB (Booking)', err);
        process.exit(1);
    });

// ✅ Mount Booking Routes
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/bookings', bookingRoutes); // Only expose /bookings

// ✅ Health Check Route
app.get('/health', (req, res) => {
    res.json({ message: "Booking Service is UP and Running ✅" });
});

// ✅ Database Debug Route
app.get('/debug/database', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const status = dbState === 1 ? "Connected ✅" : "Not Connected ❌";
    res.json({ status });
});

// ✅ Redirect Root to /bookings
app.get('/', (req, res) => {
    res.json({ message: "Booking Microservice Root ✅" });
});


// ✅ Request Logger
app.use((req, res, next) => {
    console.log(`📩 Incoming Request → ${req.method} ${req.originalUrl}`);
    next();
});

// ✅ Catch unmatched routes to prevent finalhandler crash
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
  

// ✅ Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Booking Service Running on Port ${PORT}`);
  });
  
module.exports = app;
