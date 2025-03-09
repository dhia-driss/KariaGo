require('dotenv').config({ path: __dirname + '/.env' }); // ✅ Load .env dynamically

const express = require('express');
const mongoose = require('mongoose');

const reclamationRoutes = require('./routes/reclamationRoutes');

const app = express();
app.use(express.json());

// ✅ Correctly retrieve MongoDB URI
const MONGO_URI = process.env.MONGO_URI_RECLAMATION;
const PORT = process.env.PORT_RECLAMATION || 6001;

console.log('🔍 Reclamation Service Using MongoDB URI:', MONGO_URI);

if (!MONGO_URI) {
    console.error('❌ MONGO_URI_RECLAMATION is undefined! Check your .env file.');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connexion MongoDB (Reclamation) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB (Reclamation)', err);
        process.exit(1);
    });

    app.use('/reclamations', reclamationRoutes);
    app.use('/', reclamationRoutes);
    app.get('/', (req, res) => {
        res.redirect('/reclamations');  // ✅ Correctly Redirect to `/reclamations`
    });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

app.listen(PORT, () => console.log(`🚀 Reclamation Service Running on Port ${PORT}`));

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
