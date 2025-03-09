require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');

const carRoutes = require('./routes/carRoutes'); // ✅ Correct Import

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI_CAR;
const PORT = process.env.PORT_CAR || 6002;

console.log('🔍 Car Service Using MongoDB URI:', MONGO_URI);

if (!MONGO_URI) {
    console.error('❌ MONGO_URI_CAR is undefined! Check your .env file.');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connexion MongoDB (Car) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB (Car)', err);
        process.exit(1);
    });

    app.use('/cars', carRoutes);
    app.use('/', carRoutes);
    app.get('/', (req, res) => {
        res.redirect('/cars');  // ✅ Correctly Redirect to `/cars`
    });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

app.listen(PORT, () => console.log(`🚀 Car Service Running on Port ${PORT}`));

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
