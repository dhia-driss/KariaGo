require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI_ADMIN;
const PORT = process.env.PORT_ADMIN || 6000;

console.log('🔍 Using MongoDB URI:', MONGO_URI);

if (!MONGO_URI) {
    console.error('❌ MONGO_URI_ADMIN is undefined! Check your .env file.');
    process.exit(1);
}

// ✅ Fix: Remove deprecated options
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connexion MongoDB (Admin) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB (Admin)', err);
        process.exit(1);
    });

// ✅ Ensure `/admins` is mapped correctly
app.use('/admins', adminRoutes);
app.use('/', adminRoutes);
app.get('/', (req, res) => {
    res.redirect('/admins');  // ✅ Correctly Redirect to `/admins`
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

app.listen(PORT, () => console.log(`🚀 Admin Service Running on Port ${PORT}`));

// ✅ Health Check Route
app.get('/health', (req, res) => {
    res.json({ message: "Service is UP and Running ✅" });
});

// ✅ Database Connection Status
app.get('/debug/database', async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const status = dbState === 1 ? "Connected ✅" : "Not Connected ❌";
    res.json({ status });
});

app.use((req, res, next) => {
    console.log(`📩 Incoming Request → ${req.method} ${req.originalUrl}`);
    next();
});

module.exports = app;
