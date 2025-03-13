require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');

console.log("🔍 Initializing Booking Service...");

// ✅ REGISTER ALL MODELS GLOBALLY IN MONGOOSE
require('../user/models/user');  
require('../car/models/car');
require('./models/booking');  

console.log("🔍 Models AFTER Forced Load in app.js:", mongoose.modelNames());  // ✅ Debugging

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI_BOOKING || 'mongodb://localhost:27017/bookingdb';
const PORT = process.env.PORT_BOOKING || 6003;

console.log('🔍 Booking Service Using MongoDB URI:', MONGO_URI);

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connexion MongoDB (Booking) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB (Booking)', err);
        process.exit(1);
    });

// ✅ Ensure `/bookings` is mapped correctly
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/bookings', bookingRoutes);
app.use('/', bookingRoutes);

// ✅ Health Check Route (For Gateway)
app.get('/health', (req, res) => {
    res.json({ message: "Booking Service is UP and Running ✅" });
});

// ✅ Database Debug Route (For Gateway)
app.get('/debug/database', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const status = dbState === 1 ? "Connected ✅" : "Not Connected ❌";
    res.json({ status });
});

// ✅ **Ensure Root Route Redirects to `/bookings`**
app.get('/', (req, res) => {
    res.redirect('/bookings');  // ✅ Correctly Redirect to `/bookings`
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Booking Service Running on Port ${PORT}`));

app.use((req, res, next) => {
    console.log(`📩 Incoming Request → ${req.method} ${req.originalUrl}`);
    next();
});


module.exports = app;
