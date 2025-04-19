require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const reclamationRoutes = require('./routes/reclamationRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Load environment variables
const MONGO_URI = process.env.MONGO_URI_RECLAMATION || 'mongodb://localhost:27017/reclamationdb';
const PORT = process.env.PORT_RECLAMATION || 6001;

console.log('🔍 Reclamation Service Using MongoDB URI:', MONGO_URI);

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connexion MongoDB (Reclamation) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB (Reclamation)', err.message);
        process.exit(1);
    });

// ✅ Mount routes
app.use('/reclamations', reclamationRoutes);
app.use('/', reclamationRoutes);

// ✅ Health Check
app.get('/health', (req, res) => {
    res.json({ message: "Reclamation Service is UP and Running ✅" });
});

// ✅ Debug DB Connection
app.get('/debug/database', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const status = dbState === 1 ? "Connected ✅" : "Not Connected ❌";
    res.json({ status });
});

// ✅ Default redirect
app.get('/', (req, res) => {
    res.redirect('/reclamations');
});

// ✅ Request Logging
app.use((req, res, next) => {
    console.log(`📩 Incoming Request → ${req.method} ${req.originalUrl}`);
    next();
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🚀 Reclamation Service Running on Port ${PORT}`);
});

module.exports = app;
