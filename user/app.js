require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const userRoutes = require('./routes/userRoutes');

const app = express();

// ✅ Middleware - Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ MongoDB Config
const MONGO_URI = process.env.MONGO_URI_USER;
const PORT = process.env.PORT_USER || 6004;

console.log('🔍 User Service Using MongoDB URI:', MONGO_URI);

if (!MONGO_URI) {
    console.error('❌ MONGO_URI_USER is undefined! Check your .env file.');
    process.exit(1);
}

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connexion MongoDB (User) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB (User)', err);
        process.exit(1);
    });

// ✅ Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Mount user routes
app.use('/users', userRoutes);

// ✅ Health check
app.get('/health', (req, res) => {
    res.json({ message: "User Service is UP and Running ✅" });
});

// ✅ Database debug
app.get('/debug/database', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const status = dbState === 1 ? "Connected ✅" : "Not Connected ❌";
    res.json({ status });
});

// ✅ Logger
app.use((req, res, next) => {
    console.log(`📩 Incoming Request → ${req.method} ${req.originalUrl}`);
    next();
});

// ✅ Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Internal Server Error:", err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

// ✅ Fallback 404
app.use((req, res) => {
    console.warn(`❌ Unmatched Route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found' });
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 User Service Running on Port ${PORT}`);
});

module.exports = app;
