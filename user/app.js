require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI_USER;
const PORT = process.env.PORT_USER || 6004;

console.log('🔍 User Service Using MongoDB URI:', MONGO_URI);

if (!MONGO_URI) {
    console.error('❌ MONGO_URI_USER is undefined! Check your .env file.');
    process.exit(1);
}

// ✅ Fix: Remove deprecated options
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connexion MongoDB (User) réussie'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB (User)', err);
        process.exit(1);
    });



// ✅ Ensure `/users` is mapped correctly
app.use('/users', userRoutes);
app.use('/', userRoutes);
app.get('/', (req, res) => {
    res.redirect('/users');  // ✅ Correctly Redirect to `/users`
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erreur serveur' });
});

app.listen(PORT, () => console.log(`🚀 User Service Running on Port ${PORT}`));
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
